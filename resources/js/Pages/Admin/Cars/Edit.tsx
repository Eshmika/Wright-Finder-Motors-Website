import {
    useState,
    useEffect,
    useMemo,
    useRef,
    ChangeEvent,
    FormEvent,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    DetailedVehicle,
    fetchAllVehicles,
    formatDriveImageUrl,
} from "@/Services/vehicleService";
import { parseMileage } from "@/Utils/mileage";

interface EditProps {
    id: string;
    hasGoogleAppsScriptUrl?: boolean;
}

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

// Compress and convert image to WebP format (< 100 KB)
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
    if (!ctx) {
        throw new Error(
            "Could not initialize 2D canvas context for image compression",
        );
    }
    ctx.drawImage(imgBitmap, 0, 0, width, height);

    let quality = 0.85;
    let blob: Blob | null = null;

    const getCanvasBlob = (q: number): Promise<Blob | null> => {
        return new Promise((res) => {
            canvas.toBlob((b) => res(b), "image/webp", q);
        });
    };

    blob = await getCanvasBlob(quality);

    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && attempts < 10) {
        attempts++;
        if (quality > 0.4) {
            quality -= 0.12;
            blob = await getCanvasBlob(quality);
        } else {
            width = Math.round(width * 0.85);
            height = Math.round(height * 0.85);
            canvas.width = Math.max(320, width);
            canvas.height = Math.max(240, height);
            ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);
            blob = await getCanvasBlob(quality);
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

// Convert various date strings (e.g., "MM/DD/YYYY", "YYYY-MM-DD", "M/D/YY") to standard ISO "YYYY-MM-DD" for <input type="date">
function parseDateToIso(str: string): string {
    if (!str) return "";
    const trimmed = str.trim();
    if (!trimmed) return "";

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // Matches MM/DD/YYYY or M/D/YYYY
    const slashMatch = trimmed.match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/,
    );
    if (slashMatch) {
        const m = slashMatch[1].padStart(2, "0");
        const d = slashMatch[2].padStart(2, "0");
        let y = slashMatch[3];
        if (y.length === 2) {
            y = parseInt(y, 10) > 50 ? `19${y}` : `20${y}`;
        }
        return `${y}-${m}-${d}`;
    }

    // Try standard JS Date parsing as fallback
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    return "";
}

// Format phone numbers gracefully as user types (e.g. +1 (555) 000-0000 or (555) 000-0000)
function formatPhoneNumber(value: string): string {
    if (!value) return "";
    // Keep digits only
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    // If starts with 1 and length > 10, handle leading country code +1
    if (digits.length > 10 && digits.startsWith("1")) {
        const d = digits.slice(1);
        if (d.length <= 3) {
            return `+1 (${d}`;
        }
        if (d.length <= 6) {
            return `+1 (${d.slice(0, 3)}) ${d.slice(3)}`;
        }
        return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
    }

    // Standard 10-digit format
    if (digits.length <= 3) {
        return `(${digits}`;
    }
    if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export default function Edit({ id, hasGoogleAppsScriptUrl }: EditProps) {
    // Initial fetch state
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [initialVehicle, setInitialVehicle] =
        useState<DetailedVehicle | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Active Gallery preview tab / index for the top Hero View panel
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    // Car List dataset from Google Sheets
    const [carList, setCarList] = useState<CarListRow[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // Google Apps Script Webhook URL setting
    const [scriptWebhookUrl, setScriptWebhookUrl] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";
        }
        return "";
    });
    const [showWebhookConfig, setShowWebhookConfig] = useState(false);
    const isWebhookActive = Boolean(hasGoogleAppsScriptUrl || scriptWebhookUrl);

    // Form fields
    const [carId, setCarId] = useState("");
    const [originalCarId, setOriginalCarId] = useState("");
    const [carName, setCarName] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [trim, setTrim] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [bodyStyle, setBodyStyle] = useState("");

    const [mileage, setMileage] = useState("");
    const [vin, setVin] = useState("");
    const [status, setStatus] = useState("Available");
    const [rentOrSell, setRentOrSell] = useState("Sell");

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

    // Client / Dealer contact info from sheet
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");

    // Interior Features list
    const [interiorFeatureInput, setInteriorFeatureInput] = useState("");
    const [interiorFeatures, setInteriorFeatures] = useState<string[]>([]);

    // Pricing
    const [price, setPrice] = useState<string>("");
    const [discount, setDiscount] = useState<string>("");

    // Rental Pricing
    const [rentPrice, setRentPrice] = useState<string>("");
    const [rentDiscount, setRentDiscount] = useState<string>("");

    // Notes
    const [notes, setNotes] = useState("");

    // Existing Images from Google Drive / Sheets
    const [existingMainImageUrl, setExistingMainImageUrl] =
        useState<string>("");
    const [existingSubImageUrls, setExistingSubImageUrls] = useState<string[]>(
        [],
    );

    // New Image Files being replaced / uploaded
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [subImageFiles, setSubImageFiles] = useState<File[]>([]);
    const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);
    const mainFileInputRef = useRef<HTMLInputElement | null>(null);
    const subFileInputRef = useRef<HTMLInputElement | null>(null);

    // Submission states & Feedback Modal Dialog
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

    // Load initial vehicle data
    useEffect(() => {
        let isMounted = true;
        async function fetchVehicle() {
            setLoadingInitial(true);
            setLoadError(null);
            try {
                const all = await fetchAllVehicles();
                const decodedId = decodeURIComponent(id || "")
                    .trim()
                    .toLowerCase();

                const found = all.find(
                    (v) =>
                        v.id.trim().toLowerCase() === decodedId ||
                        encodeURIComponent(v.id.trim().toLowerCase()) ===
                            decodedId,
                );

                if (!found) {
                    if (isMounted) {
                        setLoadError(
                            `Vehicle with ID "${id}" was not found in the inventory sheet.`,
                        );
                    }
                } else if (isMounted) {
                    setInitialVehicle(found);

                    // Pre-fill form fields
                    setCarId(found.id || "");
                    setOriginalCarId(found.id || "");
                    setCarName(found.make || "");
                    setModel(found.model || "");
                    setYear(found.year ? String(found.year) : "");
                    setTrim(found.trim || "");
                    setFuelType(found.fuelType || "");
                    setBodyStyle(found.bodyStyle || "");

                    setMileage(found.mileage || "");
                    setVin(found.vin || "");
                    setStatus(found.availabilities || "Available");
                    setRentOrSell(found.rentOrSell || "Sell");

                    // Title
                    if (TITLE_OPTIONS.includes(found.titleStatus)) {
                        setTitle(found.titleStatus);
                    } else if (found.titleStatus) {
                        setTitle("Other");
                        setCustomTitle(found.titleStatus);
                    } else {
                        setTitle("Clean");
                    }

                    // Exterior color
                    if (EXTERIOR_COLORS.includes(found.exteriorColor)) {
                        setExteriorColor(found.exteriorColor);
                    } else if (found.exteriorColor) {
                        setExteriorColor("Other");
                        setCustomExteriorColor(found.exteriorColor);
                    } else {
                        setExteriorColor("White");
                    }

                    // Interior color
                    if (INTERIOR_COLORS.includes(found.interiorColor)) {
                        setInteriorColor(found.interiorColor);
                    } else if (found.interiorColor) {
                        setInteriorColor("Other");
                        setCustomInteriorColor(found.interiorColor);
                    } else {
                        setInteriorColor("Black");
                    }

                    setSeatMaterial(found.seatMaterial || "Leather");
                    setEngine(found.engine || "Standard");
                    setEngineTypeSize(found.engineTypeSize || "1.5L l4 Turbo");
                    setTransmission(found.transmission || "Automatic");
                    setDriveline(found.driveline || "FWD");
                    setPowerOptions(found.powerOptions || "Keyless");
                    setCondition(found.condition || "Pre-owned");
                    setDriveCondition(found.driveCondition || "Runs/drives");

                    setClientName(found.clientName || "");
                    setClientPhone(formatPhoneNumber(found.clientPhone || ""));
                    setClientEmail(found.clientEmail || "");
                    setPurchaseDate(parseDateToIso(found.purchaseDate || ""));

                    setInteriorFeatures(
                        Array.isArray(found.interiorFeatures)
                            ? found.interiorFeatures
                            : [],
                    );

                    setPrice(
                        found.originalPrice > 0
                            ? String(found.originalPrice)
                            : found.price > 0
                              ? String(found.price)
                              : "",
                    );
                    setDiscount(
                        found.discount > 0 ? String(found.discount) : "",
                    );
                    setRentPrice(
                        found.rentPrice !== undefined && found.rentPrice > 0
                            ? String(found.rentPrice)
                            : "",
                    );
                    setRentDiscount(
                        found.rentDiscount !== undefined &&
                            found.rentDiscount > 0
                            ? String(found.rentDiscount)
                            : "",
                    );

                    setExistingMainImageUrl(found.mainImageUrl || "");
                    const otherImages =
                        found.images && found.images.length > 0
                            ? found.images.filter(
                                  (img) => img !== found.mainImageUrl,
                              )
                            : [];
                    setExistingSubImageUrls(otherImages);
                }
            } catch (err: any) {
                console.error("Failed to load vehicle for edit:", err);
                if (isMounted) {
                    setLoadError(
                        err?.message ||
                            "Failed to load vehicle data from Google Sheet.",
                    );
                }
            } finally {
                if (isMounted) setLoadingInitial(false);
            }
        }

        fetchVehicle();
        return () => {
            isMounted = false;
        };
    }, [id]);

    // Fetch Car List on mount (for dropdown cascades)
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
        if (carName) set.add(carName);
        return Array.from(set).sort();
    }, [carList, carName]);

    // Models for selected Make
    const availableModels = useMemo(() => {
        if (!carName) return [];
        const set = new Set<string>();
        carList
            .filter((r) => r.carName.toLowerCase() === carName.toLowerCase())
            .forEach((r) => {
                if (r.model) set.add(r.model);
            });
        if (model) set.add(model);
        return Array.from(set).sort();
    }, [carList, carName, model]);

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

    // Years for selected Make + Model
    const availableYears = useMemo(() => {
        const yearsSet = new Set<string>();
        if (year) yearsSet.add(year);

        if (!selectedCarRow || !selectedCarRow.yearsSold) {
            const currentYear = new Date().getFullYear();
            for (let y = currentYear; y >= currentYear - 30; y--) {
                yearsSet.add(y.toString());
            }
            return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
        }

        const currentCalYear = new Date().getFullYear();
        const yearsSoldStr = selectedCarRow.yearsSold;

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
                        yearsSet.add(y.toString());
                    }
                }
            } else {
                const singleY = parseInt(part.replace(/[^0-9]/g, ""), 10);
                if (
                    !isNaN(singleY) &&
                    singleY >= 1950 &&
                    singleY <= currentCalYear + 2
                ) {
                    yearsSet.add(singleY.toString());
                }
            }
        });

        if (yearsSet.size === 0) {
            for (let y = currentCalYear; y >= currentCalYear - 25; y--) {
                yearsSet.add(y.toString());
            }
        }

        return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
    }, [selectedCarRow, year]);

    // Trims for selected Make + Model
    const availableTrims = useMemo(() => {
        const set = new Set<string>();
        if (trim) set.add(trim);
        if (selectedCarRow && selectedCarRow.trim) {
            selectedCarRow.trim
                .split(/[/|,]/)
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((t) => set.add(t));
        }
        if (set.size === 0) set.add("Base");
        return Array.from(set);
    }, [selectedCarRow, trim]);

    // Fuel Types
    const availableFuelTypes = useMemo(() => {
        const set = new Set<string>();
        if (fuelType) set.add(fuelType);
        if (selectedCarRow && selectedCarRow.fuelType) {
            selectedCarRow.fuelType
                .split(/[/|,]/)
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((t) => set.add(t));
        }
        ["Gasoline", "Hybrid", "Electric", "Diesel"].forEach((f) => set.add(f));
        return Array.from(set);
    }, [selectedCarRow, fuelType]);

    // Body Styles
    const availableBodyStyles = useMemo(() => {
        const set = new Set<string>();
        if (bodyStyle) set.add(bodyStyle);
        if (selectedCarRow && selectedCarRow.bodyType) {
            selectedCarRow.bodyType
                .split(/[/|,]/)
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((t) => set.add(t));
        }
        ["Sedan", "SUV", "Coupe", "Hatchback", "Truck", "Minivan"].forEach(
            (b) => set.add(b),
        );
        return Array.from(set);
    }, [selectedCarRow, bodyStyle]);

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

    // Calculate creative Discount preview (Sale)
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
    const numDiscount = parseFloat(discount.replace(/[^0-9.]/g, "")) || 0;
    const finalCalculatedPrice =
        numPrice > 0 ? Math.max(0, numPrice - numDiscount) : 0;
    const discountPercentage =
        numPrice > 0 && numDiscount > 0
            ? Math.round((numDiscount / numPrice) * 100)
            : 0;

    // Calculate creative Discount preview (Rental)
    const numRentPrice = parseFloat(rentPrice.replace(/[^0-9.]/g, "")) || 0;
    const numRentDiscount =
        parseFloat(rentDiscount.replace(/[^0-9.]/g, "")) || 0;
    const finalCalculatedRentPrice =
        numRentPrice > 0 ? Math.max(0, numRentPrice - numRentDiscount) : 0;
    const rentDiscountPercentage =
        numRentPrice > 0 && numRentDiscount > 0
            ? Math.round((numRentDiscount / numRentPrice) * 100)
            : 0;

    // Handle Mileage formatting (Max 6 digits e.g. 016,325)
    const handleMileageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9,]/g, "");
        const digits = raw.replace(/,/g, "");
        if (digits.length <= 6) {
            if (digits.length > 3) {
                const formatted = `${digits.slice(0, digits.length - 3)},${digits.slice(digits.length - 3)}`;
                setMileage(formatted);
            } else {
                setMileage(digits);
            }
        }
    };

    // Handle VIN formatting (limit 17 chars, uppercase)
    const handleVinChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
            .toUpperCase()
            .replace(/[^A-HJ-NPR-Z0-9]/g, "")
            .slice(0, 17);
        setVin(val);
    };

    // Handle Client Phone input with real-time formatting & validation
    const handleClientPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        const formatted = formatPhoneNumber(inputVal);
        setClientPhone(formatted);
    };

    // Interior Features handlers
    const handleAddFeature = () => {
        if (!interiorFeatureInput.trim()) return;
        const trimmed = interiorFeatureInput.trim();
        if (!interiorFeatures.includes(trimmed)) {
            setInteriorFeatures([...interiorFeatures, trimmed]);
        }
        setInteriorFeatureInput("");
    };

    const handleRemoveFeature = (featToRemove: string) => {
        setInteriorFeatures(interiorFeatures.filter((f) => f !== featToRemove));
    };

    // Image handlers
    const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        setSubImageFiles((prev) => [...prev, ...filesArray]);

        const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
        setSubImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveSubImage = (indexToRemove: number) => {
        setSubImageFiles((prev) =>
            prev.filter((_, idx) => idx !== indexToRemove),
        );
        setSubImagePreviews((prev) =>
            prev.filter((_, idx) => idx !== indexToRemove),
        );
    };

    const handleRemoveExistingSubImage = (urlToRemove: string) => {
        setExistingSubImageUrls((prev) =>
            prev.filter((u) => u !== urlToRemove),
        );
    };

    // Gallery images for top viewer
    const allGalleryImages = useMemo(() => {
        const list: string[] = [];
        if (mainImagePreview) {
            list.push(mainImagePreview);
        } else if (existingMainImageUrl) {
            list.push(existingMainImageUrl);
        }
        subImagePreviews.forEach((p) => list.push(p));
        existingSubImageUrls.forEach((u) => {
            if (!list.includes(u)) list.push(u);
        });
        return list;
    }, [
        mainImagePreview,
        existingMainImageUrl,
        subImagePreviews,
        existingSubImageUrls,
    ]);

    // Current timestamp generator
    const getFormattedTimestamp = () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    };

    // Submit Edit
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

            // Convert new main image if uploaded
            let mainImagePayload: any = null;
            if (mainImageFile) {
                mainImagePayload =
                    await compressAndConvertToWebp(mainImageFile);
            }

            // Convert new sub images if uploaded
            const subImagesPayload: any[] = [];
            for (const file of subImageFiles) {
                const subObj = await compressAndConvertToWebp(file);
                subImagesPayload.push(subObj);
            }

            const payload = {
                action: "edit",
                editMode: true,
                carId: carId.trim(),
                originalCarId: originalCarId.trim(),
                timestamp,
                carName,
                model,
                year,
                mileage,
                price: numPrice ? numPrice.toString() : "",
                discount: numDiscount ? numDiscount.toString() : "",
                rentPrice: numRentPrice ? numRentPrice.toString() : "",
                rentDiscount: numRentDiscount ? numRentDiscount.toString() : "",
                vin,
                status,
                title: resolvedTitle,
                trim,
                bodyStyle,
                rentOrSell,
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
                clientName,
                clientPhone,
                clientEmail,
                purchaseDate,
                mainImage: mainImagePayload,
                mainImages: mainImagePayload ? [mainImagePayload] : [],
                subImages: subImagesPayload,
                mainImageUrl: mainImagePayload ? "" : existingMainImageUrl,
                subImageUrls: existingSubImageUrls.join(", "),
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
                            "To update this vehicle directly in your Google Sheet and Google Drive, configure your Web App URL.",
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
                    title: "Vehicle Updated Successfully!",
                    message: `Vehicle ${carId} (${carName} ${model} ${year}) was updated directly in the Google Sheet "Vehicle details" tab.`,
                    details: `Row updated: ${data.rowNumber || "Existing row"} | Status: ${status}`,
                });
            } else {
                throw new Error(
                    data?.message || "Unexpected response from server.",
                );
            }
        } catch (err: any) {
            console.error("Save error:", err);
            setPopupModal({
                isOpen: true,
                type: "error",
                title: "Failed to Update Vehicle",
                message:
                    err.message ||
                    "Could not update vehicle data in Google Sheet. Please check the Webhook URL and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.cars.index")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
                            title="Back to All Cars"
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
                                    <span>Edit Vehicle</span>
                                </h2>
                                {carId && (
                                    <span className="text-[10px] font-mono font-bold uppercase bg-dark-purple text-white px-2.5 py-0.5 rounded-full shadow-sm">
                                        {carId}
                                    </span>
                                )}
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Google Sheet Sync
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Real-time edit panel integrated with "Vehicle
                                details" tab and Google Drive photo gallery.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <Link
                            href={route("admin.cars.show", { id })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                            title="View Full Vehicle Details Screen"
                        >
                            <svg
                                className="w-4 h-4 text-purple"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            <span>View Details</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                setShowWebhookConfig(!showWebhookConfig)
                            }
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm bg-white hover:bg-slate-50 border-gray-200 text-slate-700"
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isWebhookActive
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-amber-400"
                                }`}
                            />
                            <span>
                                {isWebhookActive
                                    ? hasGoogleAppsScriptUrl
                                        ? "Sync Active (.env)"
                                        : "Sync Active"
                                    : "Config Webhook"}
                            </span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head
                title={
                    carName
                        ? `Edit ${carName} ${model} (${carId}) - Wright Finder Motors Admin`
                        : "Edit Vehicle - Wright Finder Motors Admin"
                }
            />

            {/* CREATIVE MODAL POPUP ALERT BOX */}
            {popupModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 transform transition-all animate-scale-up relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`absolute top-0 left-0 right-0 h-2 ${
                                popupModal.type === "success"
                                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                    : popupModal.type === "setup"
                                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                      : "bg-gradient-to-r from-vivid-red to-rose-600"
                            }`}
                        />

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
                                    ? "Continue Editing"
                                    : "Close"}
                            </button>
                            {popupModal.type === "success" && (
                                <Link
                                    href={route("admin.cars.index")}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-dark-purple hover:bg-purple text-white transition shadow-sm text-center"
                                >
                                    Back to All Cars
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK WEBHOOK SETUP BANNER */}
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
                                URL below to push updates directly into the
                                Google Sheet.
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
                </div>
            )}

            {/* Loading Initial Vehicle State */}
            {loadingInitial && (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-700">
                        Loading vehicle details for editing...
                    </p>
                </div>
            )}

            {/* Error Initial State */}
            {!loadingInitial && loadError && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-vivid-red flex items-center justify-center">
                        <svg
                            className="w-7 h-7"
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
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900">
                            Vehicle Not Found
                        </h3>
                        <p className="text-xs text-rose-700">{loadError}</p>
                    </div>
                    <div>
                        <Link
                            href={route("admin.cars.index")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vivid-red text-white text-xs font-semibold shadow hover:bg-red-600 transition"
                        >
                            Return to All Cars
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Edit Form Panel */}
            {!loadingInitial && !loadError && (
                <form onSubmit={handleSubmit} className="space-y-6 pb-16">
                    {/* CREATIVE TOP PANEL: LIVE VEHICLE SHOWCASE & GALLERY PREVIEW */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left: Interactive Media Preview Display */}
                            <div className="lg:w-1/2 flex flex-col space-y-3">
                                <div className="relative w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                                    {allGalleryImages.length > 0 ? (
                                        <img
                                            src={
                                                allGalleryImages[
                                                    activeImageIndex
                                                ] || allGalleryImages[0]
                                            }
                                            alt={carName || "Vehicle Preview"}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                                            <svg
                                                className="w-10 h-10 text-slate-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="text-xs font-semibold">
                                                No Images Attached
                                            </span>
                                        </div>
                                    )}

                                    {allGalleryImages.length > 0 && (
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/10">
                                            {activeImageIndex + 1} /{" "}
                                            {allGalleryImages.length} Photos
                                        </div>
                                    )}

                                    {allGalleryImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(
                                                        (prev) =>
                                                            prev === 0
                                                                ? allGalleryImages.length -
                                                                  1
                                                                : prev - 1,
                                                    )
                                                }
                                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-sm transition"
                                                aria-label="Previous image"
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
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(
                                                        (prev) =>
                                                            prev ===
                                                            allGalleryImages.length -
                                                                1
                                                                ? 0
                                                                : prev + 1,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-sm transition"
                                                aria-label="Next image"
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
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Selector */}
                                {allGalleryImages.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {allGalleryImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(idx)
                                                }
                                                className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                                                    activeImageIndex === idx
                                                        ? "border-vivid-red ring-2 ring-vivid-red/30 scale-105"
                                                        : "border-slate-200 opacity-60 hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumb ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Live Identity & Quick Details Preview Card */}
                            <div className="lg:w-1/2 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                status.toLowerCase() ===
                                                "available"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    : status.toLowerCase() ===
                                                        "sold"
                                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                            }`}
                                        >
                                            {status}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple/10 text-purple border border-purple/20">
                                            {rentOrSell}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                            Title: {title}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {carName || "Select Make"}{" "}
                                            {model || "Model"}{" "}
                                            {year ? `(${year})` : ""}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Trim: {trim || "Base"} &bull; Body:{" "}
                                            {bodyStyle || "Sedan"} &bull; VIN:{" "}
                                            <span className="font-mono font-semibold">
                                                {vin || "N/A"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Pricing Banner */}
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-baseline justify-between gap-4">
                                        <div className="flex flex-wrap items-baseline gap-6">
                                            {/* Show selling calculated price if Sell or Both */}
                                            {(rentOrSell === "Sell" ||
                                                rentOrSell === "Both") && (
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                                        Calculated Selling Price
                                                    </span>
                                                    <div className="flex items-baseline space-x-3 mt-1">
                                                        <span className="text-3xl font-black text-emerald-600 tracking-tight">
                                                            $
                                                            {finalCalculatedPrice.toLocaleString()}
                                                        </span>
                                                        {numDiscount > 0 &&
                                                            numPrice > 0 && (
                                                                <>
                                                                    <span className="text-sm text-slate-400 line-through">
                                                                        $
                                                                        {numPrice.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-xs font-bold bg-rose-50 text-vivid-red border border-rose-200 px-2 py-0.5 rounded">
                                                                        -
                                                                        {
                                                                            discountPercentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                </>
                                                            )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show rental calculated price if Rent or Both */}
                                            {(rentOrSell === "Rent" ||
                                                rentOrSell === "Both") && (
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                                        Daily Rental Rate
                                                    </span>
                                                    <div className="flex items-baseline space-x-2 mt-1">
                                                        <span className="text-3xl font-black text-purple tracking-tight">
                                                            $
                                                            {finalCalculatedRentPrice.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-semibold">
                                                            / day
                                                        </span>
                                                        {numRentDiscount > 0 &&
                                                            numRentPrice >
                                                                0 && (
                                                                <>
                                                                    <span className="text-sm text-slate-400 line-through">
                                                                        $
                                                                        {numRentPrice.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-xs font-bold bg-rose-50 text-vivid-red border border-rose-200 px-2 py-0.5 rounded">
                                                                        -
                                                                        {
                                                                            rentDiscountPercentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                </>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                                Mileage (Odometer)
                                            </span>
                                            {(() => {
                                                const m = parseMileage(mileage);
                                                return (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-base font-bold text-slate-800 leading-tight">
                                                            {m.hasValue
                                                                ? m.milesText
                                                                : "0 miles"}
                                                        </span>
                                                        {m.hasValue &&
                                                            m.kmText && (
                                                                <span className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                                                                    {m.kmText}
                                                                </span>
                                                            )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Spec Badges */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Engine
                                        </span>
                                        <span className="font-semibold text-slate-800 truncate block">
                                            {engineTypeSize}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Gearbox
                                        </span>
                                        <span className="font-semibold text-slate-800 truncate block">
                                            {transmission}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Driveline
                                        </span>
                                        <span className="font-semibold text-slate-800 truncate block">
                                            {driveline}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Fuel
                                        </span>
                                        <span className="font-semibold text-slate-800 truncate block">
                                            {fuelType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: VEHICLE SPECIFICATION (Car Name, Model, Year, Trim, Body, Fuel, Car ID) */}
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
                                    Vehicle Specification & Identification
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Syncs with Google Sheet "Car List" and
                                    matches inventory record columns.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Car ID (Editable if ID restructure is required) */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Car ID{" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Primary key in Sheet
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={carId}
                                    onChange={(e) => setCarId(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition shadow-sm uppercase"
                                />
                            </div>

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
                            </div>

                            {/* 2. Model */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Model{" "}
                                    <span className="text-vivid-red">*</span>
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
                                    Year{" "}
                                    <span className="text-vivid-red">*</span>
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
                                    onChange={(e) =>
                                        setFuelType(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setBodyStyle(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                                >
                                    {availableBodyStyles.map((b) => (
                                        <option key={b} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category: Rent or Sell */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Rent or Sell
                                </label>
                                <select
                                    value={rentOrSell}
                                    onChange={(e) =>
                                        setRentOrSell(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                                >
                                    <option value="Sell">Sell</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Both">Both</option>
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
                                    Identity, Odometer & Status
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
                                        Mileage (Miles)
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Ex: 016,325 miles
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
                                {(() => {
                                    const m = parseMileage(mileage);
                                    if (!m.hasValue || !m.kmText) return null;
                                    return (
                                        <p className="mt-1 text-[11px] font-medium text-slate-500">
                                            Converted to km:{" "}
                                            <span className="text-slate-800 font-semibold">
                                                {m.kmText}
                                            </span>
                                        </p>
                                    );
                                })()}
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
                                            setCustomExteriorColor(
                                                e.target.value,
                                            )
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
                                            setCustomInteriorColor(
                                                e.target.value,
                                            )
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

                            {/* Overall Condition */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Overall Condition
                                </label>
                                <select
                                    value={condition}
                                    onChange={(e) =>
                                        setCondition(e.target.value)
                                    }
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
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-purple flex items-center justify-center">
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
                                    Engine classifications, driveline, gearbox,
                                    and access methods.
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
                                    onChange={(e) =>
                                        setDriveline(e.target.value)
                                    }
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
                                    Interior Features & Equipment
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Saved comma-divided directly into the
                                    "Interior Features" column.
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

                    {/* SECTION 5A: SELLING PRICING & VALUATION (Shown for Sell & Both) */}
                    {(rentOrSell === "Sell" || rentOrSell === "Both") && (
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
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Pricing & Valuation
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Vehicle Sale
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Enter selling price and discount to see
                                        real-time showroom calculations.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Selling Price ($){" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                        placeholder="7000"
                                        required={rentOrSell === "Sell"}
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
                                        onChange={(e) =>
                                            setDiscount(e.target.value)
                                        }
                                        placeholder="2000"
                                        min="0"
                                        step="any"
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                                    />
                                </div>

                                {/* Discount Preview Display */}
                                <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 shadow-inner">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                        Showroom Selling Price (Price -
                                        Discount)
                                    </span>
                                    <div className="flex items-baseline space-x-3 mt-1.5">
                                        <span className="text-2xl font-black text-emerald-600 tracking-tight">
                                            $
                                            {finalCalculatedPrice.toLocaleString()}
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
                                        Saves ${numDiscount.toLocaleString()}{" "}
                                        for the customer
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 5B: RENTAL PRICING & DISCOUNT SECTION (Shown for Rent & Both) */}
                    {(rentOrSell === "Rent" || rentOrSell === "Both") && (
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
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
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Rental Pricing & Valuation
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple/10 text-purple border border-purple/20">
                                            Vehicle Rental
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Enter daily rental rate and discount.
                                        Saved to Google Sheet columns &apos;Rent
                                        Price&apos; and &apos;Rent
                                        Discount&apos;.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                {/* Rent Price */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Rent Price ($ / day){" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={rentPrice}
                                        onChange={(e) =>
                                            setRentPrice(e.target.value)
                                        }
                                        placeholder="150"
                                        required={rentOrSell === "Rent"}
                                        min="0"
                                        step="any"
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                                    />
                                </div>

                                {/* Rent Discount */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Rent Discount ($ / day)
                                    </label>
                                    <input
                                        type="number"
                                        value={rentDiscount}
                                        onChange={(e) =>
                                            setRentDiscount(e.target.value)
                                        }
                                        placeholder="25"
                                        min="0"
                                        step="any"
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                                    />
                                </div>

                                {/* Creative Rental Discount Preview Display */}
                                <div className="bg-purple/5 border border-purple/20 rounded-2xl p-4 shadow-inner">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                        Effective Daily Rental Rate
                                    </span>
                                    <div className="flex items-baseline space-x-3 mt-1.5">
                                        <span className="text-2xl font-black text-purple tracking-tight">
                                            $
                                            {finalCalculatedRentPrice.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            / day
                                        </span>
                                        {numRentDiscount > 0 &&
                                            numRentPrice > 0 && (
                                                <>
                                                    <span className="text-xs text-slate-400 line-through">
                                                        $
                                                        {numRentPrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold bg-rose-50 text-vivid-red border border-rose-200 px-1.5 py-0.5 rounded">
                                                        -
                                                        {rentDiscountPercentage}
                                                        %
                                                    </span>
                                                </>
                                            )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                        Saves $
                                        {numRentDiscount.toLocaleString()} per
                                        rental day for customer
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 6: GOOGLE DRIVE IMAGE UPLOADS & MANAGEMENT */}
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
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900">
                                        Google Drive Photo Gallery & Management
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Auto-WebP &lt;100KB
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Keep existing Google Drive links or upload
                                    new photos converted automatically into
                                    lightweight WebP format.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 1. Main Image (Single) */}
                            <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/60 flex flex-col justify-between">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Main Hero Image
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">
                                        Primary photo for listings and hero
                                        header.
                                    </p>

                                    <input
                                        ref={mainFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageChange}
                                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-vivid-red file:text-white hover:file:bg-red-600 cursor-pointer"
                                    />
                                </div>

                                {(mainImagePreview || existingMainImageUrl) && (
                                    <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-300 h-44 bg-slate-900">
                                        <img
                                            src={
                                                mainImagePreview ||
                                                existingMainImageUrl
                                            }
                                            alt="Main Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-slate-900/80 text-white px-2 py-0.5 rounded">
                                            {mainImagePreview
                                                ? "New upload (replaces current)"
                                                : "Current Sheet Main Image"}
                                        </span>
                                        {mainImagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMainImageFile(null);
                                                    setMainImagePreview("");
                                                    if (
                                                        mainFileInputRef.current
                                                    ) {
                                                        mainFileInputRef.current.value =
                                                            "";
                                                    }
                                                }}
                                                className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-lg text-xs"
                                                title="Cancel replacement photo"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 2. Sub Images (Multiple) */}
                            <div className="border border-gray-200 rounded-2xl p-5 bg-slate-50/60 flex flex-col justify-between">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Sub Image URLs (Gallery Photos)
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">
                                        Upload additional photos or manage
                                        existing gallery items.
                                    </p>

                                    <input
                                        ref={subFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleSubImagesChange}
                                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                    />
                                </div>

                                <div className="mt-4 space-y-3">
                                    {/* Existing Sub Images */}
                                    {existingSubImageUrls.length > 0 && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                                                Existing Gallery (
                                                {existingSubImageUrls.length})
                                            </span>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                                                {existingSubImageUrls.map(
                                                    (url, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative rounded-lg overflow-hidden border border-gray-300 h-16 bg-slate-100"
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Existing ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveExistingSubImage(
                                                                        url,
                                                                    )
                                                                }
                                                                className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-0.5 rounded text-[10px]"
                                                                title="Remove existing photo"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Added Previews */}
                                    {subImagePreviews.length > 0 && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1.5">
                                                New Photos to Upload (
                                                {subImagePreviews.length})
                                            </span>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                                {subImagePreviews.map(
                                                    (preview, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative rounded-lg overflow-hidden border border-emerald-300 h-16 bg-slate-100"
                                                        >
                                                            <img
                                                                src={preview}
                                                                alt={`New Sub ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveSubImage(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-0.5 rounded text-[10px]"
                                                                title="Remove"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7: CLIENT / DEALERSHIP INFORMATION */}
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Client & Dealership Information
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Contact credentials and purchase details
                                    mapped to Google Sheet.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) =>
                                        setClientName(e.target.value)
                                    }
                                    placeholder="John Doe"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red shadow-sm"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Client Phone
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        (###) ###-####
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={clientPhone}
                                        onChange={handleClientPhoneChange}
                                        placeholder="(555) 000-0000"
                                        maxLength={18}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red shadow-sm font-medium"
                                    />
                                    {clientPhone && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {clientPhone.replace(/\D/g, "")
                                                .length >= 10 ? (
                                                <svg
                                                    className="w-4 h-4 text-emerald-500"
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
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-500">
                                                    {10 -
                                                        clientPhone.replace(
                                                            /\D/g,
                                                            "",
                                                        ).length}{" "}
                                                    left
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Client Email
                                </label>
                                <input
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) =>
                                        setClientEmail(e.target.value)
                                    }
                                    placeholder="client@example.com"
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red shadow-sm"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Purchase Date
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Calendar Date
                                    </span>
                                </div>
                                <input
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) =>
                                        setPurchaseDate(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red shadow-sm font-medium cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 8: NOTES */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-purple flex items-center justify-center">
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
                                    Additional remarks, history, or customer
                                    comments saved into the "NOTES" column.
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
                        <Link
                            href={route("admin.cars.index")}
                            className="px-6 py-3.5 rounded-2xl bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-sm"
                        >
                            Cancel
                        </Link>

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
                                    <span>Updating Google Sheet...</span>
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
                                    <span>Update Vehicle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </AuthenticatedLayout>
    );
}
