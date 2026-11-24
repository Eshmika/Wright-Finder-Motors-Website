import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ServiceCategory,
    RepairService,
    fetchAllCategories,
    fetchAllServices,
} from "@/Services/repairService";
import { formatDriveImageUrl } from "@/Services/vehicleService";

async function compressAndConvertToWebp(
    file: File,
    maxSizeBytes = 100 * 1024,
): Promise<{
    name: string;
    type: string;
    mimeType: string;
    base64: string;
    data: string;
}> {
    const imgBitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };
        img.src = objectUrl;
    });

    const maxDimension = 1920;
    let width = imgBitmap.naturalWidth || imgBitmap.width;
    let height = imgBitmap.naturalHeight || imgBitmap.height;

    if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
        } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas");
    ctx.drawImage(imgBitmap, 0, 0, width, height);

    let quality = 0.85;
    let blob: Blob | null = await new Promise((res) => {
        canvas.toBlob((b) => res(b), "image/webp", quality);
    });

    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && attempts < 10) {
        attempts++;
        if (quality > 0.4) {
            quality -= 0.12;
            blob = await new Promise((res) => {
                canvas.toBlob((b) => res(b), "image/webp", quality);
            });
        } else {
            width = Math.round(width * 0.85);
            height = Math.round(height * 0.85);
            canvas.width = Math.max(320, width);
            canvas.height = Math.max(240, height);
            ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);
            blob = await new Promise((res) => {
                canvas.toBlob((b) => res(b), "image/webp", quality);
            });
        }
    }

    if (!blob) {
        blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b || file)),
        );
    }

    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(",")[1]);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob!);
    });

    const originalNameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const webpFileName = `${originalNameWithoutExt}.webp`;

    return {
        name: webpFileName,
        type: "image/webp",
        mimeType: "image/webp",
        base64,
        data: base64,
    };
}

export default function Edit({ id }: { id: string }) {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [laborHours, setLaborHours] = useState("0");
    const [laborMinutes, setLaborMinutes] = useState("30");
    const [description, setDescription] = useState("");
    const [includesList, setIncludesList] = useState<string[]>([]);
    const [includeInput, setIncludeInput] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        Promise.all([fetchAllCategories(), fetchAllServices()]).then(
            ([cats, srvs]) => {
                setCategories(cats);
                const found = srvs.find(
                    (s) =>
                        s.id === id ||
                        s.name.toLowerCase() === id.toLowerCase(),
                );
                if (found) {
                    setName(found.name);
                    setCategory(found.category);
                    setPrice(
                        found.price
                            ? found.price.toString().replace(/[^0-9.]/g, "")
                            : "",
                    );
                    setDescription(found.description || "");
                    setIncludesList(found.includes || []);
                    setIsActive(found.status === "Active");
                    setExistingImageUrl(found.image || "");
                    if (found.image)
                        setImagePreview(formatDriveImageUrl(found.image));

                    // Parse labor time
                    const lt = found.laborTime || "";
                    const hrMatch = lt.match(/(\d+)\s*hr/i);
                    const minMatch = lt.match(/(\d+)\s*min/i);
                    if (hrMatch) setLaborHours(hrMatch[1]);
                    if (minMatch) setLaborMinutes(minMatch[1]);
                }
                setLoading(false);
            },
        );
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setImageFile(f);
            setImagePreview(URL.createObjectURL(f));
        }
    };

    const handleAddInclude = () => {
        if (!includeInput.trim()) return;
        setIncludesList([...includesList, includeInput.trim()]);
        setIncludeInput("");
    };

    const handleRemoveInclude = (idx: number) => {
        setIncludesList(includesList.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMsg("Service Name is required.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            let imagePayload: any = null;
            if (imageFile) {
                imagePayload = await compressAndConvertToWebp(imageFile);
            }

            let laborTimeStr = "";
            const h = parseInt(laborHours, 10) || 0;
            const m = parseInt(laborMinutes, 10) || 0;
            if (h > 0 && m > 0) {
                laborTimeStr = `${h} hr ${m} min`;
            } else if (h > 0) {
                laborTimeStr = `${h} hr`;
            } else {
                laborTimeStr = `${m} min`;
            }

            const webhookUrl =
                localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";

            const res = await fetch("/admin/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    serviceName: name.trim(),
                    category: category || "Maintenance",
                    price: price ? parseFloat(price) : 0,
                    laborTime: laborTimeStr,
                    description: description.trim(),
                    includes: includesList,
                    status: isActive ? "Active" : "Inactive",
                    image: existingImageUrl,
                    imageFile: imagePayload,
                    scriptUrl: webhookUrl.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data?.message || `Server error (${res.status})`,
                );
            }

            router.visit(route("admin.services.index"));
        } catch (err: any) {
            console.error("Save service error:", err);
            setErrorMsg(err?.message || "Failed to update service.");
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.services.index")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
                            title="Back to Services Catalog"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                    <span>Edit Service: {name || id}</span>
                                </h2>
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Google Sheet Sync
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Update pricing, labor hours, inclusions, and
                                drive image.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Service ${name} - Wright Finder Motors Admin`} />

            <div className="mx-auto space-y-6 pb-16">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-9 h-9 rounded-xl bg-purple/10 text-purple flex items-center justify-center font-bold">
                                <svg
                                    className="w-5 h-5 text-purple"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Edit Service Details
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Modify the information below to update this
                                    service in your Google Sheet.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 text-slate-800 text-xs">
                            {errorMsg && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Service Name & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Service Name{" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Category{" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                        required
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm cursor-pointer"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price & Labor Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Price ($){" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={price}
                                            onChange={(e) =>
                                                setPrice(e.target.value)
                                            }
                                            required
                                            className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-semibold shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Labor Time
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={laborHours}
                                            onChange={(e) =>
                                                setLaborHours(e.target.value)
                                            }
                                            className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm cursor-pointer"
                                        >
                                            <option value="0">0 Hours</option>
                                            <option value="1">1 Hour</option>
                                            <option value="2">2 Hours</option>
                                            <option value="3">3 Hours</option>
                                            <option value="4">4 Hours</option>
                                            <option value="5">5+ Hours</option>
                                        </select>
                                        <select
                                            value={laborMinutes}
                                            onChange={(e) =>
                                                setLaborMinutes(e.target.value)
                                            }
                                            className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm cursor-pointer"
                                        >
                                            <option value="0">0 Minutes</option>
                                            <option value="15">
                                                15 Minutes
                                            </option>
                                            <option value="30">
                                                30 Minutes
                                            </option>
                                            <option value="45">
                                                45 Minutes
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Image Uploader */}
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Service Image
                                    </label>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Auto WebP &lt;100KB Drive Upload
                                    </span>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-purple file:text-white hover:file:bg-purple cursor-pointer transition"
                                />

                                {imagePreview && (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-white max-w-sm">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview("");
                                                setExistingImageUrl("");
                                                if (fileInputRef.current)
                                                    fileInputRef.current.value =
                                                        "";
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Service Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm"
                                />
                            </div>

                            {/* Inclusions */}
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Service Includes
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={includeInput}
                                        onChange={(e) =>
                                            setIncludeInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddInclude();
                                            }
                                        }}
                                        placeholder="Add included checklist item..."
                                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddInclude}
                                        className="px-4 py-2 rounded-xl bg-dark-purple text-white text-xs font-semibold hover:bg-purple transition shadow-sm"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {includesList.length > 0 && (
                                    <ul className="space-y-1.5 pt-2">
                                        {includesList.map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-purple font-bold">
                                                        •
                                                    </span>
                                                    <span>{item}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveInclude(i)
                                                    }
                                                    className="text-slate-400 hover:text-rose-600 font-bold px-2 py-0.5"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                                <div>
                                    <span className="block font-bold text-slate-900 text-xs">
                                        Active Status
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                        Enable or disable this service from
                                        public listings.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                                        isActive
                                            ? "bg-emerald-500"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                                            isActive
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Link
                                    href={route("admin.services.index")}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shadow-sm"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Updating..."
                                        : "Update Service"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
