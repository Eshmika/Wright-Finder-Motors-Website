import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    DetailedVehicle,
    fetchAllReservations,
    fetchAllVehicles,
    formatDriveImageUrl,
    ReservationRecord,
} from "@/Services/vehicleService";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface ShowProps {
    confirmationNumber: string;
}

export default function Show({ confirmationNumber }: ShowProps) {
    const [reservation, setReservation] = useState<ReservationRecord | null>(
        null,
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Extension state
    const [extendDays, setExtendDays] = useState<number>(2);
    const [extendChargeType, setExtendChargeType] = useState<
        "free" | "daily" | "custom"
    >("free");
    const [customExtendAmount, setCustomExtendAmount] = useState<number>(150);
    const [isExtending, setIsExtending] = useState<boolean>(false);

    // Status update state
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

    // Alert modal
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
                setReservation({
                    ...found,
                    vehicle: matchedCar,
                });
            }
        } catch (err: any) {
            console.error("Failed to load reservation:", err);
            setError(err?.message || "Failed to load reservation data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [confirmationNumber]);

    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0";
        return `$${val.toLocaleString()}`;
    };

    const getRentalDays = (pickup: string, ret: string): number => {
        try {
            if (!pickup || !ret) return 1;
            const start = new Date(pickup);
            const end = new Date(ret);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 1;
        } catch {
            return 1;
        }
    };

    const cleanPaymentOption = (opt?: string): string => {
        if (!opt) return "Zelle";
        const o = opt.toLowerCase();
        if (o.includes("zelle")) return "Zelle";
        if (o.includes("cash app") || o.includes("cashapp")) return "Cash App";
        if (o.includes("in person") || o.includes("cash")) return "In Person";
        return opt.replace(/\s*\(.*?\)\s*/g, "").trim();
    };

    const formatReservationTimestamp = (rawTs?: string): string => {
        if (!rawTs) return "N/A";
        try {
            const cleaned = rawTs
                .replace(/\s+(EST|EDT|PST|PDT|CST|CDT|UTC|GMT)$/i, "")
                .trim();
            const dateObj = new Date(cleaned);
            if (!isNaN(dateObj.getTime())) {
                const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                const m = months[dateObj.getMonth()];
                const d = dateObj.getDate();
                const y = dateObj.getFullYear();
                let hours = dateObj.getHours();
                const minutes = dateObj
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                const ampm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12;
                hours = hours ? hours : 12;
                return `${m} ${d}, ${y} at ${hours}:${minutes} ${ampm}`;
            }
        } catch {}
        return rawTs;
    };

    const formatDisplayDate = (dStr?: string): string => {
        if (!dStr) return "N/A";
        try {
            const parts = dStr.split("-");
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const d = new Date(year, month, day);
                const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            }
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
                const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            }
        } catch {}
        return dStr;
    };

    const calculateExtendedReturnDate = (
        currentReturnDate: string,
        daysToAdd: number,
    ): string => {
        if (!currentReturnDate) return "";
        try {
            const parts = currentReturnDate.split("-");
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const d = new Date(year, month, day);
                d.setDate(d.getDate() + daysToAdd);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }
            const d = new Date(currentReturnDate);
            d.setDate(d.getDate() + daysToAdd);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        } catch {
            return currentReturnDate;
        }
    };

    // Quick Status Update: Approved / Declined
    const handleQuickStatusChange = async (
        newStatus: "Approved" | "Declined" | "Pending",
    ) => {
        if (!reservation) return;
        setIsUpdatingStatus(true);
        const confNum = reservation.confirmationNumber;
        const updated = { ...reservation, reservationStatus: newStatus };
        setReservation(updated);

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
                        reservationStatus: newStatus,
                    }),
                });
            } catch (err) {
                console.error("Status webhook error:", err);
            }
        }

        setIsUpdatingStatus(false);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Reservation Status Updated!",
            message: `Reservation #${confNum} is now marked as "${newStatus}".`,
        });
    };

    // Extend Rental Save
    const handleApplyExtension = async () => {
        if (!reservation) return;
        setIsExtending(true);

        const currentReturnDate = reservation.returnDate;
        const newReturnDate = calculateExtendedReturnDate(
            currentReturnDate,
            extendDays,
        );

        const car = reservation.vehicle;
        const dailyRentRate =
            car && car.rentPrice !== undefined && car.rentPrice > 0
                ? car.rentPrice
                : car
                  ? car.originalPrice || car.price
                  : reservation.rentalRate || 0;

        let extraCharge = 0;
        if (extendChargeType === "daily") {
            extraCharge = dailyRentRate * extendDays;
        } else if (extendChargeType === "custom") {
            extraCharge = customExtendAmount || 0;
        }

        const prevTotal = reservation.estimatedTotal || 0;
        const newEstimatedTotal = prevTotal + extraCharge;

        const updated: ReservationRecord = {
            ...reservation,
            returnDate: newReturnDate,
            estimatedTotal: newEstimatedTotal,
            notes: reservation.notes
                ? `${reservation.notes}\n[Extended +${extendDays} day(s) until ${newReturnDate}. Additional: $${extraCharge}]`
                : `[Extended +${extendDays} day(s) until ${newReturnDate}. Additional: $${extraCharge}]`,
        };

        const confNum = reservation.confirmationNumber;
        setReservation(updated);

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
                        returnDate: newReturnDate,
                        estimatedTotal: newEstimatedTotal,
                        notes: updated.notes,
                    }),
                });
            } catch (err) {
                console.error("Extend rental webhook error:", err);
            }
        }

        setIsExtending(false);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Rental Extended!",
            message: `Reservation #${confNum} extended by ${extendDays} days until ${formatDisplayDate(newReturnDate)} (+$${extraCharge}).`,
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
                        Loading reservation details from Google Sheets...
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
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
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
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                        {error || "Reservation not found"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                        Could not find a reservation matching confirmation
                        number "{confirmationNumber}".
                    </p>
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

    const days = getRentalDays(reservation.pickupDate, reservation.returnDate);
    const car = reservation.vehicle;
    const dailyRentRate =
        car && car.rentPrice !== undefined && car.rentPrice > 0
            ? car.rentPrice
            : car
              ? car.originalPrice || car.price
              : reservation.rentalRate || 0;
    const beforeCouponCost = dailyRentRate * days;
    const hasCoupon = Boolean(
        reservation.couponCode && reservation.couponCode.trim(),
    );
    const totalCost = reservation.estimatedTotal || beforeCouponCost;
    const savingsCost = Math.max(0, beforeCouponCost - totalCost);
    const savingsPercent =
        beforeCouponCost > 0
            ? Math.round((savingsCost / beforeCouponCost) * 100)
            : 0;

    const resStatus = reservation.reservationStatus || "Pending";
    const rLower = resStatus.toLowerCase();
    const isApproved = rLower.includes("approv");
    const isDeclined = rLower.includes("decline");

    // Extend calculations
    const extendedReturnDateStr = calculateExtendedReturnDate(
        reservation.returnDate,
        extendDays,
    );
    let extensionAdditionalCharge = 0;
    if (extendChargeType === "daily") {
        extensionAdditionalCharge = dailyRentRate * extendDays;
    } else if (extendChargeType === "custom") {
        extensionAdditionalCharge = customExtendAmount || 0;
    }
    const newTotalWithExtension = totalCost + extensionAdditionalCharge;

    const carImageUrl =
        car?.mainImageUrl || formatDriveImageUrl(car?.images?.[0] || "");
    const carTitleStr =
        [car?.year, car?.make, car?.model].filter(Boolean).join(" ") ||
        reservation.carTitle ||
        "Vehicle Details";
    const bodyStyleFuelStr = `${car?.bodyStyle || "Sedan"} • ${car?.fuelType || "Gasoline"}`;
    const stockIdStr = reservation.carId || car?.id || "N/A";

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("admin.reservations.index")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shadow-sm"
                            title="Back to Reservations"
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
                                    Reservation Details #
                                    {reservation.confirmationNumber}
                                </h2>
                                <span
                                    className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                                        isApproved
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                            : isDeclined
                                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                                              : "bg-amber-100 text-amber-900 border border-amber-200"
                                    }`}
                                >
                                    {resStatus}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Requested on:{" "}
                                {formatReservationTimestamp(
                                    reservation.timestamp,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.reservations.edit", {
                                confirmationNumber:
                                    reservation.confirmationNumber,
                            })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            <svg
                                className="w-4 h-4 text-purple"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            <span>Edit Reservation</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-black transition shadow-sm"
                        >
                            <span>Print Voucher</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head
                title={`Reservation #${reservation.confirmationNumber} - Details`}
            />

            <div className="space-y-6 pb-12">
                {/* Main Card with Dealership Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                    {/* Purple Top Banner */}

                    <div className="p-6 space-y-6">
                        {/* Reservation Status & Confirmation Subheader */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Reservation ID
                                </div>
                                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                                    {reservation.confirmationNumber}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Requested on:{" "}
                                    <strong>
                                        {formatReservationTimestamp(
                                            reservation.timestamp,
                                        )}
                                    </strong>
                                </div>
                            </div>
                            <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">
                                    Reservation Status
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                        isApproved
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                            : isDeclined
                                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                                              : "bg-amber-100 text-amber-900 border border-amber-200"
                                    }`}
                                >
                                    {resStatus}
                                </span>
                            </div>
                        </div>

                        {/* Vehicle Information Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                            {/* Left side: Vehicle car image */}
                            <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center shadow-sm">
                                {carImageUrl ? (
                                    <img
                                        src={carImageUrl}
                                        alt={carTitleStr}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span className="text-4xl text-slate-300">
                                        🚗
                                    </span>
                                )}
                            </div>

                            {/* Right side: Vehicle specs */}
                            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                                <h4 className="text-lg font-black text-slate-900 leading-snug">
                                    {carTitleStr}
                                </h4>
                                <div className="text-xs font-semibold text-slate-600">
                                    {bodyStyleFuelStr}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Stock ID:{" "}
                                    <span className="font-mono font-bold text-slate-800">
                                        {stockIdStr}
                                    </span>
                                </div>
                                {car && (
                                    <div className="pt-1">
                                        <Link
                                            href={`${route("admin.cars.show", { id: car.id })}?from=rent`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple hover:text-dark-purple hover:underline"
                                        >
                                            <span>
                                                View Vehicle Inventory Page
                                            </span>
                                            <span>&rarr;</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Client Information Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-semibold text-[11px] mb-0.5">
                                        Name
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {reservation.firstName}{" "}
                                        {reservation.lastName}
                                    </span>
                                </div>
                                <div className="truncate">
                                    <span className="text-slate-400 block font-semibold text-[11px] mb-0.5">
                                        Email
                                    </span>
                                    <a
                                        href={`mailto:${reservation.email}`}
                                        className="font-bold text-purple hover:underline truncate block text-sm"
                                        title={reservation.email}
                                    >
                                        {reservation.email || "N/A"}
                                    </a>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold text-[11px] mb-0.5">
                                        Phone
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {reservation.phone || "N/A"}
                                    </span>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                        <span className="text-emerald-600">
                                            📅
                                        </span>
                                        <span>Pickup:</span>
                                        <span>
                                            {formatDisplayDate(
                                                reservation.pickupDate,
                                            )}{" "}
                                            at{" "}
                                            {reservation.pickupTime ||
                                                "10:00 AM"}{" "}
                                            (EST)
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 pl-6 flex items-center gap-1">
                                        <span>📍</span>
                                        <span>
                                            {reservation.pickupLocation ||
                                                "Dayton, Ohio: Wright finder motors (primary hub)"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                        <span className="text-rose-600">
                                            📅
                                        </span>
                                        <span>Return:</span>
                                        <span>
                                            {formatDisplayDate(
                                                reservation.returnDate,
                                            )}{" "}
                                            at{" "}
                                            {reservation.returnTime ||
                                                "10:00 AM"}{" "}
                                            (EST)
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 pl-6 flex items-center gap-1">
                                        <span>📍</span>
                                        <span>
                                            {reservation.returnLocation ||
                                                reservation.pickupLocation ||
                                                "Dayton, Ohio: Wright finder motors (primary hub)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-semibold">
                                    Total Duration:
                                </span>
                                <span className="font-black text-slate-900 text-sm">
                                    {days} {days === 1 ? "Day" : "Days"}
                                </span>
                            </div>
                        </div>

                        {/* Pricing & Savings Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
                                <svg
                                    className="w-4 h-4 text-emerald-600 shrink-0"
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
                                <span>Pricing &amp; Savings</span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 font-medium">
                                        Before Coupon ({days} days x{" "}
                                        {formatCurrency(dailyRentRate)}/day):
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {formatCurrency(beforeCouponCost)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 font-medium">
                                        Coupon:{" "}
                                        {hasCoupon ? (
                                            <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {reservation.couponCode}
                                            </strong>
                                        ) : (
                                            <span className="text-slate-400">
                                                -
                                            </span>
                                        )}
                                    </span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        {hasCoupon
                                            ? `-${formatCurrency(savingsCost)}`
                                            : "$0"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-purple/5 border border-purple/15">
                                    <span className="font-black text-slate-900 text-sm">
                                        After Coupon (Total):
                                    </span>
                                    <span className="text-lg font-black text-slate-900">
                                        {formatCurrency(totalCost)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                    <span className="font-bold text-emerald-900">
                                        Total Savings:
                                    </span>
                                    <span className="font-black text-emerald-700 text-base">
                                        {formatCurrency(savingsCost)}{" "}
                                        {savingsPercent > 0
                                            ? `(${savingsPercent}%)`
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information Section */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
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
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                                <span>Payment Information</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-semibold text-[11px] mb-1">
                                        Payment Status
                                    </span>
                                    <span
                                        className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${
                                            (reservation.paymentStatus || "")
                                                .toLowerCase()
                                                .includes("paid") &&
                                            !(reservation.paymentStatus || "")
                                                .toLowerCase()
                                                .includes("unpaid")
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                : (
                                                        reservation.paymentStatus ||
                                                        ""
                                                    )
                                                        .toLowerCase()
                                                        .includes("unpaid")
                                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                  : "bg-amber-100 text-amber-900 border border-amber-200"
                                        }`}
                                    >
                                        {reservation.paymentStatus || "Pending"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold text-[11px] mb-1">
                                        Payment Method
                                    </span>
                                    <span className="font-bold text-slate-900 text-base">
                                        {cleanPaymentOption(
                                            reservation.paymentOption,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Extend Rental Section */}
                        <div className="p-6 rounded-3xl bg-[#faf7ff] border border-purple/20 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
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
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-purple">
                                        Extend Rental
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Add more rental days or adjust the
                                        extension charge.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                {/* Left side: Add Days */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Add Days:
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExtendDays((d) =>
                                                    Math.max(1, d - 1),
                                                )
                                            }
                                            className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-lg flex items-center justify-center text-slate-700 transition shadow-sm"
                                        >
                                            -
                                        </button>
                                        <div className="w-16 h-10 rounded-xl bg-white border border-slate-300 font-black text-base flex items-center justify-center text-slate-900 shadow-inner">
                                            {extendDays}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExtendDays((d) => d + 1)
                                            }
                                            className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-lg flex items-center justify-center text-slate-700 transition shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Right side: Extension Charge Option */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Extension Charge Option:
                                    </label>
                                    <div className="space-y-2 text-xs">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="extendCharge"
                                                checked={
                                                    extendChargeType === "free"
                                                }
                                                onChange={() =>
                                                    setExtendChargeType("free")
                                                }
                                                className="text-purple focus:ring-purple/40"
                                            />
                                            <span className="text-slate-700 font-semibold">
                                                No Charge (Complimentary)
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="extendCharge"
                                                checked={
                                                    extendChargeType === "daily"
                                                }
                                                onChange={() =>
                                                    setExtendChargeType("daily")
                                                }
                                                className="text-purple focus:ring-purple/40"
                                            />
                                            <span className="text-slate-700 font-semibold">
                                                Use Daily Rate (
                                                {formatCurrency(dailyRentRate)}
                                                /day) -{" "}
                                                <strong className="text-slate-900">
                                                    {formatCurrency(
                                                        dailyRentRate *
                                                            extendDays,
                                                    )}
                                                </strong>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="extendCharge"
                                                checked={
                                                    extendChargeType ===
                                                    "custom"
                                                }
                                                onChange={() =>
                                                    setExtendChargeType(
                                                        "custom",
                                                    )
                                                }
                                                className="text-purple focus:ring-purple/40"
                                            />
                                            <span className="text-slate-700 font-semibold">
                                                Custom Amount
                                            </span>
                                            <div className="flex items-center gap-1 ml-auto">
                                                <span className="font-bold text-slate-500">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={customExtendAmount}
                                                    onChange={(e) => {
                                                        setExtendChargeType(
                                                            "custom",
                                                        );
                                                        setCustomExtendAmount(
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        );
                                                    }}
                                                    className="w-24 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple/40 text-purple"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Extension Summary Card */}
                            <div className="p-4 rounded-2xl bg-purple/10 border border-purple/20 text-xs text-purple space-y-1.5">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <span>ℹ️</span>
                                    <span>
                                        New Return Date &amp; Time:{" "}
                                        {formatDisplayDate(
                                            extendedReturnDateStr,
                                        )}{" "}
                                        at{" "}
                                        {reservation.returnTime || "10:00 AM"}{" "}
                                        (EST)
                                    </span>
                                </div>
                                <div className="text-xs font-semibold text-slate-700 pl-6">
                                    Additional Charge:{" "}
                                    <strong className="text-purple font-black">
                                        {formatCurrency(
                                            extensionAdditionalCharge,
                                        )}
                                    </strong>{" "}
                                    | New Total:{" "}
                                    <strong className="text-slate-900 font-black">
                                        {formatCurrency(newTotalWithExtension)}
                                    </strong>
                                </div>
                            </div>

                            {/* Extend & Cancel Stepper Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExtendDays(2);
                                        setExtendChargeType("free");
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Reset Extension
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyExtension}
                                    disabled={isExtending}
                                    className="px-5 py-2 rounded-xl bg-purple hover:bg-dark-purple text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    <span>
                                        {isExtending
                                            ? "Extending..."
                                            : "Confirm Extension"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Special Notes if available */}
                        {reservation.notes && (
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                                <h4 className="font-bold text-amber-900 text-xs mb-1">
                                    Special Notes / Customer Requests
                                </h4>
                                <p className="text-slate-700 whitespace-pre-wrap">
                                    {reservation.notes}
                                </p>
                            </div>
                        )}

                        {/* Page Footer Actions */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickStatusChange("Approved")
                                    }
                                    disabled={isUpdatingStatus}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickStatusChange("Declined")
                                    }
                                    disabled={isUpdatingStatus}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
                                >
                                    ✕ Decline
                                </button>
                                <Link
                                    href={route("admin.reservations.edit", {
                                        confirmationNumber:
                                            reservation.confirmationNumber,
                                    })}
                                    className="px-4 py-2 rounded-xl border border-purple/30 bg-purple/10 text-purple hover:bg-purple hover:text-white font-bold text-xs transition shadow-sm"
                                >
                                    Edit Reservation
                                </Link>
                            </div>

                            <Link
                                href={route("admin.reservations.index")}
                                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                            >
                                Back to All Reservations
                            </Link>
                        </div>
                    </div>
                </div>
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
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setAlertModal({
                                        isOpen: false,
                                        title: "",
                                        message: "",
                                        type: "success",
                                    })
                                }
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
