import React, { useState, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, Link } from "@inertiajs/react";
import { PRESET_CATEGORY_ICONS } from "@/Services/repairService";

export default function CreateCategory() {
    const [name, setName] = useState("");
    const [selectedPreset, setSelectedPreset] = useState("Maintenance");
    const [svgIconContent, setSvgIconContent] = useState("");
    const [svgFileName, setSvgFileName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"Active" | "Inactive">("Active");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (
            !file.name.toLowerCase().endsWith(".svg") &&
            file.type !== "image/svg+xml"
        ) {
            setError("Please upload an SVG file only (.svg format).");
            return;
        }

        setError(null);
        setSvgFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setSvgIconContent(result);
        };
        reader.readAsText(file);
    };

    const handleRemoveSvg = () => {
        setSvgIconContent("");
        setSvgFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // If custom SVG is uploaded, use it; otherwise fallback to selected preset icon
        const iconPayload = svgIconContent.trim()
            ? svgIconContent.trim()
            : selectedPreset;

        try {
            const webhookUrl = localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";

            const res = await fetch("/admin/categories", {
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
                    categoryName: name.trim(),
                    categoryIcon: iconPayload,
                    description: description.trim(),
                    status: status,
                    scriptUrl: webhookUrl.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || `Server error (${res.status})`);
            }

            router.visit(route("admin.services.index"));
        } catch (err: any) {
            setError(err.message || "Error communicating with Google Sheet.");
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
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <span>Add Service Category</span>
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Google Sheet Sync
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Create a new category for grouping repair and
                                maintenance services.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Add Service Category - Wright Finder Motors Admin" />

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
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Category Details
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Specify the category name, icon, and display
                                    options.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6 text-slate-800 text-xs">
                            {/* Category Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Category Name{" "}
                                    <span className="text-vivid-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Brakes, Transmission, Engine"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm"
                                />
                            </div>

                            {/* Category Icon: Custom SVG Uploader */}
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Category Icon (Upload Custom SVG)
                                    </label>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple/10 text-purple border border-purple/20">
                                        SVG Vector Format
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".svg,image/svg+xml"
                                        onChange={handleSvgUpload}
                                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-purple file:text-white hover:file:bg-purple cursor-pointer transition shadow-xs"
                                    />

                                    {/* SVG Live Preview Box */}
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                                            {svgIconContent ? (
                                                <div
                                                    className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                                    dangerouslySetInnerHTML={{
                                                        __html: svgIconContent,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-6 h-6 flex items-center justify-center text-slate-400 [&>svg]:w-full [&>svg]:h-full"
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            PRESET_CATEGORY_ICONS[
                                                                selectedPreset
                                                            ]?.svg ||
                                                            PRESET_CATEGORY_ICONS[
                                                                "Maintenance"
                                                            ].svg,
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {svgFileName && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveSvg}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="Remove uploaded SVG"
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
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {svgFileName ? (
                                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                                        <svg
                                            className="w-3.5 h-3.5 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>
                                            Custom SVG &quot;{svgFileName}&quot;
                                            loaded
                                        </span>
                                    </p>
                                ) : (
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                        <span>
                                            Upload your custom SVG icon above,
                                            or select a default preset icon:
                                        </span>
                                        <select
                                            value={selectedPreset}
                                            onChange={(e) =>
                                                setSelectedPreset(
                                                    e.target.value,
                                                )
                                            }
                                            className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-purple cursor-pointer shadow-2xs"
                                        >
                                            {Object.keys(
                                                PRESET_CATEGORY_ICONS,
                                            ).map((preset) => (
                                                <option
                                                    key={preset}
                                                    value={preset}
                                                >
                                                    Preset: {preset}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Brief description of the services categorized under this group..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple transition font-medium shadow-sm resize-none"
                                />
                            </div>

                            {/* Active Toggle Switch */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                                <div>
                                    <span className="block font-bold text-slate-900 text-xs">
                                        Active Status
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                        Show this category in public views and
                                        service selectors.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setStatus(
                                            status === "Active"
                                                ? "Inactive"
                                                : "Active",
                                        )
                                    }
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                                        status === "Active"
                                            ? "bg-emerald-500"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                                            status === "Active"
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Link
                                    href={route("admin.services.index")}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shadow-sm"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <span>
                                        {isSubmitting
                                            ? "Saving..."
                                            : "Save Category"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
