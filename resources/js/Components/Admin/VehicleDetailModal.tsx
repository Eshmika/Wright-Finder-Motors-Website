import { DetailedVehicle } from "@/Services/vehicleService";
import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface VehicleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: DetailedVehicle | null;
    onEdit?: (vehicle: DetailedVehicle) => void;
}

export default function VehicleDetailModal({
    isOpen,
    onClose,
    vehicle,
    onEdit,
}: VehicleDetailModalProps) {
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    // Reset active image when vehicle changes
    useEffect(() => {
        setActiveImageIndex(0);
    }, [vehicle?.id]);

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !vehicle) return null;

    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0";
        return `$${val.toLocaleString()}`;
    };

    const images =
        vehicle.images && vehicle.images.length > 0
            ? vehicle.images
            : vehicle.mainImageUrl
              ? [vehicle.mainImageUrl]
              : [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with smooth blur */}
            <div
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
                <div
                    className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8 animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-dark-purple/10 text-dark-purple flex items-center justify-center shrink-0">
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            </div>
                            <div className="truncate">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-black text-slate-900 truncate">
                                        {vehicle.make} {vehicle.model}{" "}
                                        {vehicle.year
                                            ? `(${vehicle.year})`
                                            : ""}
                                    </h3>
                                    {vehicle.id && (
                                        <span className="text-[10px] font-mono font-bold uppercase bg-vivid-red text-white px-2 py-0.5 rounded-full shrink-0">
                                            {vehicle.id}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                    Vehicle Details Panel &bull; Inventory
                                    Overview
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onEdit(vehicle);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-dark-purple text-white shadow-sm hover:bg-dark-purple/90 transition active:scale-95"
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    <span>Edit Vehicle</span>
                                </button>
                            )}

                            <Link
                                href={`/vehicles/${encodeURIComponent(vehicle.id)}`}
                                target="_blank"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition"
                            >
                                <span>Public Page</span>
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
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </Link>

                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                title="Close"
                            >
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 sm:p-8 space-y-6 max-h-[calc(88vh-75px)] overflow-y-auto">
                        {/* Top Pricing & Status Bar */}
                        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {vehicle.availabilities && (
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                vehicle.availabilities.toLowerCase() ===
                                                "available"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    : vehicle.availabilities.toLowerCase() ===
                                                        "sold"
                                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                            }`}
                                        >
                                            {vehicle.availabilities}
                                        </span>
                                    )}
                                    {vehicle.rentOrSell && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple/10 text-purple border border-purple/20">
                                            Category: {vehicle.rentOrSell}
                                        </span>
                                    )}
                                    {vehicle.titleStatus && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                            Title: {vehicle.titleStatus}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-3 pt-1">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                        {formatCurrency(vehicle.price)}
                                    </span>
                                    {vehicle.discount > 0 &&
                                        vehicle.originalPrice >
                                            vehicle.discount && (
                                            <span className="text-base font-semibold text-slate-400 line-through">
                                                {formatCurrency(
                                                    vehicle.originalPrice,
                                                )}
                                            </span>
                                        )}
                                    {vehicle.discount > 0 && (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                            Save{" "}
                                            {formatCurrency(vehicle.discount)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Mileage
                                    </span>
                                    <span className="font-bold text-slate-800 text-sm">
                                        {vehicle.mileage || "N/A"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Transmission
                                    </span>
                                    <span
                                        className="font-bold text-slate-800 text-sm truncate block"
                                        title={vehicle.transmission}
                                    >
                                        {vehicle.transmission || "N/A"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Fuel Type
                                    </span>
                                    <span className="font-bold text-slate-800 text-sm">
                                        {vehicle.fuelType || "N/A"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        VIN
                                    </span>
                                    <span
                                        className="font-bold text-slate-800 text-xs font-mono truncate block"
                                        title={vehicle.vin}
                                    >
                                        {vehicle.vin || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Photo Gallery Viewer */}
                        {images.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                                <div className="relative w-full h-[280px] sm:h-[400px] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                                    <img
                                        src={
                                            images[activeImageIndex] ||
                                            images[0]
                                        }
                                        alt={vehicle.title}
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
                                        {activeImageIndex + 1} / {images.length}{" "}
                                        Photos
                                    </div>

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(
                                                        (prev) =>
                                                            prev === 0
                                                                ? images.length -
                                                                  1
                                                                : prev - 1,
                                                    )
                                                }
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-sm transition shadow-lg"
                                                aria-label="Previous image"
                                            >
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
                                                            images.length - 1
                                                                ? 0
                                                                : prev + 1,
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/70 hover:bg-vivid-red text-white backdrop-blur-sm transition shadow-lg"
                                                aria-label="Next image"
                                            >
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
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(idx)
                                                }
                                                className={`w-18 h-13 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
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
                        )}

                        {/* Specifications Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Vehicle Overview */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
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
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Vehicle Overview
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Chassis, model, registration &
                                            styling
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <SpecBox
                                        label="Make"
                                        value={vehicle.make}
                                    />
                                    <SpecBox
                                        label="Model"
                                        value={vehicle.model}
                                    />
                                    <SpecBox
                                        label="Year"
                                        value={vehicle.year}
                                    />
                                    <SpecBox
                                        label="Trim"
                                        value={vehicle.trim}
                                    />
                                    <SpecBox label="VIN" value={vehicle.vin} />
                                    <SpecBox
                                        label="Body Style"
                                        value={vehicle.bodyStyle}
                                    />
                                    <SpecBox
                                        label="Exterior Color"
                                        value={vehicle.exteriorColor}
                                    />
                                    <SpecBox
                                        label="Interior Color"
                                        value={vehicle.interiorColor}
                                    />
                                    <SpecBox
                                        label="Seat Material"
                                        value={vehicle.seatMaterial}
                                    />
                                    <SpecBox
                                        label="Title Status"
                                        value={vehicle.titleStatus}
                                    />
                                </div>
                            </div>

                            {/* Power & Performance */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-dark-blue flex items-center justify-center shrink-0">
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
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Power & Mechanics
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Engine, transmission, drivetrain &
                                            condition
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <SpecBox
                                        label="Engine"
                                        value={vehicle.engine}
                                    />
                                    <SpecBox
                                        label="Engine Type/Size"
                                        value={vehicle.engineTypeSize}
                                    />
                                    <SpecBox
                                        label="Transmission"
                                        value={vehicle.transmission}
                                    />
                                    <SpecBox
                                        label="Driveline"
                                        value={vehicle.driveline}
                                    />
                                    <SpecBox
                                        label="Fuel Type"
                                        value={vehicle.fuelType}
                                    />
                                    <SpecBox
                                        label="Power Options"
                                        value={vehicle.powerOptions}
                                    />
                                    <SpecBox
                                        label="Condition"
                                        value={vehicle.condition}
                                    />
                                    <SpecBox
                                        label="Drive Condition"
                                        value={vehicle.driveCondition}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features & Inclusions */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Features & Inclusions
                                    </h4>
                                    <p className="text-[11px] text-slate-500">
                                        Interior luxury, electronic options &
                                        conveniences
                                    </p>
                                </div>
                            </div>

                            {vehicle.interiorFeatures &&
                            vehicle.interiorFeatures.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {vehicle.interiorFeatures.map(
                                        (feat, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-dark-purple" />
                                                <span>{feat}</span>
                                            </span>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">
                                    No specific features listed for this
                                    vehicle.
                                </p>
                            )}
                        </div>

                        {/* Client / Dealership Contact Details */}
                        {(vehicle.clientName ||
                            vehicle.clientPhone ||
                            vehicle.clientEmail ||
                            vehicle.purchaseDate) && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
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
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Client / Dealership Information
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Recorded contacts registered in
                                            Google Sheets
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <SpecBox
                                        label="Client Name"
                                        value={vehicle.clientName}
                                    />
                                    <SpecBox
                                        label="Client Phone"
                                        value={vehicle.clientPhone}
                                    />
                                    <SpecBox
                                        label="Client Email"
                                        value={vehicle.clientEmail}
                                    />
                                    <SpecBox
                                        label="Purchase Date"
                                        value={vehicle.purchaseDate}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Vehicle ID:{" "}
                            <strong className="text-slate-800 font-mono">
                                {vehicle.id}
                            </strong>
                        </span>
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onEdit(vehicle);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-purple text-white shadow-sm hover:bg-dark-purple/90 transition"
                                >
                                    Open Edit Panel
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SpecBox({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {
    const raw =
        value !== undefined && value !== null ? String(value).trim() : "";
    const isMissing = !raw || (label === "Year" && raw === "0");

    return (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {label}
            </span>
            <span
                className={`text-xs font-bold mt-1 truncate ${
                    isMissing ? "text-slate-400 font-normal" : "text-slate-800"
                }`}
                title={raw || "-"}
            >
                {raw || "-"}
            </span>
        </div>
    );
}
