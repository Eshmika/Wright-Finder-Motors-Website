import { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import CallToActionSection from "@/Pages/Home/CallToActionSection";
import { PageProps } from "@/types";
import { DetailedVehicle, fetchAllVehicles } from "@/Services/vehicleService";

interface VehicleDetailProps extends PageProps {
    id: string;
}

export default function VehicleDetail({ auth, id }: VehicleDetailProps) {
    const [vehicle, setVehicle] = useState<DetailedVehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function loadVehicle() {
            try {
                setIsLoading(true);
                setError(null);
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
                        setError("Vehicle not found or may have been sold.");
                        setIsLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    setVehicle(found);
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Failed to load vehicle details:", err);
                if (isMounted) {
                    setError("Failed to load vehicle details from inventory.");
                    setIsLoading(false);
                }
            }
        }

        loadVehicle();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const hasDiscount =
        vehicle &&
        vehicle.originalPrice > 0 &&
        vehicle.discount > 0 &&
        vehicle.originalPrice >= vehicle.discount;

    const discountAmount = hasDiscount ? vehicle.discount : 0;
    const discountPercentage =
        hasDiscount && vehicle.originalPrice > 0
            ? Math.round((discountAmount / vehicle.originalPrice) * 100)
            : 0;

    return (
        <div className="min-h-screen flex flex-col bg-bggray text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head
                title={
                    vehicle
                        ? `${vehicle.make} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ""} - Wright Finder Motors`
                        : "Vehicle Details - Wright Finder Motors"
                }
            />

            {/* Header */}
            <Header user={auth?.user} />

            {/* Main Content Area with bggray theme */}
            <main className="flex-1 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Bottom Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                        <Link
                            href="/buy"
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition border border-slate-700"
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
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            <span>Back to Vehicle Catalog</span>
                        </Link>
                    </div>
                    {/* Breadcrumbs Navigation */}
                    <nav className="flex items-center space-x-2 text-xs md:text-sm text-slate-300">
                        <Link
                            href="/"
                            className="hover:text-vivid-red transition-colors"
                        >
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/buy"
                            className="hover:text-vivid-red transition-colors"
                        >
                            Inventory
                        </Link>
                        <span>/</span>
                        <span className="text-white font-medium truncate max-w-xs md:max-w-md">
                            {vehicle
                                ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                                : "Vehicle Details"}
                        </span>
                    </nav>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl">
                            <div className="w-14 h-14 border-4 border-vivid-red border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-white">
                                Loading Vehicle Details...
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Fetching the complete technical specs & live
                                photos.
                            </p>
                        </div>
                    )}

                    {/* Error / Not Found State */}
                    {!isLoading && (error || !vehicle) && (
                        <div className="min-h-[450px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-vivid-red flex items-center justify-center text-2xl font-black">
                                !
                            </div>
                            <h3 className="text-2xl font-black text-white">
                                {error || "Vehicle Not Found"}
                            </h3>
                            <p className="text-slate-400 max-w-md text-sm">
                                The vehicle you are looking for is either no
                                longer available or the link is incorrect.
                            </p>
                            <Link
                                href="/buy"
                                className="mt-4 inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-vivid-red text-white text-sm font-bold shadow-lg hover:bg-red-600 transition"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                <span>Back to Vehicle Inventory</span>
                            </Link>
                        </div>
                    )}

                    {/* Vehicle Details Content */}
                    {!isLoading && vehicle && (
                        <div className="space-y-10">
                            {/* COMMON VEHICLE SALE HERO HEADER: Title, Badges, Key Stats */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="space-y-2.5">
                                        {/* Status & Category Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {vehicle.availabilities && (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                        vehicle.availabilities.toLowerCase() ===
                                                        "available"
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                    }`}
                                                >
                                                    {vehicle.availabilities}
                                                </span>
                                            )}
                                            {vehicle.condition && (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-vivid-red/20 text-vivid-red border border-vivid-red/30">
                                                    {vehicle.condition}
                                                </span>
                                            )}
                                            {vehicle.bodyStyle && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                                    {vehicle.bodyStyle}
                                                </span>
                                            )}
                                            {vehicle.id && (
                                                <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800">
                                                    ID: {vehicle.id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Main Heading Title : "Car Name" + "Model" + "Year" */}
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                            {vehicle.make} {vehicle.model}{" "}
                                            {vehicle.year && vehicle.year > 0
                                                ? vehicle.year
                                                : ""}
                                        </h1>

                                        {/* Quick Key Highlights Bar */}
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-300 pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-vivid-red"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 7v5l3 3"
                                                    />
                                                </svg>
                                                <span>
                                                    {vehicle.mileage
                                                        ? `${vehicle.mileage} km`
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-vivid-red"
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
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="3"
                                                    />
                                                </svg>
                                                <span>
                                                    {vehicle.transmission ||
                                                        "Automatic"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-vivid-red"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                                    />
                                                </svg>
                                                <span>
                                                    {vehicle.fuelType ||
                                                        "Gasoline"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-vivid-red"
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
                                                <span>
                                                    Title:{" "}
                                                    {vehicle.titleStatus ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action shortcuts / Share / Print */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator
                                                        .share({
                                                            title: vehicle.title,
                                                            url: window.location
                                                                .href,
                                                        })
                                                        .catch(() => {});
                                                } else {
                                                    navigator.clipboard.writeText(
                                                        window.location.href,
                                                    );
                                                    alert(
                                                        "Vehicle link copied to clipboard!",
                                                    );
                                                }
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-semibold flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                />
                                            </svg>
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SPLIT SHOWCASE: Left Gallery (8 cols) + Right Pricing & Purchase Box (4 cols) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* LEFT: Large Photo Gallery (8 of 12 columns) */}
                                <div className="lg:col-span-8 space-y-4">
                                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden">
                                        {/* Main Selected Image Viewer */}
                                        <div className="relative w-full h-[340px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group">
                                            {vehicle.images.length > 0 ? (
                                                <img
                                                    src={
                                                        vehicle.images[
                                                            activeImageIndex
                                                        ]
                                                    }
                                                    alt={`${vehicle.title} - photo ${activeImageIndex + 1}`}
                                                    className="w-full h-full object-cover sm:object-contain object-center transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 p-8 text-center">
                                                    <svg
                                                        className="w-16 h-16 stroke-current"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-medium">
                                                        No Images Available For
                                                        This Vehicle
                                                    </span>
                                                </div>
                                            )}

                                            {/* Photo Count Pill */}
                                            {vehicle.images.length > 0 && (
                                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                                                    <svg
                                                        className="w-3.5 h-3.5 text-vivid-red"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    <span>
                                                        {activeImageIndex + 1} /{" "}
                                                        {vehicle.images.length}{" "}
                                                        Photos
                                                    </span>
                                                </div>
                                            )}

                                            {/* Left / Right Arrow Controls */}
                                            {vehicle.images.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveImageIndex(
                                                                (prev) =>
                                                                    prev === 0
                                                                        ? vehicle
                                                                              .images
                                                                              .length -
                                                                          1
                                                                        : prev -
                                                                          1,
                                                            )
                                                        }
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-lg opacity-80 group-hover:opacity-100"
                                                        aria-label="Previous Image"
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
                                                        onClick={() =>
                                                            setActiveImageIndex(
                                                                (prev) =>
                                                                    prev ===
                                                                    vehicle
                                                                        .images
                                                                        .length -
                                                                        1
                                                                        ? 0
                                                                        : prev +
                                                                          1,
                                                            )
                                                        }
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-lg opacity-80 group-hover:opacity-100"
                                                        aria-label="Next Image"
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
                                                </>
                                            )}
                                        </div>

                                        {/* Thumbnail Navigation Carousel */}
                                        {vehicle.images.length > 1 && (
                                            <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                                                {vehicle.images.map(
                                                    (img, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() =>
                                                                setActiveImageIndex(
                                                                    idx,
                                                                )
                                                            }
                                                            className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                                                activeImageIndex ===
                                                                idx
                                                                    ? "border-vivid-red ring-2 ring-vivid-red/30 scale-105"
                                                                    : "border-slate-800 opacity-60 hover:opacity-100"
                                                            }`}
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`Thumbnail ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: Common Vehicle Sale Pricing, Deal & Inquire Box (4 of 12 columns) */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 lg:sticky lg:top-8">
                                        {/* Price Header */}
                                        <div className="space-y-2 pb-5 border-b border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                                                    {hasDiscount
                                                        ? "Special Discount Price"
                                                        : "Listed Price"}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-vivid-red text-white text-[11px] font-extrabold shadow-sm">
                                                        -{discountPercentage}%
                                                        OFF
                                                    </span>
                                                )}
                                            </div>

                                            {/* Primary Price: "Price" - "Discount" */}
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-4xl font-black text-white tracking-tight">
                                                    $
                                                    {vehicle.price.toLocaleString()}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-lg font-semibold text-slate-400 line-through decoration-vivid-red decoration-2">
                                                        $
                                                        {vehicle.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Savings Tag */}
                                            {hasDiscount && (
                                                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                                                    <svg
                                                        className="w-4 h-4 text-emerald-400 shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span>
                                                        You save $
                                                        {discountAmount.toLocaleString()}{" "}
                                                        today!
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Dealership Assurance Badges */}
                                        <div className="space-y-3 py-1">
                                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-vivid-red shrink-0">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">
                                                        Verified Clean Title /
                                                        History
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        Inspected by Wright
                                                        Finder Motors
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-vivid-red shrink-0">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">
                                                        Transparent Cash & Deal
                                                        Pricing
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        No hidden dealership
                                                        handling surprises
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const email =
                                                        vehicle.clientEmail?.trim();
                                                    if (!email) {
                                                        router.visit(
                                                            "/contact#contact-form",
                                                        );
                                                        return;
                                                    }
                                                    const subject =
                                                        encodeURIComponent(
                                                            `Vehicle Inquiry: ${vehicle.make} ${vehicle.model} ${vehicle.year} (ID: ${vehicle.id})`,
                                                        );
                                                    const body =
                                                        encodeURIComponent(
                                                            `Hello,\n\nI am interested in purchasing this vehicle:\n- Car: ${vehicle.title}\n- ID: ${vehicle.id}\n- Listed Price: $${vehicle.price.toLocaleString()}\n- Mileage: ${vehicle.mileage}\n\nPlease contact me regarding test drive availability and purchase steps.\n\nThank you!`,
                                                        );
                                                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                                                }}
                                                className="w-full py-3.5 px-4 rounded-xl bg-vivid-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 active:scale-95"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span>
                                                    Contact Agent About This Car
                                                </span>
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`tel:${vehicle.clientPhone || "+19378388616"}`}
                                                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5 text-vivid-red"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>
                                                    <span>Call Agent</span>
                                                </a>

                                                <Link
                                                    href="/contact#contact-form"
                                                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5 text-vivid-red"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                        />
                                                    </svg>
                                                    <span>Schedule Visit</span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Direct Contact Agent Information Snippet */}
                                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                            <span>Assigned Agent:</span>
                                            <span className="font-semibold text-slate-200">
                                                {vehicle.clientName ||
                                                    "Wright Finder Motors"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DETAILED SPECIFICATIONS GRID (Vehicle Overview & Power & Performance) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* 1. Vehicle Overview */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                                        <div className="w-10 h-10 rounded-xl bg-vivid-red/10 border border-vivid-red/20 text-vivid-red flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white tracking-tight">
                                                Vehicle Overview
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                Core chassis, body &
                                                registration specifications
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <SpecItem
                                            label="Make"
                                            value={vehicle.make}
                                        />
                                        <SpecItem
                                            label="Model"
                                            value={vehicle.model}
                                        />
                                        <SpecItem
                                            label="Year"
                                            value={
                                                vehicle.year && vehicle.year > 0
                                                    ? vehicle.year
                                                    : ""
                                            }
                                        />
                                        <SpecItem
                                            label="VIN"
                                            value={vehicle.vin}
                                        />
                                        <SpecItem
                                            label="Availabilities"
                                            value={vehicle.availabilities}
                                            highlight={
                                                vehicle.availabilities?.toLowerCase() ===
                                                "available"
                                            }
                                        />
                                        <SpecItem
                                            label="Title"
                                            value={vehicle.titleStatus}
                                        />
                                        <SpecItem
                                            label="Trim"
                                            value={vehicle.trim}
                                        />
                                        <SpecItem
                                            label="Body Style"
                                            value={vehicle.bodyStyle}
                                        />
                                        <SpecItem
                                            label="Mileage"
                                            value={vehicle.mileage}
                                            suffix=" km"
                                        />
                                        <SpecItem
                                            label="Exterior Color"
                                            value={vehicle.exteriorColor}
                                        />
                                        <SpecItem
                                            label="Interior Color"
                                            value={vehicle.interiorColor}
                                        />
                                        <SpecItem
                                            label="Seat Material"
                                            value={vehicle.seatMaterial}
                                        />
                                    </div>
                                </div>

                                {/* 2. Power & Performance */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                                        <div className="w-10 h-10 rounded-xl bg-vivid-red/10 border border-vivid-red/20 text-vivid-red flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5"
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
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white tracking-tight">
                                                Power & Performance
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                Powertrain, mechanics & drive
                                                conditioning
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <SpecItem
                                            label="Engine"
                                            value={vehicle.engine}
                                        />
                                        <SpecItem
                                            label="Engine Type/Size"
                                            value={vehicle.engineTypeSize}
                                        />
                                        <SpecItem
                                            label="Transmission"
                                            value={vehicle.transmission}
                                        />
                                        <SpecItem
                                            label="Driveline"
                                            value={vehicle.driveline}
                                        />
                                        <SpecItem
                                            label="Fuel Type"
                                            value={vehicle.fuelType}
                                        />
                                        <SpecItem
                                            label="Power Options"
                                            value={vehicle.powerOptions}
                                        />
                                        <SpecItem
                                            label="Condition"
                                            value={vehicle.condition}
                                        />
                                        <SpecItem
                                            label="Drive Condition"
                                            value={vehicle.driveCondition}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Features & Condition (Interior Features divided by comma) */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                                <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-vivid-red/10 border border-vivid-red/20 text-vivid-red flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">
                                            Features & Condition
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Interior luxury, electronics &
                                            safety inclusions
                                        </p>
                                    </div>
                                </div>

                                {vehicle.interiorFeatures &&
                                vehicle.interiorFeatures.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {vehicle.interiorFeatures.map(
                                            (feat, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center space-x-2.5 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-slate-200 hover:border-vivid-red/40 transition"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-vivid-red shrink-0"></div>
                                                    <span
                                                        className="text-xs font-semibold truncate"
                                                        title={feat}
                                                    >
                                                        {feat}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-sm font-semibold">
                                        N/A
                                    </div>
                                )}
                            </div>

                            {/* 4. Client Information Card */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                                <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-vivid-red/10 border border-vivid-red/20 text-vivid-red flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">
                                            Client Information
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Agent & client contact points for
                                            quick consultation
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SpecItem
                                        label="CLIENT NAME"
                                        value={vehicle.clientName}
                                    />
                                    <SpecItem
                                        label="Client Phone"
                                        value={vehicle.clientPhone}
                                        isPhone
                                    />
                                    <SpecItem
                                        label="Client Email"
                                        value={vehicle.clientEmail}
                                        isEmail
                                    />
                                    <SpecItem
                                        label="PURCHASE DATE"
                                        value={vehicle.purchaseDate}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Call to Action Section */}
            <CallToActionSection />

            {/* Footer */}
            <Footer />
        </div>
    );
}

function SpecItem({
    label,
    value,
    suffix = "",
    highlight = false,
    isPhone = false,
    isEmail = false,
}: {
    label: string;
    value?: string | number | null;
    suffix?: string;
    highlight?: boolean;
    isPhone?: boolean;
    isEmail?: boolean;
}) {
    const rawStr =
        value !== undefined && value !== null ? String(value).trim() : "";
    const isMissing = !rawStr || (label === "Year" && rawStr === "0");
    const displayText = isMissing ? "N/A" : `${rawStr}${suffix}`;

    return (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/90 transition">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                {label}
            </span>
            {isMissing ? (
                <span className="text-sm font-semibold text-slate-400">
                    N/A
                </span>
            ) : isPhone ? (
                <a
                    href={`tel:${rawStr}`}
                    className="text-sm font-semibold text-white hover:text-vivid-red transition truncate"
                >
                    {displayText}
                </a>
            ) : isEmail ? (
                <a
                    href={`mailto:${rawStr}`}
                    className="text-sm font-semibold text-white hover:text-vivid-red transition truncate"
                >
                    {displayText}
                </a>
            ) : (
                <span
                    className={`text-sm font-semibold truncate ${
                        highlight ? "text-emerald-400 font-bold" : "text-white"
                    }`}
                    title={displayText}
                >
                    {displayText}
                </span>
            )}
        </div>
    );
}
