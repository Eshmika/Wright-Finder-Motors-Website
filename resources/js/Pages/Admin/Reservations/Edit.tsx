import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    DetailedVehicle,
    fetchAllReservations,
    fetchAllVehicles,
    formatDriveImageUrl,
    ReservationRecord,
} from "@/Services/vehicleService";
import { Head, Link, router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

interface EditProps {
    confirmationNumber: string;
}

export default function Edit({ confirmationNumber }: EditProps) {
    const [reservation, setReservation] = useState<ReservationRecord | null>(
        null,
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Form fields for reservation data only
    const [form, setForm] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        pickupDate: string;
        pickupTime: string;
        pickupLocation: string;
        returnDate: string;
        returnTime: string;
        returnLocation: string;
        notes: string;
        reservationStatus: string;
        paymentStatus: string;
    }>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        pickupDate: "",
        pickupTime: "",
        pickupLocation: "",
        returnDate: "",
        returnTime: "",
        returnLocation: "",
        notes: "",
        reservationStatus: "Pending",
        paymentStatus: "Pending",
    });

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resList, vehList] = await Promise.all([
                fetchAllReservations(),
                fetchAllVehicles(),
            ]);

            const map = new Map<string, DetailedVehicle>();
            vehList.forEach((v) => {
                if (v.id) {
                    map.set(v.id.trim().toLowerCase(), v);
                }
            });

            const decodedConf = decodeURIComponent(confirmationNumber || "")
                .trim()
                .toLowerCase();

            const found = resList.find(
                (r) =>
                    r.confirmationNumber.trim().toLowerCase() === decodedConf ||
                    encodeURIComponent(
                        r.confirmationNumber.trim().toLowerCase(),
                    ) === decodedConf,
            );

            if (!found) {
                setError(
                    `Reservation with Confirmation #${confirmationNumber} was not found.`,
                );
            } else {
                const matchedCar = found.carId
                    ? map.get(found.carId.trim().toLowerCase())
                    : undefined;
                const fullRes = {
                    ...found,
                    vehicle: matchedCar,
                };
                setReservation(fullRes);
                setForm({
                    firstName: found.firstName || "",
                    lastName: found.lastName || "",
                    email: found.email || "",
                    phone: found.phone || "",
                    pickupDate: found.pickupDate || "",
                    pickupTime: found.pickupTime || "10:00 AM",
                    pickupLocation: found.pickupLocation || "",
                    returnDate: found.returnDate || "",
                    returnTime: found.returnTime || "10:00 AM",
                    returnLocation: found.returnLocation || "",
                    notes: found.notes || "",
                    reservationStatus: found.reservationStatus || "Pending",
                    paymentStatus: found.paymentStatus || "Pending",
                });
            }
        } catch (err: any) {
            console.error("Failed to load reservation for edit:", err);
            setError(err?.message || "Failed to load reservation data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [confirmationNumber]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservation) return;
        setIsSaving(true);

        const confNum = reservation.confirmationNumber;
        const webhook =
            typeof window !== "undefined"
                ? localStorage.getItem("WFM_APPS_SCRIPT_URL") || ""
                : "";

        if (webhook) {
            try {
                await fetch(webhook, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "update_reservation_status",
                        confirmationNumber: confNum,
                        ...form,
                    }),
                });
            } catch (err) {
                console.error("Save edit reservation webhook error:", err);
            }
        }

        setIsSaving(false);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Reservation Details Saved!",
            message: `Reservation #${confNum} details updated successfully.`,
        });
    };

    if (loading) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.reservations.index")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
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
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Loading Reservation...
                        </h2>
                    </div>
                }
            >
                <div className="p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-purple border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-600">
                        Loading reservation details...
                    </p>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !reservation) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.reservations.index")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
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
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Reservation Not Found
                        </h2>
                    </div>
                }
            >
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center max-w-lg mx-auto my-8">
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                        {error || "Reservation not found"}
                    </h3>
                    <Link
                        href={route("admin.reservations.index")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple text-white text-xs font-bold hover:bg-dark-purple transition shadow-sm"
                    >
                        Back to All Reservations
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    const car = reservation.vehicle;
    const carImageUrl =
        car?.mainImageUrl || formatDriveImageUrl(car?.images?.[0] || "");
    const carTitleStr =
        [car?.year, car?.make, car?.model].filter(Boolean).join(" ") ||
        reservation.carTitle ||
        "Vehicle Details";

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.reservations.show", {
                                confirmationNumber:
                                    reservation.confirmationNumber,
                            })}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
                            title="Back to Details"
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
                                    Edit Reservation #
                                    {reservation.confirmationNumber}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple/10 text-purple border border-purple/20">
                                    Admin Edit
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Modify customer contact info and rental dates.
                                Vehicle details cannot be changed here.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.reservations.show", {
                                confirmationNumber:
                                    reservation.confirmationNumber,
                            })}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            }
        >
            <Head
                title={`Edit Reservation #${reservation.confirmationNumber}`}
            />

            <div className="space-y-6 pb-12">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden text-purple"
                >
                    <div className="p-6 space-y-6 text-xs">
                        {/* Vehicle Reference Card (Read Only) */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                                {carImageUrl ? (
                                    <img
                                        src={carImageUrl}
                                        alt={carTitleStr}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl text-slate-300">
                                        🚗
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Assigned Rental Vehicle
                                </span>
                                <div className="text-sm font-black text-slate-900 truncate">
                                    {carTitleStr}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Stock ID:{" "}
                                    <span className="font-mono font-bold text-slate-700">
                                        {reservation.carId || car?.id || "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Confirmation
                                </span>
                                <span className="text-sm font-mono font-black text-purple">
                                    #{reservation.confirmationNumber}
                                </span>
                            </div>
                        </div>

                        {/* Status Settings */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
                                <span>Status Settings</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Reservation Status
                                    </label>
                                    <select
                                        value={form.reservationStatus}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                reservationStatus:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-bold text-slate-800"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">
                                            Approved
                                        </option>
                                        <option value="Declined">
                                            Declined
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Payment Status
                                    </label>
                                    <select
                                        value={form.paymentStatus}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                paymentStatus: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-bold text-slate-800"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Client Information Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
                                <svg
                                    className="w-4 h-4 text-purple shrink-0"
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
                                <span>Client Information</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                firstName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                lastName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Mobile Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rental Schedule Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
                                <svg
                                    className="w-4 h-4 text-purple shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>Rental Schedule</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Pickup Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.pickupDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pickupDate: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Pickup Time (EST)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="10:00 AM"
                                        value={form.pickupTime}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pickupTime: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                    Pickup Location
                                </label>
                                <input
                                    type="text"
                                    value={form.pickupLocation}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            pickupLocation: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Return Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.returnDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                returnDate: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                        Return Time (EST)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="10:00 AM"
                                        value={form.returnTime}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                returnTime: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                    Return Location
                                </label>
                                <input
                                    type="text"
                                    value={form.returnLocation}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            returnLocation: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                />
                            </div>
                        </div>

                        {/* Special Notes Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                            <label className="block font-bold text-slate-700 text-[11px] uppercase">
                                Special Notes / Customer Requests
                            </label>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs"
                                placeholder="Enter instructions or customer requests..."
                            />
                        </div>

                        {/* Submit actions */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <Link
                                href={route("admin.reservations.show", {
                                    confirmationNumber:
                                        reservation.confirmationNumber,
                                })}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl bg-purple hover:bg-dark-purple text-white font-bold text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <span>
                                    {isSaving
                                        ? "Saving Changes..."
                                        : "Save Changes"}
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Alert Feedback Modal */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-3 shadow-inner">
                            <svg
                                className="w-7 h-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">
                            {alertModal.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {alertModal.message}
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-2">
                            <Link
                                href={route("admin.reservations.show", {
                                    confirmationNumber:
                                        reservation.confirmationNumber,
                                })}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                            >
                                View Reservation
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
