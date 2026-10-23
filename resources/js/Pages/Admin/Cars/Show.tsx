import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DetailedVehicle, fetchAllVehicles } from "@/Services/vehicleService";
import { parseMileage } from "@/Utils/mileage";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface ShowProps {
    id: string;
}

export default function Show({ id }: ShowProps) {
    const [vehicle, setVehicle] = useState<DetailedVehicle | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    const loadVehicle = async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await fetchAllVehicles();
            const decodedId = decodeURIComponent(id || "")
                .trim()
                .toLowerCase();

            const found = all.find(
                (v) =>
                    v.id.trim().toLowerCase() === decodedId ||
                    encodeURIComponent(v.id.trim().toLowerCase()) === decodedId,
            );

            if (!found) {
                setError(
                    `Vehicle with ID "${id}" was not found in the inventory sheet.`,
                );
            } else {
                setVehicle(found);
            }
        } catch (err: any) {
            console.error("Failed to load vehicle details:", err);
            setError(
                err?.message ||
                    "Failed to load vehicle details from Google Sheets.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicle();
    }, [id]);

    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0";
        return `$${val.toLocaleString()}`;
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
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    {vehicle
                                        ? `${vehicle.make} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ""}`
                                        : "Vehicle Details"}
                                </h2>
                                {vehicle?.id && (
                                    <span className="text-[10px] font-mono font-bold uppercase bg-vivid-red text-white px-2 py-0.5 rounded-full">
                                        {vehicle.id}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Dedicated admin view panel for vehicle record &
                                Google Sheets data.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.cars.index")}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            <svg
                                className="w-4 h-4 text-slate-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                />
                            </svg>
                            <span>View All Cars</span>
                        </Link>
                        {vehicle && (
                            <Link
                                href={route("admin.cars.edit", {
                                    id: vehicle.id,
                                })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-purple text-white hover:bg-purple transition shadow-sm"
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
                                <span>Edit Car</span>
                            </Link>
                        )}
                        {vehicle && (
                            <Link
                                href={`/vehicles/${encodeURIComponent(vehicle.id)}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition shadow-sm"
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
                        )}
                    </div>
                </div>
            }
        >
            <Head
                title={
                    vehicle
                        ? `${vehicle.make} ${vehicle.model} - Admin Details`
                        : "Car Details - Wright Finder Motors"
                }
            />

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                    <svg
                        className="w-10 h-10 text-purple animate-spin mb-3"
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
                    <p className="text-sm font-semibold text-slate-700">
                        Loading vehicle details from inventory...
                    </p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-3">
                    <p className="text-sm font-bold text-rose-800">{error}</p>
                    <Link
                        href={route("admin.cars.index")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vivid-red text-white text-xs font-semibold shadow hover:bg-red-600 transition"
                    >
                        Return to All Cars Table
                    </Link>
                </div>
            )}

            {/* Vehicle Details Content Area */}
            {!loading && vehicle && (
                <div className="space-y-6">
                    {/* TOP HIGHLIGHT BAR: Pricing, Status, Discount, Specs */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="space-y-1.5">
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
                                <span className="text-3xl sm:text-4xl font-black text-slate-900">
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
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                        Save {formatCurrency(vehicle.discount)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Mileage
                                </span>
                                {(() => {
                                    const m = parseMileage(vehicle.mileage);
                                    return (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm leading-tight">
                                                {m.hasValue
                                                    ? m.milesText
                                                    : "N/A"}
                                            </span>
                                            {m.hasValue && m.kmText && (
                                                <span className="text-[10px] font-medium text-slate-500 leading-tight mt-0.5">
                                                    {m.kmText}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Transmission
                                </span>
                                <span className="font-bold text-slate-800 text-sm">
                                    {vehicle.transmission || "N/A"}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Fuel Type
                                </span>
                                <span className="font-bold text-slate-800 text-sm">
                                    {vehicle.fuelType || "N/A"}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    VIN
                                </span>
                                <span className="font-bold text-slate-800 text-xs font-mono">
                                    {vehicle.vin || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Image Gallery Viewer */}
                    {vehicle.images && vehicle.images.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="relative w-full h-[320px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                                <img
                                    src={
                                        vehicle.images[activeImageIndex] ||
                                        vehicle.images[0]
                                    }
                                    alt={vehicle.title}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
                                    {activeImageIndex + 1} /{" "}
                                    {vehicle.images.length} Photos
                                </div>

                                {vehicle.images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveImageIndex((prev) =>
                                                    prev === 0
                                                        ? vehicle.images
                                                              .length - 1
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
                                                setActiveImageIndex((prev) =>
                                                    prev ===
                                                    vehicle.images.length - 1
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

                            {/* Thumbnails */}
                            {vehicle.images.length > 1 && (
                                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                                    {vehicle.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() =>
                                                setActiveImageIndex(idx)
                                            }
                                            className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
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

                    {/* SECTION: Specifications Grid (Vehicle Overview & Mechanics) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Vehicle Overview */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
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
                                        Chassis, model, registration & styling
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <AdminSpecItem
                                    label="Make"
                                    value={vehicle.make}
                                />
                                <AdminSpecItem
                                    label="Model"
                                    value={vehicle.model}
                                />
                                <AdminSpecItem
                                    label="Year"
                                    value={vehicle.year}
                                />
                                <AdminSpecItem
                                    label="Trim"
                                    value={vehicle.trim}
                                />
                                <AdminSpecItem
                                    label="VIN"
                                    value={vehicle.vin}
                                />
                                <AdminSpecItem
                                    label="Body Style"
                                    value={vehicle.bodyStyle}
                                />
                                <AdminSpecItem
                                    label="Exterior Color"
                                    value={vehicle.exteriorColor}
                                />
                                <AdminSpecItem
                                    label="Interior Color"
                                    value={vehicle.interiorColor}
                                />
                                <AdminSpecItem
                                    label="Seat Material"
                                    value={vehicle.seatMaterial}
                                />
                                <AdminSpecItem
                                    label="Title Status"
                                    value={vehicle.titleStatus}
                                />
                            </div>
                        </div>

                        {/* 2. Power & Performance */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
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
                                <AdminSpecItem
                                    label="Engine"
                                    value={vehicle.engine}
                                />
                                <AdminSpecItem
                                    label="Engine Type/Size"
                                    value={vehicle.engineTypeSize}
                                />
                                <AdminSpecItem
                                    label="Transmission"
                                    value={vehicle.transmission}
                                />
                                <AdminSpecItem
                                    label="Driveline"
                                    value={vehicle.driveline}
                                />
                                <AdminSpecItem
                                    label="Fuel Type"
                                    value={vehicle.fuelType}
                                />
                                <AdminSpecItem
                                    label="Power Options"
                                    value={vehicle.powerOptions}
                                />
                                <AdminSpecItem
                                    label="Condition"
                                    value={vehicle.condition}
                                />
                                <AdminSpecItem
                                    label="Drive Condition"
                                    value={vehicle.driveCondition}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Features & Condition */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
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
                                {vehicle.interiorFeatures.map((feat, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-dark-purple" />
                                        <span>{feat}</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">
                                No specific features listed for this vehicle.
                            </p>
                        )}
                    </div>

                    {/* SECTION: Client & Dealership Info */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
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
                                    Client / Agent Contact Information
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Record contacts registered in Google Sheets
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <AdminSpecItem
                                label="Client Name"
                                value={vehicle.clientName}
                            />
                            <AdminSpecItem
                                label="Client Phone"
                                value={vehicle.clientPhone}
                                isPhone
                            />
                            <AdminSpecItem
                                label="Client Email"
                                value={vehicle.clientEmail}
                                isEmail
                            />
                            <AdminSpecItem
                                label="Purchase Date"
                                value={vehicle.purchaseDate}
                            />
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="bg-white px-6 py-4 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Vehicle Record:{" "}
                            <strong className="text-slate-800">
                                {vehicle.id}
                            </strong>
                        </span>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route("admin.cars.index")}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                            >
                                Back to All Cars
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function AdminSpecItem({
    label,
    value,
    isPhone = false,
    isEmail = false,
}: {
    label: string;
    value?: string | number | null;
    isPhone?: boolean;
    isEmail?: boolean;
}) {
    const raw =
        value !== undefined && value !== null ? String(value).trim() : "";
    const isMissing = !raw || (label === "Year" && raw === "0");

    return (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {label}
            </span>
            {isMissing ? (
                <span className="text-xs font-semibold text-slate-400 mt-1">
                    -
                </span>
            ) : isPhone ? (
                <a
                    href={`tel:${raw}`}
                    className="text-xs font-bold text-dark-blue hover:text-vivid-red transition truncate mt-1"
                >
                    {raw}
                </a>
            ) : isEmail ? (
                <a
                    href={`mailto:${raw}`}
                    className="text-xs font-bold text-dark-blue hover:text-vivid-red transition truncate mt-1"
                >
                    {raw}
                </a>
            ) : (
                <span
                    className="text-xs font-bold text-slate-800 truncate mt-1"
                    title={raw}
                >
                    {raw}
                </span>
            )}
        </div>
    );
}
