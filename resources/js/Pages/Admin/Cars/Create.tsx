import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

interface CarListRow {
    carName: string;
    model: string;
    trim: string;
    fuelType: string;
    bodyType: string;
    yearsSold: string;
}

// Fixed dropdown option lists
const STATUS_OPTIONS = ["Available", "Pending", "Sold"];
const TITLE_OPTIONS = ["Clean", "Rebuilt", "Lien", "Salvage", "None", "Other"];
const EXTERIOR_COLORS = [
    "White",
    "Black",
    "Silver",
    "Gray",
    "Beige",
    "Blue",
    "Red",
    "Green",
    "Brown",
    "Yellow",
    "Gold",
    "Multi-color",
    "Other",
];
const INTERIOR_COLORS = [
    "Black",
    "White",
    "Gray",
    "Beige",
    "Brown",
    "Tan",
    "Ivory/Cream",
    "Charcoal",
    "Multi-color",
    "Other",
];
const SEAT_MATERIALS = ["Leather", "Clothes"];
const ENGINE_OPTIONS = ["Standard", "Sport", "Turbo", "Heavy duty"];
const ENGINE_TYPE_SIZES = [
    "1.5L l4 Turbo",
    "2.0L l4 Turbo",
    "2.5L l4",
    "3.5L V6",
    "5.0L V8",
    "6.2L V8 Supercharged",
    "1.5L l4 Hybrid",
    "2.5L l4 Hybrid",
    "3.0L l6 Twin-Turbo",
    "Electric Motor (Single)",
    "Electric Motor (Dual AWD)",
];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT(continuously variable)"];
const DRIVELINES = ["FWD", "RWD", "AWD", "4WD"];
const POWER_OPTIONS = [
    "Keyless",
    "Key entry",
    "Key & Remote starter",
    "Keyless & Remote starter",
];
const CONDITIONS = ["New", "Pre-owned", "Used", "Salvage"];
const DRIVE_CONDITIONS = ["Runs/drives", "Run, stationed", "n/a"];

// Google Sheet URL for Car List tab
const CAR_LIST_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/export?format=csv&gid=1307580665";

// CSV parsing helper
function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = "";
        } else if ((char === "\r" || char === "\n") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") i++;
            currentRow.push(currentCell.trim());
            if (currentRow.some((c) => c !== "")) rows.push(currentRow);
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }
    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== "")) rows.push(currentRow);
    }
    return rows;
}

// Convert File to base64
function fileToBase64(file: File): Promise<{
    name: string;
    type: string;
    mimeType: string;
    base64: string;
    data: string;
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            const mimeType = file.type || "image/jpeg";
            resolve({
                name: file.name,
                type: mimeType,
                mimeType: mimeType,
                base64,
                data: base64,
            });
        };
        reader.onerror = (err) => reject(err);
    });
}

export default function Create() {
    // Car List sheet dataset
    const [carList, setCarList] = useState<CarListRow[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // Google Apps Script Webhook URL setting (stored in browser local storage for convenience)
    const [scriptWebhookUrl, setScriptWebhookUrl] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";
        }
        return "";
    });
    const [showWebhookConfig, setShowWebhookConfig] = useState(false);

    // Form fields
    const [carName, setCarName] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [trim, setTrim] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [bodyStyle, setBodyStyle] = useState("");

    const [mileage, setMileage] = useState("");
    const [vin, setVin] = useState("");
    const [status, setStatus] = useState("Available");

    // Title & custom Title
    const [title, setTitle] = useState("Clean");
    const [customTitle, setCustomTitle] = useState("");

    // Exterior Color & custom
    const [exteriorColor, setExteriorColor] = useState("White");
    const [customExteriorColor, setCustomExteriorColor] = useState("");

    // Interior Color & custom
    const [interiorColor, setInteriorColor] = useState("Black");
    const [customInteriorColor, setCustomInteriorColor] = useState("");

    const [seatMaterial, setSeatMaterial] = useState("Leather");
    const [engine, setEngine] = useState("Standard");
    const [engineTypeSize, setEngineTypeSize] = useState("1.5L l4 Turbo");
    const [transmission, setTransmission] = useState("Automatic");
    const [driveline, setDriveline] = useState("FWD");
    const [powerOptions, setPowerOptions] = useState("Keyless");
    const [condition, setCondition] = useState("Pre-owned");
    const [driveCondition, setDriveCondition] = useState("Runs/drives");

    // Interior Features list
    const [interiorFeatureInput, setInteriorFeatureInput] = useState("");
    const [interiorFeatures, setInteriorFeatures] = useState<string[]>([
        "Bluetooth",
        "Backup Camera",
    ]);

    // Pricing
    const [price, setPrice] = useState<string>("");
    const [discount, setDiscount] = useState<string>("");

    // Notes
    const [notes, setNotes] = useState("");

    // Images
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [subImageFiles, setSubImageFiles] = useState<File[]>([]);
    const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);

    // Submission states & Creative Modal Dialog states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popupModal, setPopupModal] = useState<{
        isOpen: boolean;
        type: "success" | "error" | "setup";
        title: string;
        message: string;
        details?: string;
    }>({
        isOpen: false,
        type: "success",
        title: "",
        message: "",
    });

    // Save webhook URL in localStorage
    const handleSaveWebhookUrl = (url: string) => {
        setScriptWebhookUrl(url);
        if (typeof window !== "undefined") {
            localStorage.setItem("WFM_APPS_SCRIPT_URL", url.trim());
        }
    };

    // Fetch Car List on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchCarList() {
            try {
                setIsLoadingList(true);
                const res = await fetch(CAR_LIST_CSV_URL);
                if (!res.ok) throw new Error("Failed to load Car List");
                const text = await res.text();
                const parsed = parseCsv(text);
                if (parsed.length > 1) {
                    const headers = parsed[0].map((h) => h.toLowerCase());
                    const nameIdx = headers.findIndex((h) =>
                        h.includes("car name"),
                    );
                    const modelIdx = headers.findIndex((h) => h === "model");
                    const trimIdx = headers.findIndex((h) => h === "trim");
                    const fuelIdx = headers.findIndex((h) =>
                        h.includes("fuel"),
                    );
                    const bodyIdx = headers.findIndex((h) =>
                        h.includes("body"),
                    );
                    const yearsIdx = headers.findIndex((h) =>
                        h.includes("year"),
                    );

                    const rows: CarListRow[] = [];
                    for (let i = 1; i < parsed.length; i++) {
                        const r = parsed[i];
                        if (!r || r.length === 0) continue;
                        const cName =
                            nameIdx !== -1 ? r[nameIdx]?.trim() || "" : "";
                        const cModel =
                            modelIdx !== -1 ? r[modelIdx]?.trim() || "" : "";
                        if (!cName && !cModel) continue;

                        rows.push({
                            carName: cName,
                            model: cModel,
                            trim:
                                trimIdx !== -1 ? r[trimIdx]?.trim() || "" : "",
                            fuelType:
                                fuelIdx !== -1 ? r[fuelIdx]?.trim() || "" : "",
                            bodyType:
                                bodyIdx !== -1 ? r[bodyIdx]?.trim() || "" : "",
                            yearsSold:
                                yearsIdx !== -1
                                    ? r[yearsIdx]?.trim() || ""
                                    : "",
                        });
                    }
                    if (isMounted) setCarList(rows);
                }
            } catch (err) {
                console.error("Error fetching Car List:", err);
            } finally {
                if (isMounted) setIsLoadingList(false);
            }
        }
        fetchCarList();
        return () => {
            isMounted = false;
        };
    }, []);

    // Unique Car Names (Makes)
    const availableMakes = useMemo(() => {
        const set = new Set<string>();
        carList.forEach((r) => {
            if (r.carName) set.add(r.carName);
        });
        return Array.from(set).sort();
    }, [carList]);

    // Models for selected Make
    const availableModels = useMemo(() => {
        if (!carName) return [];
        const set = new Set<string>();
        carList
            .filter((r) => r.carName.toLowerCase() === carName.toLowerCase())
            .forEach((r) => {
                if (r.model) set.add(r.model);
            });
        return Array.from(set).sort();
    }, [carList, carName]);

    // Row corresponding to selected Make and Model
    const selectedCarRow = useMemo(() => {
        if (!carName || !model) return null;
        return (
            carList.find(
                (r) =>
                    r.carName.toLowerCase() === carName.toLowerCase() &&
                    r.model.toLowerCase() === model.toLowerCase(),
            ) || null
        );
    }, [carList, carName, model]);

    // Years parsed and expanded for selected Make + Model
    const availableYears = useMemo(() => {
        if (!selectedCarRow || !selectedCarRow.yearsSold) {
            const currentYear = new Date().getFullYear();
            const years: string[] = [];
            for (let y = currentYear; y >= currentYear - 30; y--) {
                years.push(y.toString());
            }
            return years;
        }

        const currentCalYear = new Date().getFullYear();
        const yearsSoldStr = selectedCarRow.yearsSold;
        const yearsSet = new Set<number>();

        const parts = yearsSoldStr.split(/[,;]/).map((p) => p.trim());
        parts.forEach((part) => {
            const rangeMatch = part.match(
                /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i,
            );
            if (rangeMatch) {
                const startY = parseInt(rangeMatch[1], 10);
                const endY =
                    rangeMatch[2].toLowerCase().includes("present") ||
                    rangeMatch[2].toLowerCase().includes("current")
                        ? currentCalYear
                        : parseInt(rangeMatch[2], 10);

                if (!isNaN(startY) && !isNaN(endY)) {
                    const min = Math.min(startY, endY);
                    const max = Math.max(startY, endY);
                    for (let y = max; y >= min; y--) {
                        yearsSet.add(y);
                    }
                }
            } else {
                const singleY = parseInt(part.replace(/[^0-9]/g, ""), 10);
                if (
                    !isNaN(singleY) &&
                    singleY >= 1950 &&
                    singleY <= currentCalYear + 2
                ) {
                    yearsSet.add(singleY);
                }
            }
        });

        if (yearsSet.size === 0) {
            for (let y = currentCalYear; y >= currentCalYear - 25; y--) {
                yearsSet.add(y);
            }
        }

        return Array.from(yearsSet)
            .sort((a, b) => b - a)
            .map((y) => y.toString());
    }, [selectedCarRow]);

    // Trims for selected Make + Model
    const availableTrims = useMemo(() => {
        if (!selectedCarRow || !selectedCarRow.trim) return ["Base"];
        const parts = selectedCarRow.trim
            .split(/[/|,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        return parts.length > 0 ? Array.from(new Set(parts)) : ["Base"];
    }, [selectedCarRow]);

    // Fuel Types for selected Make + Model
    const availableFuelTypes = useMemo(() => {
        if (!selectedCarRow || !selectedCarRow.fuelType) {
            return ["Gasoline", "Hybrid", "Electric", "Diesel"];
        }
        const parts = selectedCarRow.fuelType
            .split(/[/|,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        return parts.length > 0
            ? Array.from(new Set(parts))
            : ["Gasoline", "Hybrid", "Electric", "Diesel"];
    }, [selectedCarRow]);

    // Body Styles for selected Make + Model
    const availableBodyStyles = useMemo(() => {
        if (!selectedCarRow || !selectedCarRow.bodyType) {
            return ["Sedan", "SUV", "Coupe", "Hatchback", "Truck", "Minivan"];
        }
        const parts = selectedCarRow.bodyType
            .split(/[/|,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        return parts.length > 0
            ? Array.from(new Set(parts))
            : ["Sedan", "SUV", "Coupe", "Hatchback", "Truck"];
    }, [selectedCarRow]);

    // When Make changes, auto-select first available Model
    const handleMakeChange = (val: string) => {
        setCarName(val);
        const models = Array.from(
            new Set(
                carList
                    .filter(
                        (r) => r.carName.toLowerCase() === val.toLowerCase(),
                    )
                    .map((r) => r.model)
                    .filter(Boolean),
            ),
        ).sort();
        const nextModel = models[0] || "";
        setModel(nextModel);
    };

    // Auto-update dependent fields when Make or Model changes
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(year)) {
            setYear(availableYears[0]);
        }
        if (availableTrims.length > 0 && !availableTrims.includes(trim)) {
            setTrim(availableTrims[0]);
        }
        if (
            availableFuelTypes.length > 0 &&
            !availableFuelTypes.includes(fuelType)
        ) {
            setFuelType(availableFuelTypes[0]);
        }
        if (
            availableBodyStyles.length > 0 &&
            !availableBodyStyles.includes(bodyStyle)
        ) {
            setBodyStyle(availableBodyStyles[0]);
        }
    }, [
        carName,
        model,
        availableYears,
        availableTrims,
        availableFuelTypes,
        availableBodyStyles,
    ]);

    // Auto-generated Car ID calculation
    const [randomSuffix, setRandomSuffix] = useState<number>(() =>
        Math.floor(Math.random() * 100),
    );

    const generatedCarId = useMemo(() => {
        const makeInitial = carName
            ? carName.trim().charAt(0).toUpperCase()
            : "X";
        const modelInitial = model ? model.trim().charAt(0).toUpperCase() : "X";
        const yearDigits = year && year.length >= 2 ? year.slice(-2) : "26";
        const padRandom =
            randomSuffix < 10 ? `0${randomSuffix}` : `${randomSuffix}`;
        return `${makeInitial}${modelInitial}${yearDigits}-${padRandom}`;
    }, [carName, model, year, randomSuffix]);

    // Refresh random ID suffix
    const handleRegenerateId = () => {
        setRandomSuffix(Math.floor(Math.random() * 100));
    };

    // Calculate creative Discount preview
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
    const numDiscount = parseFloat(discount.replace(/[^0-9.]/g, "")) || 0;
    const finalCalculatedPrice =
        numPrice > 0 ? Math.max(0, numPrice - numDiscount) : 0;
    const discountPercentage =
        numPrice > 0 && numDiscount > 0
            ? Math.round((numDiscount / numPrice) * 100)
            : 0;

    // Handle Mileage formatting (Max 6 digits e.g. 016,325)
    const handleMileageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9,]/g, "");
        if (raw.length <= 7) {
            setMileage(raw);
        }
    };

    // Handle VIN input (Max 17 alphanumeric chars)
    const handleVinChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 17);
        setVin(raw);
    };

    // Add Interior Feature item
    const handleAddFeature = () => {
        const trimmed = interiorFeatureInput.trim();
        if (trimmed && !interiorFeatures.includes(trimmed)) {
            setInteriorFeatures([...interiorFeatures, trimmed]);
            setInteriorFeatureInput("");
        }
    };

    // Remove Interior Feature item
    const handleRemoveFeature = (item: string) => {
        setInteriorFeatures(interiorFeatures.filter((f) => f !== item));
    };

    // Handle Main Image selection
    const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle Sub Images selection
    const handleSubImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setSubImageFiles((prev) => [...prev, ...files]);
            const newPreviews = files.map((f) => URL.createObjectURL(f));
            setSubImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveSubImage = (index: number) => {
        setSubImageFiles(subImageFiles.filter((_, i) => i !== index));
        setSubImagePreviews(subImagePreviews.filter((_, i) => i !== index));
    };

    // Generate formatted timestamp string: "M/D/YYYY HH:mm:ss"
    const getFormattedTimestamp = () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const yr = now.getFullYear();
        const hrs = String(now.getHours()).padStart(2, "0");
        const mins = String(now.getMinutes()).padStart(2, "0");
        const secs = String(now.getSeconds()).padStart(2, "0");
        return `${month}/${day}/${yr} ${hrs}:${mins}:${secs}`;
    };

    // Form Submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const timestamp = getFormattedTimestamp();

            const resolvedTitle =
                title === "Other" && customTitle.trim()
                    ? customTitle.trim()
                    : title;
            const resolvedExteriorColor =
                exteriorColor === "Other" && customExteriorColor.trim()
                    ? customExteriorColor.trim()
                    : exteriorColor;
            const resolvedInteriorColor =
                interiorColor === "Other" && customInteriorColor.trim()
                    ? customInteriorColor.trim()
                    : interiorColor;
            const resolvedFeatures = interiorFeatures.join(", ");

            let mainImagePayload: any = null;
            if (mainImageFile) {
                mainImagePayload = await fileToBase64(mainImageFile);
            }

            const subImagesPayload: any[] = [];
            for (const file of subImageFiles) {
                const subObj = await fileToBase64(file);
                subImagesPayload.push(subObj);
            }

            const payload = {
                timestamp,
                carId: generatedCarId,
                carName,
                model,
                year,
                mileage,
                price: numPrice ? numPrice.toString() : "",
                discount: numDiscount ? numDiscount.toString() : "",
                vin,
                status,
                title: resolvedTitle,
                trim,
                bodyStyle,
                rentOrSell: "Sell",
                engine,
                engineTypeSize,
                transmission,
                driveline,
                fuelType,
                powerOptions,
                driveCondition,
                condition,
                seatMaterial,
                interiorColor: resolvedInteriorColor,
                exteriorColor: resolvedExteriorColor,
                interiorFeatures: resolvedFeatures,
                interiorFeaturesStr: resolvedFeatures,
                notes,
                mainImage: mainImagePayload,
                mainImages: mainImagePayload ? [mainImagePayload] : [],
                subImages: subImagesPayload,
                scriptUrl: scriptWebhookUrl.trim(),
            };

            const res = await fetch("/admin/cars", {
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
                body: JSON.stringify(payload),
            });

            const rawText = await res.text();
            let data: any = null;
            try {
                data = JSON.parse(rawText);
            } catch (pErr) {
                console.error("Non-JSON server response:", rawText);
                throw new Error(
                    `Server returned invalid JSON (${res.status}): ${rawText.slice(0, 150)}`,
                );
            }

            if (!res.ok) {
                if (data?.status === "need_webhook") {
                    setShowWebhookConfig(true);
                    setPopupModal({
                        isOpen: true,
                        type: "setup",
                        title: "Google Apps Script Webhook Required",
                        message:
                            "To save data directly into your Google Sheet and upload photos to Google Drive, the Google Apps Script Web App URL must be configured.",
                        details:
                            "Follow the quick 2-minute steps shown below to paste your Web App URL.",
                    });
                    return;
                }
                throw new Error(
                    data?.message || `Server error (${res.status})`,
                );
            }

            if (data?.status === "success") {
                setPopupModal({
                    isOpen: true,
                    type: "success",
                    title: "Vehicle Saved to Google Sheet!",
                    message: `Vehicle ${generatedCarId} (${carName} ${model} ${year}) was saved directly to the last row of the "Vehicle details" tab.`,
                    details: `Timestamp: ${timestamp} | Price: $${finalCalculatedPrice.toLocaleString()}`,
                });

                // Regenerate suffix for the next entry
                setRandomSuffix(Math.floor(Math.random() * 100));
            } else {
                console.error("Unexpected response payload:", data);
                throw new Error(
                    data?.message ||
                        (typeof data === "string"
                            ? data
                            : JSON.stringify(data)) ||
                        "Unexpected response from server.",
                );
            }
        } catch (err: any) {
            console.error("Save error:", err);

            setPopupModal({
                isOpen: true,
                type: "error",
                title: "Failed to Save Vehicle",
                message:
                    err.message ||
                    "Could not write vehicle data to the Google Sheet. Please check the Webhook URL and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span>Add New Car</span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Google Sheet Sync
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Auto-syncs into "Vehicle details" tab and uploads
                            images to Wright Finder Motors Google Drive.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Webhook Sync status pill */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowWebhookConfig(!showWebhookConfig)
                            }
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm bg-white hover:bg-slate-50 border-gray-200 text-slate-700"
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    scriptWebhookUrl
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-amber-400"
                                }`}
                            />
                            <span>
                                {scriptWebhookUrl
                                    ? "Google Sync Configured"
                                    : "Setup Google Sync"}
                            </span>
                        </button>

                        {/* Auto-generated Car ID Banner */}
                        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-2xl shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Car ID:
                            </span>
                            <span className="text-sm font-black text-vivid-red tracking-wider">
                                {generatedCarId}
                            </span>
                            <button
                                type="button"
                                onClick={handleRegenerateId}
                                title="Regenerate Random Suffix"
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Add New Car - Wright Finder Motors Admin" />

            {/* CREATIVE MODAL POPUP ALERT BOX */}
            {popupModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 transform transition-all animate-scale-up relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Accent Gradient Bar */}
                        <div
                            className={`absolute top-0 left-0 right-0 h-2 ${
                                popupModal.type === "success"
                                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                    : popupModal.type === "setup"
                                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                      : "bg-gradient-to-r from-vivid-red to-rose-600"
                            }`}
                        />

                        {/* Modal Icon Badge */}
                        <div className="flex items-center justify-center mb-5">
                            {popupModal.type === "success" && (
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}

                            {popupModal.type === "error" && (
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-vivid-red flex items-center justify-center shadow-inner">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            )}

                            {popupModal.type === "setup" && (
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shadow-inner">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Modal Text Content */}
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {popupModal.title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {popupModal.message}
                            </p>
                            {popupModal.details && (
                                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mt-2 font-mono">
                                    {popupModal.details}
                                </p>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                            {popupModal.type === "setup" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPopupModal({
                                            ...popupModal,
                                            isOpen: false,
                                        });
                                        setShowWebhookConfig(true);
                                    }}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition"
                                >
                                    Open Webhook Setup
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    setPopupModal({
                                        ...popupModal,
                                        isOpen: false,
                                    })
                                }
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                    popupModal.type === "success"
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : popupModal.type === "error"
                                          ? "bg-vivid-red hover:bg-red-700 text-white"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                            >
                                {popupModal.type === "success"
                                    ? "Done & Continue"
                                    : "Close"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK WEBHOOK SETUP BANNER / DRAWER */}
            {showWebhookConfig && (
                <div className="mb-6 p-6 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-sm animate-fade-in">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                <h4 className="text-sm font-bold text-slate-900">
                                    Google Apps Script Web App Deployment URL
                                </h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                                Paste your deployed Google Apps Script Web App
                                URL below. When you click{" "}
                                <strong>Save Vehicle</strong>, data is forwarded
                                directly to your Google Sheet "Vehicle details"
                                tab and photos are uploaded to your shared
                                Google Drive folder.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowWebhookConfig(false)}
                            className="p-1 hover:bg-amber-100 rounded-lg text-slate-500 hover:text-slate-800"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <input
                            type="url"
                            value={scriptWebhookUrl}
                            onChange={(e) =>
                                handleSaveWebhookUrl(e.target.value)
                            }
                            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-vivid-red shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                handleSaveWebhookUrl(scriptWebhookUrl);
                                setPopupModal({
                                    isOpen: true,
                                    type: "success",
                                    title: "Webhook URL Saved",
                                    message:
                                        "Google Apps Script connection URL updated in your system.",
                                });
                            }}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm shrink-0"
                        >
                            Save URL
                        </button>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                            Ready code available in:{" "}
                            <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono text-[10px]">
                                google-apps-script.js
                            </code>
                        </span>
                        <a
                            href="https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/edit"
                            target="_blank"
                            rel="noreferrer"
                            className="text-vivid-red hover:underline font-semibold"
                        >
                            Open Google Sheet ↗
                        </a>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-16">
                {/* SECTION 1: VEHICLE IDENTITY (Make, Model, Year, Trim, Body, Fuel) */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-vivid-red flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Vehicle Specification
                            </h3>
                            <p className="text-xs text-slate-500">
                                Powered by Google Sheet "Car List" tab
                                auto-filters.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* 1. Make (Car Name) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Car Name (Make){" "}
                                <span className="text-vivid-red">*</span>
                            </label>
                            <select
                                value={carName}
                                onChange={(e) =>
                                    handleMakeChange(e.target.value)
                                }
                                required
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                <option value="">Select Make</option>
                                {availableMakes.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            {isLoadingList && (
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Loading makes from Car List...
                                </span>
                            )}
                        </div>

                        {/* 2. Model */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Model <span className="text-vivid-red">*</span>
                            </label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                required
                                disabled={!carName}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                            >
                                <option value="">Select Model</option>
                                {availableModels.map((md) => (
                                    <option key={md} value={md}>
                                        {md}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Year */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Year <span className="text-vivid-red">*</span>
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {availableYears.map((yr) => (
                                    <option key={yr} value={yr}>
                                        {yr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Trim */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Trim
                            </label>
                            <select
                                value={trim}
                                onChange={(e) => setTrim(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {availableTrims.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Fuel Type */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Fuel Type
                            </label>
                            <select
                                value={fuelType}
                                onChange={(e) => setFuelType(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {availableFuelTypes.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 6. Body Style */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Body Style
                            </label>
                            <select
                                value={bodyStyle}
                                onChange={(e) => setBodyStyle(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {availableBodyStyles.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: IDENTITY & STATUS (Mileage, VIN, Status, Title, Colors) */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Identity & Status
                            </h3>
                            <p className="text-xs text-slate-500">
                                Odometer readings, 17-digit VIN, title
                                conditions, and colorways.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Mileage (Limit 6 digits e.g. 016,325) */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Mileage
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    Ex: 016,325
                                </span>
                            </div>
                            <input
                                type="text"
                                value={mileage}
                                onChange={handleMileageChange}
                                placeholder="016,325"
                                maxLength={7}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            />
                        </div>

                        {/* VIN (17 Characters) */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    VIN (17 chars)
                                </label>
                                <span className="text-[10px] text-vivid-red font-mono font-bold">
                                    {vin.length}/17
                                </span>
                            </div>
                            <input
                                type="text"
                                value={vin}
                                onChange={handleVinChange}
                                placeholder="1HGCR2F83HA000000"
                                maxLength={17}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-mono uppercase shadow-sm"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {STATUS_OPTIONS.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title (Clean, Rebuilt, Lien, Salvage, None, Other) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Title Status
                            </label>
                            <select
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {TITLE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            {title === "Other" && (
                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) =>
                                        setCustomTitle(e.target.value)
                                    }
                                    placeholder="Enter custom Title..."
                                    className="mt-2 w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vivid-red"
                                />
                            )}
                        </div>

                        {/* Exterior Color */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Exterior Color
                            </label>
                            <select
                                value={exteriorColor}
                                onChange={(e) =>
                                    setExteriorColor(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {EXTERIOR_COLORS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {exteriorColor === "Other" && (
                                <input
                                    type="text"
                                    value={customExteriorColor}
                                    onChange={(e) =>
                                        setCustomExteriorColor(e.target.value)
                                    }
                                    placeholder="Enter custom Exterior Color..."
                                    className="mt-2 w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vivid-red"
                                />
                            )}
                        </div>

                        {/* Interior Color */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Interior Color
                            </label>
                            <select
                                value={interiorColor}
                                onChange={(e) =>
                                    setInteriorColor(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {INTERIOR_COLORS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {interiorColor === "Other" && (
                                <input
                                    type="text"
                                    value={customInteriorColor}
                                    onChange={(e) =>
                                        setCustomInteriorColor(e.target.value)
                                    }
                                    placeholder="Enter custom Interior Color..."
                                    className="mt-2 w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vivid-red"
                                />
                            )}
                        </div>

                        {/* Seat Material */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Seat Material
                            </label>
                            <select
                                value={seatMaterial}
                                onChange={(e) =>
                                    setSeatMaterial(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {SEAT_MATERIALS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle Overall Condition */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Overall Condition
                            </label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {CONDITIONS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Drive Condition */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Drive Condition
                            </label>
                            <select
                                value={driveCondition}
                                onChange={(e) =>
                                    setDriveCondition(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {DRIVE_CONDITIONS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: POWER & DRIVETRAIN */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Power & Performance
                            </h3>
                            <p className="text-xs text-slate-500">
                                Engine classifications, driveline, gearbox, and
                                access methods.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Engine */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Engine
                            </label>
                            <select
                                value={engine}
                                onChange={(e) => setEngine(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {ENGINE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Engine Type / Size */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Engine Type / Size
                            </label>
                            <select
                                value={engineTypeSize}
                                onChange={(e) =>
                                    setEngineTypeSize(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {ENGINE_TYPE_SIZES.map((ets) => (
                                    <option key={ets} value={ets}>
                                        {ets}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Transmission */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Transmission
                            </label>
                            <select
                                value={transmission}
                                onChange={(e) =>
                                    setTransmission(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {TRANSMISSIONS.map((tr) => (
                                    <option key={tr} value={tr}>
                                        {tr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Driveline */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Driveline
                            </label>
                            <select
                                value={driveline}
                                onChange={(e) => setDriveline(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {DRIVELINES.map((dl) => (
                                    <option key={dl} value={dl}>
                                        {dl}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Power Options */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Power Options
                            </label>
                            <select
                                value={powerOptions}
                                onChange={(e) =>
                                    setPowerOptions(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            >
                                {POWER_OPTIONS.map((po) => (
                                    <option key={po} value={po}>
                                        {po}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: INTERIOR FEATURES LIST */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Interior Features
                            </h3>
                            <p className="text-xs text-slate-500">
                                Add as many equipment features as needed.
                                Automatically saved comma-divided into the
                                sheet.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={interiorFeatureInput}
                                onChange={(e) =>
                                    setInteriorFeatureInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddFeature();
                                    }
                                }}
                                placeholder="Type feature (e.g. Heated Seats, Apple CarPlay, Sunroof)..."
                                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="px-4 py-2.5 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold shadow-md transition"
                            >
                                + Add Feature
                            </button>
                        </div>

                        {/* List tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {interiorFeatures.map((feat) => (
                                <span
                                    key={feat}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                                >
                                    <span>{feat}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveFeature(feat)
                                        }
                                        className="text-slate-400 hover:text-rose-500 ml-1 font-bold"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                            {interiorFeatures.length === 0 && (
                                <span className="text-xs text-slate-400 italic">
                                    No interior features added yet.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 5: PRICING & DISCOUNT SECTION */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Pricing & Valuation
                            </h3>
                            <p className="text-xs text-slate-500">
                                Enter base price and discount to see real-time
                                showroom calculations.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* Price */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Price ($){" "}
                                <span className="text-vivid-red">*</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="7000"
                                required
                                min="0"
                                step="any"
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            />
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Discount ($)
                            </label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                placeholder="2000"
                                min="0"
                                step="any"
                                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            />
                        </div>

                        {/* Creative Discount Preview Display */}
                        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 shadow-inner">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                Showroom Selling Price (Price - Discount)
                            </span>
                            <div className="flex items-baseline space-x-3 mt-1.5">
                                <span className="text-2xl font-black text-emerald-600 tracking-tight">
                                    ${finalCalculatedPrice.toLocaleString()}
                                </span>
                                {numDiscount > 0 && numPrice > 0 && (
                                    <>
                                        <span className="text-xs text-slate-400 line-through">
                                            ${numPrice.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-bold bg-rose-50 text-vivid-red border border-rose-200 px-1.5 py-0.5 rounded">
                                            -{discountPercentage}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Saves ${numDiscount.toLocaleString()} for the
                                customer
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECTION 6: GOOGLE DRIVE IMAGE UPLOADS */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-vivid-red flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Google Drive Photo Gallery
                            </h3>
                            <p className="text-xs text-slate-500">
                                Uploaded directly to Wright Finder Motors Drive
                                and stored in "Main Image URLs" & "Sub Image
                                URLs".
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Main Image (Single) */}
                        <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/60">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Main Image URL (Hero Image)
                            </label>
                            <p className="text-[11px] text-slate-500 mb-3">
                                Upload one high-resolution primary photo for the
                                catalog banner and hero thumbnail.
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-vivid-red file:text-white hover:file:bg-red-600 cursor-pointer"
                            />

                            {mainImagePreview && (
                                <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-300 h-40 bg-slate-100">
                                    <img
                                        src={mainImagePreview}
                                        alt="Main Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMainImageFile(null);
                                            setMainImagePreview("");
                                        }}
                                        className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-lg text-xs"
                                        title="Remove photo"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Sub Images (Multiple) */}
                        <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/60">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Sub Image URLs (Gallery Photos)
                            </label>
                            <p className="text-[11px] text-slate-500 mb-3">
                                Upload multiple secondary photos (interior,
                                engine, trims). Saved comma-divided into the
                                sheet.
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleSubImagesChange}
                                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
                            />

                            {subImagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto">
                                    {subImagePreviews.map((preview, idx) => (
                                        <div
                                            key={idx}
                                            className="relative rounded-lg overflow-hidden border border-gray-300 h-20 bg-slate-100"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Sub ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveSubImage(idx)
                                                }
                                                className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-0.5 rounded text-[10px]"
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 7: NOTES */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
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
                                NOTES
                            </h3>
                            <p className="text-xs text-slate-500">
                                Additional internal remarks, inspection history,
                                or customer comments saved in "NOTES" column.
                            </p>
                        </div>
                    </div>

                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type any special notes, history, or remarks regarding this vehicle..."
                        className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3.5 rounded-2xl bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-vivid-red hover:bg-red-600 text-white text-sm font-bold shadow-xl shadow-vivid-red/30 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                <span>Saving to Google Sheet...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Save Vehicle</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
