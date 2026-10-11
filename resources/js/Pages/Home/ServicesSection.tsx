import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

interface ShowcaseVehicle {
    id: string;
    carName: string;
    model: string;
    year: string;
    price: number;
    discount: number;
    finalPrice: number;
    imageUrl: string;
}

// Convert Google Drive share link to direct image viewable URL
function formatDriveImageUrl(url: string): string {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";

    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

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

// 4 Condition categories for Row 2
const CONDITION_CATEGORIES = [
    {
        key: "New",
        title: "New Cars",
        subtitle: "Zero miles, latest models with peak factory warranties",
        tag: "Factory Fresh",
        countBadge: "Top Tier",
        bgGradient: "from-sky-950/90 via-slate-900/80 to-black/90",
        accentColor: "from-cyan-500 to-blue-600",
        badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    },
    {
        key: "Pre-owned",
        title: "Pre-Owned",
        subtitle: "Multi-point checked & verified for premium peace of mind",
        tag: "Certified Standard",
        countBadge: "Top Pick",
        bgGradient: "from-emerald-950/90 via-slate-900/80 to-black/90",
        accentColor: "from-emerald-500 to-teal-600",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    },
    {
        key: "Used",
        title: "Used Cars",
        subtitle: "Budget-friendly, high-value daily drivers road-tested daily",
        tag: "Great Value",
        countBadge: "Popular",
        bgGradient: "from-amber-950/90 via-slate-900/80 to-black/90",
        accentColor: "from-amber-500 to-orange-600",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    },
    {
        key: "Salvage",
        title: "Salvage",
        subtitle:
            "Exceptional rebuild & project opportunities at huge discounts",
        tag: "Best Bargain",
        countBadge: "Max Savings",
        bgGradient: "from-rose-950/90 via-slate-900/80 to-black/90",
        accentColor: "from-vivid-red to-rose-700",
        badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/30",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    },
];

export default function ServicesSection() {
    const [vehicles, setVehicles] = useState<ShowcaseVehicle[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const SHEET_CSV_URL =
        "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/gviz/tq?tqx=out:csv&sheet=Vehicle%20details";

    useEffect(() => {
        let isMounted = true;

        async function fetchVehicleData() {
            try {
                const res = await fetch(SHEET_CSV_URL);
                if (!res.ok) throw new Error("Failed to fetch sheet");
                const text = await res.text();
                const rows = parseCsv(text);

                if (rows.length < 2) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                const headers = rows[0].map((h) => h.trim());
                const getIndex = (name: string): number => {
                    return headers.findIndex(
                        (h) => h.toLowerCase() === name.toLowerCase(),
                    );
                };

                const carIdIdx = getIndex("Car ID");
                const carNameIdx = getIndex("Car Name");
                const modelIdx = getIndex("Model");
                const yearIdx = getIndex("Year");
                const priceIdx = getIndex("Price");
                const discountIdx = getIndex("Discount");
                const mainImageIdx = getIndex("Main Image URLs");

                const list: ShowcaseVehicle[] = [];

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;

                    const carName =
                        carNameIdx !== -1 ? row[carNameIdx]?.trim() || "" : "";
                    const model =
                        modelIdx !== -1 ? row[modelIdx]?.trim() || "" : "";
                    const year =
                        yearIdx !== -1 ? row[yearIdx]?.trim() || "" : "";
                    const rawMainImage =
                        mainImageIdx !== -1
                            ? row[mainImageIdx]?.trim() || ""
                            : "";

                    // We need cars with images for the background showcase
                    if (!rawMainImage || (!carName && !model)) continue;

                    const price =
                        priceIdx !== -1
                            ? parseFloat(
                                  row[priceIdx]?.replace(/[^0-9.]/g, "") || "0",
                              )
                            : 0;
                    const discount =
                        discountIdx !== -1
                            ? parseFloat(
                                  row[discountIdx]?.replace(/[^0-9.]/g, "") ||
                                      "0",
                              )
                            : 0;

                    const finalPrice =
                        discount > 0 && price >= discount
                            ? price - discount
                            : price;

                    // First image from comma separated Main Image URLs
                    const firstImageRaw = rawMainImage.split(",")[0].trim();
                    const directImageUrl = formatDriveImageUrl(firstImageRaw);

                    if (directImageUrl) {
                        list.push({
                            id:
                                carIdIdx !== -1
                                    ? row[carIdIdx]?.trim() || `car-${i}`
                                    : `car-${i}`,
                            carName,
                            model,
                            year,
                            price,
                            discount,
                            finalPrice,
                            imageUrl: directImageUrl,
                        });
                    }
                }

                if (isMounted) {
                    // Randomize vehicles for a dynamic showcase
                    const shuffled = [...list].sort(() => 0.5 - Math.random());
                    setVehicles(shuffled);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error loading showcase vehicles:", err);
                if (isMounted) setIsLoading(false);
            }
        }

        fetchVehicleData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Automatic slide every 4.5 seconds (pauses on hover)
    useEffect(() => {
        if (vehicles.length <= 1 || isHovered) return;

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % vehicles.length);
        }, 4500);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [vehicles.length, isHovered]);

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? vehicles.length - 1 : prev - 1,
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev === vehicles.length - 1 ? 0 : prev + 1,
        );
    };

    const handleCardClick = (conditionKey: string) => {
        router.visit(`/buy?condition=${encodeURIComponent(conditionKey)}`);
    };

    const currentCar = vehicles[currentIndex];

    return (
        <section className="py-20 bg-bggray font-poppins relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Section Header */}{" "}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Explore Our Best Deals
                    </h2>
                    <p className="text-sm lg:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Discover top picks from our verified live inventory or
                        jump directly into vehicles suited to your lifestyle and
                        budget.
                    </p>
                </div>
                {/* ROW 1: Full-Width Card Slider (Random Cars Showcase) - 60vh Height */}
                <div
                    className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-slate-950 group h-[60vh] min-h-[420px] max-h-[680px]"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {isLoading ? (
                        <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-4">
                            <div className="w-12 h-12 border-4 border-vivid-red border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-gray-300">
                                Loading featured showroom vehicles...
                            </p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="h-full w-full flex flex-col items-center justify-center text-white p-8 text-center">
                            <p className="text-lg font-bold text-gray-200">
                                Featured vehicles temporarily unavailable.
                            </p>
                            <button
                                onClick={() => router.visit("/buy")}
                                className="mt-4 px-6 py-2.5 rounded-xl bg-vivid-red text-white text-sm font-bold shadow-lg hover:bg-red-600 transition"
                            >
                                Browse All Vehicles
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Background Image with Cinematic Overlay */}
                            <div className="absolute inset-0">
                                <img
                                    key={currentCar.imageUrl}
                                    src={currentCar.imageUrl}
                                    alt={`${currentCar.carName} ${currentCar.model}`}
                                    className="w-full h-full object-cover object-center transition-all duration-1000 ease-out transform scale-105 group-hover:scale-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-black/25"></div>
                            </div>

                            {/* Top Right: Counter indicator */}
                            <div className="absolute top-5 right-5 z-10">
                                <span className="px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-gray-300 text-xs font-mono font-medium">
                                    {currentIndex + 1} / {vehicles.length}
                                </span>
                            </div>

                            {/* Center and slightly down: Creative Text Label */}
                            <div className="absolute inset-x-0 bottom-6 sm:bottom-8 md:bottom-10 z-20 flex flex-col items-center justify-center px-4">
                                <div className="max-w-xl w-full backdrop-blur-md border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl text-center">
                                    {/* Car Title: Year + Car Name + Model */}
                                    <div className="space-y-0.5">
                                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-vivid-red/20 border border-vivid-red/40 text-vivid-red text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1">
                                            Special Spotlight Deal
                                        </div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                            {currentCar.year
                                                ? `${currentCar.year} `
                                                : ""}
                                            {currentCar.carName}{" "}
                                            {currentCar.model}
                                        </h3>
                                    </div>

                                    {/* Price Label: Price + (Price - Discount) */}
                                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
                                        {/* Original Price */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                Original Price
                                            </span>
                                            <span className="text-base sm:text-lg font-bold text-gray-300 line-through decoration-vivid-red decoration-2">
                                                $
                                                {currentCar.price.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Arrow / Divider */}
                                        <span className="text-gray-500 hidden sm:inline text-base">
                                            →
                                        </span>

                                        {/* Final Price: Price - Discount */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-vivid-red">
                                                {currentCar.discount > 0
                                                    ? "Deal Price (Price - Discount)"
                                                    : "Discount Price"}
                                            </span>
                                            <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                                                $
                                                {currentCar.finalPrice.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Discount Save Badge */}
                                        {currentCar.discount > 0 && (
                                            <div className="sm:ml-1">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-vivid-red text-white text-[11px] sm:text-xs font-extrabold shadow-lg shadow-red-500/30">
                                                    Save $
                                                    {currentCar.discount.toLocaleString()}
                                                    !
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button inside label */}
                                    <div className="mt-3 sm:mt-4">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(`/buy`)}
                                            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-500/30 active:scale-95"
                                        >
                                            <span>View In Catalog</span>
                                            <svg
                                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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

                            {/* Slider Navigation Arrows */}
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-vivid-red text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
                                aria-label="Previous Vehicle"
                            >
                                <svg
                                    className="w-5 h-5"
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
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-vivid-red text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
                                aria-label="Next Vehicle"
                            >
                                <svg
                                    className="w-5 h-5"
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
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5">
                                {vehicles.slice(0, 8).map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentIndex % 8
                                                ? "w-7 bg-vivid-red"
                                                : "w-2 bg-white/40 hover:bg-white/70"
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                {/* ROW 2: 4 Condition Cards (New, Pre-owned, Used, Salvage) */}
                <div className="space-y-10 pt-20">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-widest font-extrabold text-vivid-red">
                                By Vehicle Condition
                            </span>
                            <h3 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mt-1">
                                Find by Vehicle Condition
                            </h3>
                        </div>
                        <p className="text-sm lg:text-base text-gray-200 mx-auto leading-relaxed max-w-md">
                            Select a category below to instantly filter our
                            inventory by vehicle condition.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CONDITION_CATEGORIES.map((card) => (
                            <div
                                key={card.key}
                                onClick={() => handleCardClick(card.key)}
                                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/80 bg-slate-900"
                            >
                                {/* Background Image with zoom on hover */}
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-t ${card.bgGradient} opacity-90 group-hover:opacity-85 transition-opacity duration-300`}
                                ></div>

                                {/* Top Badges */}
                                <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${card.badgeBg}`}
                                    >
                                        {card.tag}
                                    </span>
                                    <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider">
                                        {card.countBadge}
                                    </span>
                                </div>

                                {/* Bottom Content */}
                                <div className="absolute inset-x-0 bottom-0 p-6 z-10 space-y-3">
                                    <div>
                                        <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-vivid-red transition-colors duration-200">
                                            {card.title}
                                        </h4>
                                        <p className="text-xs text-gray-300 mt-1.5 leading-relaxed line-clamp-2">
                                            {card.subtitle}
                                        </p>
                                    </div>

                                    {/* Action link */}
                                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                                        <span className="text-xs font-bold text-white group-hover:text-vivid-red transition-colors inline-flex items-center space-x-1.5">
                                            <span>Browse {card.title}</span>
                                            <svg
                                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-vivid-red text-white flex items-center justify-center transition-colors">
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
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
