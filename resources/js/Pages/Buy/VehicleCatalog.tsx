import { useState, useEffect } from "react";

export interface Vehicle {
    id: string;
    title: string;
    make: string;
    category: string;
    price: number;
    originalPrice: number;
    fuel: string;
    powerOptions: string;
    driveline: string;
    mileage: string;
    transmission: string;
    condition: string;
    badge: string;
    images: string[];
}

const CARDS_PER_PAGE = 9;

// Convert Google Drive share link to direct image viewable URL
function formatDriveImageUrl(url: string): string {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";

    // If it's a google drive link with /file/d/{id}
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

    // If it has id={id}
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
        return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }

    return trimmed;
}

// Parse CSV text respecting quotes
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
            if (char === "\r" && nextChar === "\n") {
                i++;
            }
            currentRow.push(currentCell.trim());
            if (currentRow.some((c) => c !== "")) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== "")) {
            rows.push(currentRow);
        }
    }

    return rows;
}

function VehicleCard({ car }: { car: Vehicle }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? car.images.length - 1 : prev - 1,
        );
    };

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === car.images.length - 1 ? 0 : prev + 1,
        );
    };

    const hasDiscount =
        car.originalPrice > 0 && car.price > 0 && car.originalPrice > car.price;

    const discountAmount = hasDiscount ? car.originalPrice - car.price : 0;
    const discountPercentage = hasDiscount
        ? Math.round((discountAmount / car.originalPrice) * 100)
        : 0;

    const [imageError, setImageError] = useState(false);
    const hasImages = car.images && car.images.length > 0 && !imageError;
    const currentImageUrl = hasImages ? car.images[currentImageIndex] : "";

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1">
            {/* Vehicle Image Slider / Empty State Container */}
            <div className="relative h-64 overflow-hidden bg-gray-100 select-none flex items-center justify-center">
                {hasImages ? (
                    <>
                        <img
                            src={currentImageUrl}
                            alt={`${car.title} - photo ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />

                        {/* Subtle top/bottom image gradient for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />

                        {/* Prev & Next Slider Arrows */}
                        {car.images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    aria-label="Previous vehicle photo"
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-vivid-red text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm opacity-80 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    aria-label="Next vehicle photo"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-vivid-red text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm opacity-80 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>

                                {/* Slider Dots Indicator */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                                    {car.images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setCurrentImageIndex(idx);
                                            }}
                                            aria-label={`Go to image ${idx + 1}`}
                                            className={`h-1.5 rounded-full transition-all duration-200 ${
                                                currentImageIndex === idx
                                                    ? "w-4 bg-vivid-red"
                                                    : "w-1.5 bg-white/70 hover:bg-white"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    /* Empty Image Placeholder */
                    <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200/70 flex items-center justify-center text-gray-400 mb-2">
                            <svg
                                className="w-7 h-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                            No Image Available
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                            Photos coming soon
                        </span>
                    </div>
                )}

                {/* Badge Tag (Status from sheet) */}
                {car.badge && (
                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-dark-blue shadow-md border border-white/60">
                        {car.badge}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-[#170a3d] line-clamp-1 group-hover:text-vivid-red transition-colors duration-200">
                        {car.title}
                    </h3>

                    {/* 3 Columns & 2 Rows Specs Grid with SVG Icons */}
                    <div className="grid grid-cols-3 gap-2.5 text-xs mt-4 pt-4 pb-4 border-y border-gray-100">
                        {/* 1. Fuel Type */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 14V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-4m0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-8 2h4"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Fuel
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.fuel || "N/A"}
                            >
                                {car.fuel || "N/A"}
                            </span>
                        </div>

                        {/* 2. Power Options */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Power
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.powerOptions || "Standard"}
                            >
                                {car.powerOptions || "Standard"}
                            </span>
                        </div>

                        {/* 3. Driveline */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="12" r="3" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6M12 9v6"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Driveline
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.driveline || "N/A"}
                            >
                                {car.driveline || "N/A"}
                            </span>
                        </div>

                        {/* 4. Mileage */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Mileage
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={
                                    car.mileage ? `${car.mileage} km` : "N/A"
                                }
                            >
                                {car.mileage ? `${car.mileage} km` : "N/A"}
                            </span>
                        </div>

                        {/* 5. Transmission */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Gearbox
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.transmission || "Automatic"}
                            >
                                {car.transmission || "Automatic"}
                            </span>
                        </div>

                        {/* 6. Condition (Title from Sheet) */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Title
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.condition || "Clean"}
                            >
                                {car.condition || "Clean"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Display Section */}
                <div className="pt-4 mt-2">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                                Price
                            </span>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-2xl font-black text-[#170a3d] tracking-tight">
                                    ${car.price.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm font-semibold text-gray-400 line-through decoration-vivid-red/70 decoration-2">
                                        ${car.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Discount badge */}
                        {hasDiscount && (
                            <div className="flex flex-col items-end">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-vivid-red text-[11px] font-extrabold shadow-sm">
                                    <span>
                                        Save ${discountAmount.toLocaleString()}
                                    </span>
                                    <span className="bg-vivid-red text-white text-[9px] px-1 rounded-full">
                                        -{discountPercentage}%
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons: 1 Row with "Contact Agent" & "Explore More" */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <a
                            href="#contact"
                            onClick={(e) => {
                                e.preventDefault();
                                const contactSection =
                                    document.getElementById("contact");
                                if (contactSection) {
                                    contactSection.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white text-xs font-bold transition-all duration-200 shadow-sm active:scale-95"
                        >
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            <span className="truncate">Contact Agent</span>
                        </a>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold transition-all duration-200 shadow-md hover:shadow-red-500/30 active:scale-95"
                        >
                            <span>Explore More</span>
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VehicleCatalog() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const SHEET_CSV_URL =
        "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Vehicle%20details";

    useEffect(() => {
        let isMounted = true;

        async function fetchVehicles() {
            try {
                setIsLoading(true);
                setError(null);
                const res = await fetch(SHEET_CSV_URL);
                if (!res.ok) {
                    throw new Error(
                        `Failed to fetch Google Sheet: ${res.statusText}`,
                    );
                }
                const csvData = await res.text();
                const parsedRows = parseCsv(csvData);

                if (parsedRows.length < 2) {
                    if (isMounted) {
                        setVehicles([]);
                        setIsLoading(false);
                    }
                    return;
                }

                // First row is headers
                const headers = parsedRows[0].map((h) => h.trim());

                // Find column index helper
                const getIndex = (name: string): number => {
                    return headers.findIndex(
                        (h) => h.toLowerCase() === name.toLowerCase(),
                    );
                };

                const carIdIdx = getIndex("Car ID");
                const carNameIdx = getIndex("Car Name");
                const modelIdx = getIndex("Model");
                const yearIdx = getIndex("Year");
                const bodyStyleIdx = getIndex("Body Style");
                const priceIdx = getIndex("Price");
                const discountIdx = getIndex("Discount");
                const fuelTypeIdx = getIndex("Fuel Type");
                const powerOptionsIdx = getIndex("Power Options");
                const drivelineIdx = getIndex("Driveline");
                const mileageIdx = getIndex("Mileage");
                const transmissionIdx = getIndex("Transmission");
                const titleIdx = getIndex("Title");
                const statusIdx = getIndex("Status");
                const mainImageIdx = getIndex("Main Image URLs");
                const subImagesIdx = getIndex("Sub Image URLs");

                const loadedVehicles: Vehicle[] = [];

                for (let i = 1; i < parsedRows.length; i++) {
                    const row = parsedRows[i];
                    if (!row || row.length === 0) continue;

                    const carId =
                        carIdIdx !== -1
                            ? row[carIdIdx]?.trim() || `car-${i}`
                            : `car-${i}`;
                    const carName =
                        carNameIdx !== -1 ? row[carNameIdx]?.trim() || "" : "";
                    const model =
                        modelIdx !== -1 ? row[modelIdx]?.trim() || "" : "";
                    const year =
                        yearIdx !== -1 ? row[yearIdx]?.trim() || "" : "";

                    // Skip empty rows where Car Name and Model are missing
                    if (!carName && !model) continue;

                    // Title: Car Name + Model + Year
                    const titleParts = [carName, model, year].filter(Boolean);
                    const title = titleParts.join(" ") || `Vehicle #${i}`;

                    const category =
                        bodyStyleIdx !== -1
                            ? row[bodyStyleIdx]?.trim() || "Sedan"
                            : "Sedan";

                    // originalPrice = Price
                    const originalPriceRaw =
                        priceIdx !== -1
                            ? parseFloat(
                                  row[priceIdx]?.replace(/[^0-9.]/g, "") || "0",
                              )
                            : 0;
                    const discountRaw =
                        discountIdx !== -1
                            ? parseFloat(
                                  row[discountIdx]?.replace(/[^0-9.]/g, "") ||
                                      "0",
                              )
                            : 0;

                    // price = Discount reduced from originalPrice
                    // i.e. if originalPrice is 7000 and discount is 2000 => price is 5000. If no discount, price = originalPrice.
                    const finalPrice =
                        discountRaw > 0 && originalPriceRaw >= discountRaw
                            ? originalPriceRaw - discountRaw
                            : originalPriceRaw;

                    const fuel =
                        fuelTypeIdx !== -1
                            ? row[fuelTypeIdx]?.trim() || ""
                            : "";
                    const powerOptions =
                        powerOptionsIdx !== -1
                            ? row[powerOptionsIdx]?.trim() || ""
                            : "";
                    const driveline =
                        drivelineIdx !== -1
                            ? row[drivelineIdx]?.trim() || ""
                            : "";
                    const mileage =
                        mileageIdx !== -1 ? row[mileageIdx]?.trim() || "" : "";
                    const transmission =
                        transmissionIdx !== -1
                            ? row[transmissionIdx]?.trim() || ""
                            : "";
                    const condition =
                        titleIdx !== -1 ? row[titleIdx]?.trim() || "" : "";
                    const badge =
                        statusIdx !== -1 ? row[statusIdx]?.trim() || "" : "";

                    // Images: Main Image URLs + Sub Image URLs (comma-separated)
                    const rawMainImage =
                        mainImageIdx !== -1 ? row[mainImageIdx] || "" : "";
                    const rawSubImages =
                        subImagesIdx !== -1 ? row[subImagesIdx] || "" : "";

                    const allImageStrings = `${rawMainImage},${rawSubImages}`;
                    const imageTokens = allImageStrings
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);

                    const formattedImages = imageTokens
                        .map((url) => formatDriveImageUrl(url))
                        .filter(Boolean);

                    loadedVehicles.push({
                        id: carId,
                        title,
                        make: carName,
                        category,
                        price: finalPrice,
                        originalPrice: originalPriceRaw,
                        fuel,
                        powerOptions,
                        driveline,
                        mileage,
                        transmission,
                        condition,
                        badge,
                        images: formattedImages,
                    });
                }

                if (isMounted) {
                    setVehicles(loadedVehicles);
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error(
                    "Error fetching vehicles from Google Sheet:",
                    err,
                );
                if (isMounted) {
                    setError("Failed to load vehicle data from Google Sheet.");
                    setIsLoading(false);
                }
            }
        }

        fetchVehicles();

        return () => {
            isMounted = false;
        };
    }, []);

    const totalPages = Math.ceil(vehicles.length / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const currentVehicles = vehicles.slice(
        startIndex,
        startIndex + CARDS_PER_PAGE,
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const section = document.getElementById("catalog");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="catalog"
            className="py-20 lg:py-24 bg-bggray font-poppins relative"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Centered Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Explore Vehicles For Sale
                    </h2>
                    <p className="text-sm lg:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Handpicked quality vehicles ready for immediate driving
                        or booking. Comprehensive specifications, certified
                        multi-point inspections, and transparent market pricing.
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-24 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-vivid-red border-t-transparent rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium">
                            Fetching vehicles from Google Sheet...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-lg mx-auto">
                        <p className="text-red-400 font-semibold mb-2">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-vivid-red text-white text-xs font-bold rounded-xl hover:bg-red-600 transition"
                        >
                            Retry Loading
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && vehicles.length === 0 && (
                    <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-lg mx-auto">
                        <p className="text-white font-semibold">
                            No vehicles found in the Google Sheet.
                        </p>
                    </div>
                )}

                {/* Vehicle Grid (Max 9 cards shown per page) */}
                {!isLoading && !error && vehicles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentVehicles.map((car) => (
                            <VehicleCard key={car.id} car={car} />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && !error && totalPages > 1 && (
                    <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-white">
                        <p className="text-xs text-gray-300">
                            Showing{" "}
                            <span className="font-bold text-white">
                                {startIndex + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-white">
                                {Math.min(
                                    startIndex + CARDS_PER_PAGE,
                                    vehicles.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-white">
                                {vehicles.length}
                            </span>{" "}
                            vehicles
                        </p>

                        <div className="flex items-center space-x-2">
                            {/* Prev Page Button */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                aria-label="Previous page"
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                    currentPage === 1
                                        ? "bg-white/10 text-gray-400 cursor-not-allowed"
                                        : "bg-white/20 hover:bg-vivid-red text-white shadow"
                                }`}
                            >
                                <span>&larr;</span>
                                <span>Prev</span>
                            </button>

                            {/* Page Numbers */}
                            {Array.from(
                                { length: totalPages },
                                (_, idx) => idx + 1,
                            ).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                        currentPage === pageNum
                                            ? "bg-vivid-red text-white scale-105 shadow-red-500/30"
                                            : "bg-white/15 hover:bg-white/30 text-white"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Page Button */}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                aria-label="Next page"
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                    currentPage === totalPages
                                        ? "bg-white/10 text-gray-400 cursor-not-allowed"
                                        : "bg-white/20 hover:bg-vivid-red text-white shadow"
                                }`}
                            >
                                <span>Next</span>
                                <span>&rarr;</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
