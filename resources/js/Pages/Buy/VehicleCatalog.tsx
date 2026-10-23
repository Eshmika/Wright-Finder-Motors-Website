import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { parseMileage } from "@/Utils/mileage";

export interface Vehicle {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    category: string;
    rentOrSell?: string;
    price: number;
    originalPrice: number;
    fuel: string;
    powerOptions: string;
    driveline: string;
    mileage: string;
    transmission: string;
    condition: string;
    vehicleCondition?: string;
    badge: string;
    availabilities?: string;
    images: string[];
    clientEmail?: string;
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

function VehicleCard({
    car,
    currentPage,
}: {
    car: Vehicle;
    currentPage: number;
}) {
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

                {/* Discount Badge on the Left Side Corner */}
                {hasDiscount && (
                    <div className="absolute top-3.5 left-3.5 z-20 backdrop-blur-md px-2.5 py-1 rounded-full bg-red-500/90 border border-red-400 text-white text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 shadow-lg">
                        <span>Save ${discountAmount.toLocaleString()}</span>
                        <span className="bg-white text-vivid-red text-[9px] font-black px-1 rounded-full">
                            -{discountPercentage}%
                        </span>
                    </div>
                )}

                {/* Availabilities Tag with Custom Colors (Top Right Corner) */}
                {(car.availabilities || car.badge) &&
                    (() => {
                        const statusText = (
                            car.availabilities || car.badge
                        ).trim();
                        const statusLower = statusText.toLowerCase();

                        // Colors requested:
                        // Sold: #22c55e (vibrant emerald green)
                        // Available: #facc15 (luminous warm gold/yellow)
                        // Pending: #9ca3af (sleek refined neutral slate/gray)
                        const isSold = statusLower === "sold";
                        const isAvailable = statusLower === "available";
                        const isPending = statusLower === "pending";

                        const badgeConfig = isSold
                            ? {
                                  bg: "bg-[#22c55e]",
                                  border: "border-[#22c55e]",
                                  text: "text-[#ffffff]",
                                  label: statusText,
                              }
                            : isAvailable
                              ? {
                                    bg: "bg-[#facc15]",
                                    border: "border-[#facc15]",
                                    text: "text-[#ffffff]",
                                    label: statusText,
                                }
                              : isPending
                                ? {
                                      bg: "bg-[#9ca3af]",
                                      border: "border-[#9ca3af]",
                                      text: "text-[#ffffff]",
                                      label: statusText,
                                  }
                                : {
                                      bg: "bg-black",
                                      border: "border-black",
                                      text: "text-[#ffffff]",
                                      label: statusText,
                                  };

                        return (
                            <div
                                className={`absolute top-3.5 right-3.5 z-20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg border transition-all duration-300 ${badgeConfig.bg} ${badgeConfig.border} ${badgeConfig.text}`}
                            >
                                <span>{badgeConfig.label}</span>
                            </div>
                        );
                    })()}
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
                            {(() => {
                                const m = parseMileage(car.mileage);
                                return (
                                    <div className="flex flex-col min-w-0">
                                        <span
                                            className="font-semibold text-gray-800 text-[11px] truncate leading-tight"
                                            title={
                                                m.hasValue
                                                    ? `${m.milesText} (${m.kmText})`
                                                    : "N/A"
                                            }
                                        >
                                            {m.milesText}
                                        </span>
                                        {m.hasValue && m.kmText && (
                                            <span className="text-[9.5px] font-medium text-gray-500 tracking-tight leading-tight mt-0.5 truncate">
                                                {m.kmText}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}
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
                <div className="mt-1">
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
                    </div>

                    {/* Action Buttons: 1 Row with "Contact Agent" & "Explore More" */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const email = car.clientEmail?.trim();

                                if (!email) {
                                    // Redirect to Contact Us page with prefilled car details and message
                                    const subjectParam =
                                        (car.rentOrSell || "").toLowerCase() ===
                                        "rent"
                                            ? "rent"
                                            : "buy";
                                    const mInfo = parseMileage(car.mileage);
                                    const mileageFormatted = mInfo.hasValue
                                        ? `${mInfo.milesText} (${mInfo.kmText})`
                                        : "N/A";
                                    const inquiryMsg = `Hello Wright Finder Motors,\n\nI would like more information and wish to contact an agent regarding this vehicle:\n- Vehicle: ${car.title}\n- Stock ID: #${car.id}\n- Price: $${car.price?.toLocaleString() || "N/A"}\n- Mileage: ${mileageFormatted}\n- Transmission: ${car.transmission || "N/A"}\n- Fuel Type: ${car.fuel || "N/A"}\n\nPlease get in touch with me with further details.\n\nThank you!`;
                                    router.visit(
                                        `/contact?subject=${subjectParam}&carId=${encodeURIComponent(car.id)}&carTitle=${encodeURIComponent(car.title)}&message=${encodeURIComponent(inquiryMsg)}#contact-form`,
                                    );
                                    return;
                                }

                                // Open mail client with prefilled car details and problem input area
                                const mMailInfo = parseMileage(car.mileage);
                                const mailMileage = mMailInfo.hasValue
                                    ? `${mMailInfo.milesText} (${mMailInfo.kmText})`
                                    : "N/A";
                                const subject = encodeURIComponent(
                                    `Inquiry / Problem Report: ${car.title} (ID: ${car.id})`,
                                );
                                const body = encodeURIComponent(
                                    `Hello,\n\nI am contacting regarding the following vehicle:\n` +
                                        `----------------------------------------\n` +
                                        `Vehicle: ${car.title}\n` +
                                        `Car ID: ${car.id}\n` +
                                        `Price: $${car.price.toLocaleString()}\n` +
                                        `Mileage: ${mailMileage}\n` +
                                        `Transmission: ${car.transmission || "N/A"}\n` +
                                        `Fuel Type: ${car.fuel || "N/A"}\n` +
                                        `Title Condition: ${car.condition || "N/A"}\n` +
                                        `----------------------------------------\n\n` +
                                        `[Please describe your inquiry, question, or problem below]:\n\n`,
                                );

                                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const queryParams = new URLSearchParams();
                                if (currentPage > 1) {
                                    queryParams.set(
                                        "page",
                                        String(currentPage),
                                    );
                                }
                                const qs = queryParams.toString();
                                const url = `/vehicles/${encodeURIComponent(car.id)}${qs ? `?${qs}` : ""}`;
                                router.visit(url);
                            }}
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

    // Initial page from URL query param (e.g. /buy?page=2) or fallback to 1
    const [currentPage, setCurrentPage] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const p = new URLSearchParams(window.location.search).get("page");
            const parsed = parseInt(p || "1", 10);
            return isNaN(parsed) || parsed < 1 ? 1 : parsed;
        }
        return 1;
    });

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
                const conditionColIdx = getIndex("Condition");
                const statusIdx =
                    getIndex("Availabilities") !== -1
                        ? getIndex("Availabilities")
                        : getIndex("Status");
                const mainImageIdx = getIndex("Main Image URLs");
                const subImagesIdx = getIndex("Sub Image URLs");
                const clientEmailIdx = getIndex("Client Email");
                const rentOrSellIdx = getIndex("Rent or Sell");

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
                    const vehicleCondition =
                        conditionColIdx !== -1
                            ? row[conditionColIdx]?.trim() || ""
                            : "";
                    const badge =
                        statusIdx !== -1 ? row[statusIdx]?.trim() || "" : "";
                    const clientEmail =
                        clientEmailIdx !== -1
                            ? row[clientEmailIdx]?.trim() || ""
                            : "";

                    const rentOrSell =
                        rentOrSellIdx !== -1
                            ? row[rentOrSellIdx]?.trim() || ""
                            : "";

                    // Buy Vehicle Catalog: Only show "Sell" and "Both" (default to Sell if column is empty)
                    const normalizedRentOrSell = rentOrSell.toLowerCase();
                    if (
                        normalizedRentOrSell &&
                        normalizedRentOrSell !== "sell" &&
                        normalizedRentOrSell !== "both"
                    ) {
                        continue;
                    }

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

                    const yearNum =
                        parseInt(year.replace(/[^0-9]/g, ""), 10) || 0;

                    loadedVehicles.push({
                        id: carId,
                        title,
                        make: carName,
                        model,
                        year: yearNum,
                        category,
                        price: finalPrice,
                        originalPrice: originalPriceRaw,
                        fuel,
                        powerOptions,
                        driveline,
                        mileage,
                        transmission,
                        condition,
                        vehicleCondition,
                        badge,
                        availabilities: badge,
                        rentOrSell,
                        images: formattedImages,
                        clientEmail,
                    });
                }

                if (isMounted) {
                    // Sort order:
                    // 1st Priority - Status group: "Available" -> "Pending" -> "Sold" -> others
                    // 2nd Priority - Inside each group: newest added first (reverse insertion/sheet order)
                    const statusRank = (status?: string): number => {
                        const s = (status || "").toLowerCase().trim();
                        if (s.startsWith("avail")) return 1;
                        if (s.startsWith("pend")) return 2;
                        if (s.startsWith("sold")) return 3;
                        return 4;
                    };

                    const reversed = loadedVehicles.reverse();
                    const sortedVehicles = [...reversed].sort((a, b) => {
                        const rankA = statusRank(a.availabilities || a.badge);
                        const rankB = statusRank(b.availabilities || b.badge);
                        return rankA - rankB;
                    });

                    setVehicles(sortedVehicles);
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

    // Read condition, bodyStyle/category, and search query from URL if present
    const urlParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;
    const urlCondition = urlParams?.get("condition") || "";
    const urlBodyStyle =
        urlParams?.get("bodyStyle") ||
        urlParams?.get("body_type") ||
        urlParams?.get("body") ||
        urlParams?.get("category") ||
        "";
    const urlSearchQuery =
        urlParams?.get("search") || urlParams?.get("q") || "";

    // Filter state
    const [searchKeyword, setSearchKeyword] = useState<string>(urlSearchQuery);
    const [selectedMake, setSelectedMake] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [fromYear, setFromYear] = useState<string>("");
    const [toYear, setToYear] = useState<string>("");
    const [selectedCategory, setSelectedCategory] =
        useState<string>(urlBodyStyle);
    const [selectedCondition, setSelectedCondition] =
        useState<string>(urlCondition);

    // Applied filter state (applied when clicking "Search Vehicle")
    const [appliedFilters, setAppliedFilters] = useState({
        search: urlSearchQuery,
        make: "",
        model: "",
        minPrice: "",
        maxPrice: "",
        fromYear: "",
        toYear: "",
        category: urlBodyStyle,
        condition: urlCondition,
    });

    // Sync if URL search changes (including back/forward browser navigation)
    useEffect(() => {
        const handleLocationChange = () => {
            const params = new URLSearchParams(window.location.search);
            const nextCondition = params.get("condition") || "";
            const nextBodyStyle =
                params.get("bodyStyle") ||
                params.get("body_type") ||
                params.get("body") ||
                params.get("category") ||
                "";
            const nextSearch = params.get("search") || params.get("q") || "";
            const pageParam = params.get("page");
            const parsedPage = parseInt(pageParam || "1", 10);

            if (nextCondition) {
                setSelectedCondition(nextCondition);
            }
            if (nextBodyStyle) {
                setSelectedCategory(nextBodyStyle);
            }
            if (nextSearch) {
                setSearchKeyword(nextSearch);
            }

            setAppliedFilters((prev) => ({
                ...prev,
                condition: nextCondition,
                category: nextBodyStyle,
                search: nextSearch,
            }));

            if (!isNaN(parsedPage) && parsedPage >= 1) {
                setCurrentPage(parsedPage);
            }
        };

        handleLocationChange();
        window.addEventListener("popstate", handleLocationChange);
        return () =>
            window.removeEventListener("popstate", handleLocationChange);
    }, [urlCondition, urlBodyStyle, urlSearchQuery]);

    // Unique options derived from vehicles data
    const makeOptions = Array.from(
        new Set(vehicles.map((v) => v.make).filter(Boolean)),
    ).sort();

    // Models relevant to selected car name (make)
    const modelOptions = Array.from(
        new Set(
            vehicles
                .filter(
                    (v) =>
                        !selectedMake ||
                        v.make.toLowerCase() === selectedMake.toLowerCase(),
                )
                .map((v) => v.model)
                .filter(Boolean),
        ),
    ).sort();

    const categoryOptions = Array.from(
        new Set(vehicles.map((v) => v.category).filter(Boolean)),
    ).sort();

    // Reset model if selected make changes and model is no longer valid
    const handleMakeChange = (makeVal: string) => {
        setSelectedMake(makeVal);
        setSelectedModel("");
    };

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilters({
            search: searchKeyword,
            make: selectedMake,
            model: selectedModel,
            minPrice,
            maxPrice,
            fromYear,
            toYear,
            category: selectedCategory,
            condition: selectedCondition,
        });
        setCurrentPage(1);
        if (typeof window !== "undefined") {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete("page");
            window.history.pushState({}, "", currentUrl.toString());
        }
    };

    const handleResetFilters = () => {
        setSearchKeyword("");
        setSelectedMake("");
        setSelectedModel("");
        setMinPrice("");
        setMaxPrice("");
        setFromYear("");
        setToYear("");
        setSelectedCategory("");
        setSelectedCondition("");
        setAppliedFilters({
            search: "",
            make: "",
            model: "",
            minPrice: "",
            maxPrice: "",
            fromYear: "",
            toYear: "",
            category: "",
            condition: "",
        });
        setCurrentPage(1);
        if (typeof window !== "undefined") {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete("page");
            window.history.pushState({}, "", currentUrl.toString());
        }
    };

    // Filter vehicles by applied filters
    const filteredVehicles = vehicles.filter((car) => {
        if (appliedFilters.search) {
            const q = appliedFilters.search.toLowerCase().trim();
            const haystack =
                `${car.make} ${car.model} ${car.year} ${car.category} ${car.title} ${car.id}`.toLowerCase();
            if (!haystack.includes(q)) {
                return false;
            }
        }
        if (
            appliedFilters.make &&
            car.make.toLowerCase() !== appliedFilters.make.toLowerCase()
        ) {
            return false;
        }
        if (
            appliedFilters.model &&
            car.model.toLowerCase() !== appliedFilters.model.toLowerCase()
        ) {
            return false;
        }
        if (appliedFilters.category) {
            const filterCat = appliedFilters.category.toLowerCase().trim();
            const carCat = (car.category || "").toLowerCase().trim();
            const normalizedFilter = filterCat.replace(/s$/, "");
            const normalizedCarCat = carCat.replace(/s$/, "");

            if (
                carCat !== filterCat &&
                !carCat.includes(filterCat) &&
                !carCat.includes(normalizedFilter) &&
                !normalizedCarCat.includes(normalizedFilter)
            ) {
                return false;
            }
        }
        if (appliedFilters.condition) {
            const condFilter = appliedFilters.condition.toLowerCase().trim();
            const carCondition = (car.vehicleCondition || car.condition || "")
                .toLowerCase()
                .trim();
            if (!carCondition.includes(condFilter)) {
                return false;
            }
        }
        if (appliedFilters.minPrice) {
            const minP = parseFloat(appliedFilters.minPrice);
            if (!isNaN(minP) && car.price < minP) return false;
        }
        if (appliedFilters.maxPrice) {
            const maxP = parseFloat(appliedFilters.maxPrice);
            if (!isNaN(maxP) && car.price > maxP) return false;
        }
        if (appliedFilters.fromYear) {
            const fromY = parseInt(appliedFilters.fromYear, 10);
            if (!isNaN(fromY) && car.year > 0 && car.year < fromY) return false;
        }
        if (appliedFilters.toYear) {
            const toY = parseInt(appliedFilters.toYear, 10);
            if (!isNaN(toY) && car.year > 0 && car.year > toY) return false;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredVehicles.length / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const currentVehicles = filteredVehicles.slice(
        startIndex,
        startIndex + CARDS_PER_PAGE,
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Update URL query string with the current page without full reload
        if (typeof window !== "undefined") {
            const currentUrl = new URL(window.location.href);
            if (page > 1) {
                currentUrl.searchParams.set("page", String(page));
            } else {
                currentUrl.searchParams.delete("page");
            }
            window.history.pushState({}, "", currentUrl.toString());
        }

        const section = document.getElementById("catalog");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const priceStepOptions = [
        3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000, 40000, 50000,
        75000, 100000,
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: 20 },
        (_, idx) => currentYear - idx,
    );

    return (
        <section id="catalog" className="py-20 bg-bggray font-poppins relative">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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

                {/* Main 2-Column Section: Left Filter Sidebar, Right Vehicle Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT: Filter Vehicles Sidebar (Compact Width: 3 of 12 columns) */}
                        <div className="lg:col-span-3 xl:col-span-3 lg:sticky lg:top-6 z-30 lg:mt-14 mt-0">
                            <div className="bg-slate-800/95 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-5">
                                {/* Filter Card Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-vivid-red/15 text-vivid-red flex items-center justify-center">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">
                                            Filter Vehicles
                                        </h3>
                                    </div>

                                    {(selectedMake ||
                                        selectedModel ||
                                        minPrice ||
                                        maxPrice ||
                                        fromYear ||
                                        toYear ||
                                        selectedCategory) && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-vivid-red bg-vivid-red/10 px-2 py-0.5 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>

                                <form
                                    onSubmit={handleApplyFilters}
                                    className="space-y-4"
                                >
                                    {/* 1. Car Name Dropdown */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Car Name / Make
                                        </label>
                                        <select
                                            value={selectedMake}
                                            onChange={(e) =>
                                                handleMakeChange(e.target.value)
                                            }
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition cursor-pointer"
                                        >
                                            <option value="">All Makes</option>
                                            {makeOptions.map((make) => (
                                                <option key={make} value={make}>
                                                    {make}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Model Dropdown (Works when car name selected) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Model
                                            </label>
                                            {!selectedMake && (
                                                <span className="text-[10px] text-slate-400">
                                                    (Select make first)
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            value={selectedModel}
                                            disabled={!selectedMake}
                                            onChange={(e) =>
                                                setSelectedModel(e.target.value)
                                            }
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition cursor-pointer ${
                                                !selectedMake
                                                    ? "bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed"
                                                    : "bg-slate-900/90 border-slate-700 text-white focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red"
                                            }`}
                                        >
                                            <option value="">
                                                {selectedMake
                                                    ? "All Models"
                                                    : "Choose Car Name First"}
                                            </option>
                                            {modelOptions.map((model) => (
                                                <option
                                                    key={model}
                                                    value={model}
                                                >
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Price Range (Min Price & Max Price in same line) */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Price Range ($)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={minPrice}
                                                onChange={(e) =>
                                                    setMinPrice(e.target.value)
                                                }
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-vivid-red transition cursor-pointer"
                                            >
                                                <option value="">
                                                    Min Price
                                                </option>
                                                {priceStepOptions.map(
                                                    (price) => (
                                                        <option
                                                            key={`min-${price}`}
                                                            value={price}
                                                        >
                                                            $
                                                            {price.toLocaleString()}
                                                        </option>
                                                    ),
                                                )}
                                            </select>

                                            <select
                                                value={maxPrice}
                                                onChange={(e) =>
                                                    setMaxPrice(e.target.value)
                                                }
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-vivid-red transition cursor-pointer"
                                            >
                                                <option value="">
                                                    Max Price
                                                </option>
                                                {priceStepOptions.map(
                                                    (price) => (
                                                        <option
                                                            key={`max-${price}`}
                                                            value={price}
                                                        >
                                                            $
                                                            {price.toLocaleString()}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 4. Year Range (From Year & To Year in same line) */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Year Range
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={fromYear}
                                                onChange={(e) =>
                                                    setFromYear(e.target.value)
                                                }
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-vivid-red transition cursor-pointer"
                                            >
                                                <option value="">
                                                    From Year
                                                </option>
                                                {yearOptions.map((yr) => (
                                                    <option
                                                        key={`from-${yr}`}
                                                        value={yr}
                                                    >
                                                        {yr}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={toYear}
                                                onChange={(e) =>
                                                    setToYear(e.target.value)
                                                }
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-vivid-red transition cursor-pointer"
                                            >
                                                <option value="">
                                                    To Year
                                                </option>
                                                {yearOptions.map((yr) => (
                                                    <option
                                                        key={`to-${yr}`}
                                                        value={yr}
                                                    >
                                                        {yr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 5. Body Style Dropdown */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Body Style
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) =>
                                                setSelectedCategory(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition cursor-pointer"
                                        >
                                            <option value="">
                                                All Body Styles
                                            </option>
                                            {categoryOptions.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Action Buttons: Search Vehicle & Reset Filters */}
                                    <div className="pt-3 space-y-2.5">
                                        <button
                                            type="submit"
                                            className="w-full py-3 px-4 rounded-xl bg-vivid-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 active:scale-95"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                            <span>Search Vehicle</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="w-full py-2.5 px-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors duration-200 flex items-center justify-center space-x-1.5 border border-slate-600/50"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                            <span>Reset Filters</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: Vehicle Grid & Pagination (9 of 12 columns, 3 cards per row on desktop) */}
                        <div className="lg:col-span-9 xl:col-span-9 space-y-8">
                            {/* Filter Summary & Total Count */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pb-2 border-b border-slate-700/60">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span>
                                        Found{" "}
                                        <strong className="text-white text-sm">
                                            {filteredVehicles.length}
                                        </strong>{" "}
                                        vehicles matching your criteria
                                    </span>
                                    {appliedFilters.search && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple/40 text-purple-200 border border-purple-400/30 text-[11px] font-semibold">
                                            Search: "{appliedFilters.search}"
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchKeyword("");
                                                    setAppliedFilters(
                                                        (prev) => ({
                                                            ...prev,
                                                            search: "",
                                                        }),
                                                    );
                                                }}
                                                className="hover:text-white transition"
                                                title="Remove search filter"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {appliedFilters.condition && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vivid-red/20 text-vivid-red border border-vivid-red/30 text-[11px] font-semibold">
                                            Condition:{" "}
                                            {appliedFilters.condition}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCondition("");
                                                    setAppliedFilters(
                                                        (prev) => ({
                                                            ...prev,
                                                            condition: "",
                                                        }),
                                                    );
                                                }}
                                                className="hover:text-white transition"
                                                title="Remove condition filter"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {appliedFilters.category && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-semibold">
                                            Body Style:{" "}
                                            {appliedFilters.category}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory("");
                                                    setAppliedFilters(
                                                        (prev) => ({
                                                            ...prev,
                                                            category: "",
                                                        }),
                                                    );
                                                }}
                                                className="hover:text-white transition"
                                                title="Remove body style filter"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                </div>
                                {filteredVehicles.length > 0 && (
                                    <span>
                                        Page {currentPage} of {totalPages || 1}
                                    </span>
                                )}
                            </div>

                            {/* Empty Results State */}
                            {filteredVehicles.length === 0 ? (
                                <div className="text-center py-20 bg-slate-800/80 rounded-3xl border border-slate-700/70 p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-white">
                                        No Vehicles Match Your Search
                                    </h3>
                                    <p className="text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                                        Try adjusting your price range, year, or
                                        model selection.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="mt-5 px-5 py-2.5 rounded-xl bg-vivid-red text-white text-xs font-bold hover:bg-red-600 transition shadow"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                /* Vehicle Cards Grid: 2 columns on iPad (md/lg), 3 columns on desktop (xl) */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentVehicles.map((car) => (
                                        <VehicleCard
                                            key={car.id}
                                            car={car}
                                            currentPage={currentPage}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-700 text-white">
                                    <p className="text-xs text-slate-300">
                                        Showing{" "}
                                        <span className="font-bold text-white">
                                            {startIndex + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-bold text-white">
                                            {Math.min(
                                                startIndex + CARDS_PER_PAGE,
                                                filteredVehicles.length,
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-bold text-white">
                                            {filteredVehicles.length}
                                        </span>{" "}
                                        vehicles
                                    </p>

                                    <div className="flex items-center space-x-2">
                                        {/* Prev Page Button */}
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1,
                                                )
                                            }
                                            aria-label="Previous page"
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                                currentPage === 1
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                                    : "bg-slate-800 hover:bg-vivid-red text-white border border-slate-700 shadow"
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
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                                    currentPage === pageNum
                                                        ? "bg-vivid-red text-white scale-105 shadow-red-500/30"
                                                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}

                                        {/* Next Page Button */}
                                        <button
                                            type="button"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1,
                                                )
                                            }
                                            aria-label="Next page"
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                                currentPage === totalPages
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                                    : "bg-slate-800 hover:bg-vivid-red text-white border border-slate-700 shadow"
                                            }`}
                                        >
                                            <span>Next</span>
                                            <span>&rarr;</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
