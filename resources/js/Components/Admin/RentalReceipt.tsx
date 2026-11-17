import React from "react";
import { ReservationRecord } from "@/Services/vehicleService";

interface RentalReceiptProps {
    reservation: ReservationRecord;
}

export default function RentalReceipt({ reservation }: RentalReceiptProps) {
    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0.00";
        return `$${val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDisplayDate = (dStr?: string): string => {
        if (!dStr) return "N/A";
        try {
            const parts = dStr.split("T")[0].split("-");
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
        } catch {}
        return dStr;
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
        if (!opt) return "Full Payment (100%)";
        const trimmed = opt.trim();
        if (
            trimmed.toLowerCase().includes("full") ||
            trimmed.toLowerCase().includes("100")
        ) {
            return "Full Payment (100%)";
        }
        if (
            trimmed.toLowerCase().includes("half") ||
            trimmed.toLowerCase().includes("partial") ||
            trimmed.toLowerCase().includes("50")
        ) {
            return "Partial Deposit (50%)";
        }
        return trimmed;
    };

    const days = getRentalDays(reservation.pickupDate, reservation.returnDate);
    const car = reservation.vehicle;
    const dailyRentRate =
        car && car.rentPrice !== undefined && car.rentPrice > 0
            ? car.rentPrice
            : car
              ? car.originalPrice || car.price
              : reservation.rentalRate || 0;

    const beforeCouponCost = dailyRentRate * days;
    const totalCost = reservation.estimatedTotal || beforeCouponCost;
    const savingsCost = Math.max(0, beforeCouponCost - totalCost);
    const savingsPercent =
        beforeCouponCost > 0
            ? Math.round((savingsCost / beforeCouponCost) * 100)
            : 0;

    const carTitleStr = car
        ? [car.year, car.make, car.model, car.trim].filter(Boolean).join(" ")
        : reservation.carTitle || "Rental Vehicle";

    const receiptDate = reservation.timestamp
        ? formatDisplayDate(reservation.timestamp)
        : formatDisplayDate(new Date().toISOString().split("T")[0]);

    return (
        <div className="hidden print:block print:w-full print:bg-white text-slate-800 font-sans print:p-0 print:m-0">
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 8mm 12mm;
                }
                @media print {
                    html, body {
                        width: 100% !important;
                        height: auto !important;
                        min-height: 100% !important;
                        overflow: visible !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Ensure all top structural elements do not constrain or hide */
                    header, aside, nav, .no-print, [role="navigation"] {
                        display: none !important;
                    }
                    div, main {
                        overflow: visible !important;
                    }
                    .h-screen, .w-screen, .h-full {
                        height: auto !important;
                        width: auto !important;
                    }
                    .rental-receipt-print-wrapper {
                        display: block !important;
                        width: 100% !important;
                        margin: 0 auto !important;
                    }
                }
            `}</style>

            <div className="rental-receipt-print-wrapper max-w-[760px] mx-auto bg-white border border-slate-300 rounded-3xl p-7 relative overflow-hidden shadow-none">
                {/* Header Top Accent Banner */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-purple via-dark-purple to-purple" />

                {/* Header: Brand & Document Title */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-6 pt-2">
                    <div className="flex items-center gap-4">
                        <img
                            src="/storage/images/logo.webp"
                            alt="Wright Finder Motors"
                            className="h-16 w-auto object-contain"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display =
                                    "none";
                            }}
                        />
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                                Wright Finder Motors
                            </h1>
                            <p className="text-xs font-semibold text-purple tracking-wide uppercase">
                                Premium Car Sales &amp; Rental Services
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Dayton, OH, USA • +1 (937) 475-4737 •
                                contact@wrightfindermotors.com
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-wider mb-1.5">
                            Official Receipt
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            Receipt / Conf #:
                        </div>
                        <div className="text-base font-black text-slate-900 font-mono tracking-tight">
                            #{reservation.confirmationNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                            Date:{" "}
                            <span className="font-semibold text-slate-700">
                                {receiptDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer & Booking Meta Summary Grid */}
                <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-200">
                    {/* Billed To / Client Information */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple mb-2 flex items-center gap-1.5">
                            <span>👤</span>
                            <span>Client Information</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                            {reservation.firstName} {reservation.lastName}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div>
                                <span className="text-slate-400">Email:</span>{" "}
                                <span className="font-medium text-slate-800">
                                    {reservation.email || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400">Phone:</span>{" "}
                                <span className="font-medium text-slate-800">
                                    {reservation.phone || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 pt-0.5">
                                <div>
                                    <span className="text-slate-400">Age:</span>{" "}
                                    <span className="font-semibold text-slate-800">
                                        {reservation.age || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">
                                        Residency:
                                    </span>{" "}
                                    <span className="font-semibold text-slate-800">
                                        {reservation.residency || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rental Schedule & Trip Information */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple mb-2 flex items-center gap-1.5">
                            <span>📅</span>
                            <span>Rental Itinerary</span>
                        </div>
                        <div className="text-xs space-y-2">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    Pickup
                                </div>
                                <div className="font-bold text-slate-900 text-xs">
                                    {formatDisplayDate(reservation.pickupDate)}{" "}
                                    at {reservation.pickupTime || "10:00 AM"}{" "}
                                    (EST)
                                </div>
                                <div className="text-[11px] text-slate-600 truncate">
                                    📍{" "}
                                    {reservation.pickupLocation || "Dayton, OH"}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    Return
                                </div>
                                <div className="font-bold text-slate-900 text-xs">
                                    {formatDisplayDate(reservation.returnDate)}{" "}
                                    at {reservation.returnTime || "10:00 AM"}{" "}
                                    (EST)
                                </div>
                                <div className="text-[11px] text-slate-600 truncate">
                                    📍{" "}
                                    {reservation.returnLocation || "Dayton, OH"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reserved Vehicle Details Box */}
                <div className="my-5 p-4 rounded-2xl bg-purple/5 border border-purple/20 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple mb-0.5">
                            Reserved Vehicle
                        </div>
                        <div className="text-base font-black text-slate-900">
                            {carTitleStr}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-3">
                            <span>
                                Stock ID:{" "}
                                <strong className="text-slate-800">
                                    {reservation.carId || car?.id || "N/A"}
                                </strong>
                            </span>
                            {car?.vin && (
                                <span>
                                    VIN:{" "}
                                    <strong className="text-slate-800 font-mono text-[11px]">
                                        {car.vin}
                                    </strong>
                                </span>
                            )}
                            {car?.mileage && (
                                <span>
                                    Mileage:{" "}
                                    <strong className="text-slate-800">
                                        {car.mileage}
                                    </strong>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                            Rental Duration
                        </div>
                        <div className="text-lg font-black text-purple">
                            {days} {days === 1 ? "Day" : "Days"}
                        </div>
                    </div>
                </div>

                {/* Charges & Breakdown Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden my-5">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                                <th className="py-2.5 px-4">Description</th>
                                <th className="py-2.5 px-4 text-center">
                                    Daily Rate
                                </th>
                                <th className="py-2.5 px-4 text-center">
                                    Days
                                </th>
                                <th className="py-2.5 px-4 text-right">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                            <tr>
                                <td className="py-3 px-4 font-semibold">
                                    Vehicle Daily Rental — {carTitleStr}
                                </td>
                                <td className="py-3 px-4 text-center font-medium">
                                    {formatCurrency(dailyRentRate)}
                                </td>
                                <td className="py-3 px-4 text-center font-medium">
                                    {days}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                    {formatCurrency(beforeCouponCost)}
                                </td>
                            </tr>

                            {savingsCost > 0 && (
                                <tr className="bg-emerald-50/50">
                                    <td
                                        colSpan={3}
                                        className="py-2.5 px-4 font-semibold text-emerald-800"
                                    >
                                        Discount / Promotional Voucher
                                        {reservation.couponCode
                                            ? ` (${reservation.couponCode})`
                                            : ""}
                                        {savingsPercent > 0
                                            ? ` — ${savingsPercent}% off`
                                            : ""}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                                        -{formatCurrency(savingsCost)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals Summary */}
                    <div className="bg-slate-50/90 border-t border-slate-200 p-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-slate-800">
                                {formatCurrency(beforeCouponCost)}
                            </span>
                        </div>
                        {savingsCost > 0 && (
                            <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                                <span>Discount Savings:</span>
                                <span>-{formatCurrency(savingsCost)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                            <span className="uppercase tracking-tight">
                                Total Rental Charge:
                            </span>
                            <span className="text-base text-purple">
                                {formatCurrency(totalCost)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Status & Details */}
                <div className="grid grid-cols-2 gap-4 py-4 px-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Payment Plan Selected
                        </span>
                        <span className="font-bold text-slate-900">
                            {cleanPaymentOption(reservation.paymentOption)}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Payment Status
                        </span>
                        <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide">
                            ✓ {reservation.paymentStatus || "Paid"}
                        </span>
                    </div>
                </div>

                {/* Special Notes / Instructions if any */}
                {reservation.notes && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-slate-700">
                        <span className="font-bold text-amber-900 block text-[11px] uppercase mb-0.5">
                            Special Instructions / Notes:
                        </span>
                        <p className="whitespace-pre-wrap">
                            {reservation.notes}
                        </p>
                    </div>
                )}

                {/* Terms & Footer Note */}
                <div className="mt-6 pt-5 border-t border-slate-200 text-[10px] text-slate-500 space-y-1 text-center">
                    <p className="font-semibold text-slate-700">
                        Thank you for choosing Wright Finder Motors for your
                        rental journey!
                    </p>
                    <p>
                        Please keep this receipt for your records. For
                        questions, extensions, or emergency roadside assistance,
                        contact us at +1 (937) 475-4737.
                    </p>
                    <p className="text-slate-400 text-[9px] pt-1">
                        Wright Finder Motors LLC • Official Rental Agreement
                        &amp; Payment Receipt • Dayton, OH
                    </p>
                </div>
            </div>
        </div>
    );
}
