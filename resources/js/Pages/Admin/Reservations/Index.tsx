import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    DetailedVehicle,
    fetchAllReservations,
    fetchAllVehicles,
    formatDriveImageUrl,
    ReservationRecord,
} from "@/Services/vehicleService";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

type SortOption =
    | "newest"
    | "oldest"
    | "pickup-soonest"
    | "total-high"
    | "total-low"
    | "name-asc";

export default function Index() {
    const [reservations, setReservations] = useState<ReservationRecord[]>([]);
    const [vehiclesMap, setVehiclesMap] = useState<
        Map<string, DetailedVehicle>
    >(new Map());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Search Controls
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // View Modal State
    const [selectedRes, setSelectedRes] = useState<ReservationRecord | null>(
        null,
    );

    // Edit Modal State
    const [editingRes, setEditingRes] = useState<ReservationRecord | null>(
        null,
    );
    const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        pickupDate: string;
        pickupTime: string;
        returnDate: string;
        returnTime: string;
        pickupLocation: string;
        returnLocation: string;
        notes: string;
    }>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        pickupDate: "",
        pickupTime: "",
        returnDate: "",
        returnTime: "",
        pickupLocation: "",
        returnLocation: "",
        notes: "",
    });

    // Extend Rental State inside Reservation Details
    const [extendDays, setExtendDays] = useState<number>(2);
    const [extendChargeType, setExtendChargeType] = useState<
        "free" | "daily" | "custom"
    >("free");
    const [customExtendAmount, setCustomExtendAmount] = useState<number>(150);
    const [isExtending, setIsExtending] = useState<boolean>(false);

    // Payment Approval Modal State
    const [paymentModalRes, setPaymentModalRes] =
        useState<ReservationRecord | null>(null);
    const [approvalPaymentOption, setApprovalPaymentOption] =
        useState<string>("Zelle");
    const [approvalCoverage, setApprovalCoverage] = useState<
        "full" | "partial"
    >("full");
    const [approvalPaymentStatus, setApprovalPaymentStatus] = useState<
        "Paid" | "Pending" | "Unpaid"
    >("Paid");
    const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);

    // Reservation Status Change Modal / Confirmation State
    const [resStatusModalRes, setResStatusModalRes] =
        useState<ReservationRecord | null>(null);
    const [targetResStatus, setTargetResStatus] = useState<
        "Pending" | "Approved" | "Declined"
    >("Approved");
    const [isUpdatingResStatus, setIsUpdatingResStatus] =
        useState<boolean>(false);

    // Webhook URL from localStorage or default
    const [scriptWebhookUrl, setScriptWebhookUrl] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";
        }
        return "";
    });

    // Alert feedback modal
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

    // Load data from Google Sheet "Reservation" & "Vehicle details" tabs
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resList, vehList] = await Promise.all([
                fetchAllReservations(),
                fetchAllVehicles(),
            ]);

            // Map vehicles by id (normalized lower case for matching)
            const map = new Map<string, DetailedVehicle>();
            vehList.forEach((v) => {
                if (v.id) {
                    map.set(v.id.trim().toLowerCase(), v);
                }
            });

            // Connect vehicle details with reservation using Car ID
            const connectedReservations = resList.map((res) => {
                const matchedCar = res.carId
                    ? map.get(res.carId.trim().toLowerCase())
                    : undefined;
                return {
                    ...res,
                    vehicle: matchedCar,
                };
            });

            setVehiclesMap(map);
            setReservations(connectedReservations);
        } catch (err: any) {
            console.error("Failed to load reservations:", err);
            setError(
                err?.message ||
                    "Failed to load reservation data from Google Sheet.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Format currency helper
    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0";
        return `$${val.toLocaleString()}`;
    };

    // Format Timestamp helper: "2026-10-21 23:23:45 EST" -> "Oct 21, 2026 at 11:23 PM"
    const formatReservationTimestamp = (rawTs?: string): string => {
        if (!rawTs) return "N/A";
        try {
            // Strip timezone suffix for parsing if needed
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
        } catch {
            // fallback below
        }
        return rawTs;
    };

    // Helper: calculate total rental days from pickup date to return date
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

    // Calculate Price Before Discount = Multiply by 'Rent Price' (or Car Price) and Dates
    const calculateGrossTotal = (
        res: ReservationRecord,
    ): { days: number; grossTotal: number } => {
        const days = getRentalDays(res.pickupDate, res.returnDate);
        const car = res.vehicle;
        const dailyRentRate =
            car && car.rentPrice !== undefined && car.rentPrice > 0
                ? car.rentPrice
                : car
                  ? car.originalPrice || car.price
                  : res.rentalRate || 0;
        const gross = dailyRentRate * days;
        return { days, grossTotal: gross };
    };

    // Clean payment option display (Strip email or phone so only Zelle, Cash App, In Person remain)
    const cleanPaymentOption = (opt?: string): string => {
        if (!opt) return "Zelle";
        const o = opt.toLowerCase();
        if (o.includes("zelle")) return "Zelle";
        if (o.includes("cash app") || o.includes("cashapp")) return "Cash App";
        if (o.includes("in person") || o.includes("cash")) return "In Person";
        return opt.replace(/\s*\(.*?\)\s*/g, "").trim();
    };

    // Filter & Sort Reservations
    const processedReservations = useMemo(() => {
        let list = [...reservations];

        // Search filter (Name, Reservation ID, Email, Phone, Car ID)
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((r) => {
                const car = r.vehicle;
                const combined = [
                    r.confirmationNumber,
                    r.carId,
                    r.carTitle,
                    r.firstName,
                    r.lastName,
                    r.email,
                    r.phone,
                    r.pickupLocation,
                    r.returnLocation,
                    r.paymentOption,
                    r.paymentStatus,
                    r.reservationStatus,
                    r.couponCode,
                    car?.make || "",
                    car?.model || "",
                    car?.year?.toString() || "",
                    car?.bodyStyle || "",
                    car?.driveline || "",
                    car?.fuelType || "",
                ]
                    .join(" ")
                    .toLowerCase();

                return combined.includes(q);
            });
        }

        // Reservation Status filter
        if (statusFilter !== "all") {
            list = list.filter((r) => {
                const s = (r.reservationStatus || "Pending").toLowerCase();
                return s === statusFilter.toLowerCase();
            });
        }

        // Payment status filter (Pending, Paid, Unpaid)
        if (paymentFilter !== "all") {
            list = list.filter((r) => {
                const status = (r.paymentStatus || "").toLowerCase();
                if (paymentFilter === "paid") {
                    return (
                        status.includes("paid") && !status.includes("unpaid")
                    );
                }
                if (paymentFilter === "unpaid") {
                    return status.includes("unpaid");
                }
                if (paymentFilter === "pending") {
                    return (
                        status.includes("pending") ||
                        status.includes("no payment") ||
                        !r.paymentStatus
                    );
                }
                return true;
            });
        }

        // Sorting
        switch (sortBy) {
            case "newest":
                // Standard reverse order (most recent first)
                break;
            case "oldest":
                list.reverse();
                break;
            case "pickup-soonest":
                list.sort((a, b) => {
                    const tA = new Date(a.pickupDate || 0).getTime();
                    const tB = new Date(b.pickupDate || 0).getTime();
                    return tA - tB;
                });
                break;
            case "total-high":
                list.sort(
                    (a, b) =>
                        (b.estimatedTotal || b.rentalRate || 0) -
                        (a.estimatedTotal || a.rentalRate || 0),
                );
                break;
            case "total-low":
                list.sort(
                    (a, b) =>
                        (a.estimatedTotal || a.rentalRate || 0) -
                        (b.estimatedTotal || b.rentalRate || 0),
                );
                break;
            case "name-asc":
                list.sort((a, b) =>
                    `${a.firstName} ${a.lastName}`.localeCompare(
                        `${b.firstName} ${b.lastName}`,
                    ),
                );
                break;
        }

        return list;
    }, [reservations, searchTerm, sortBy, statusFilter, paymentFilter]);

    // Pagination calculations
    const totalPages =
        Math.ceil(processedReservations.length / itemsPerPage) || 1;
    const paginatedReservations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedReservations.slice(start, start + itemsPerPage);
    }, [processedReservations, currentPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, statusFilter, paymentFilter]);

    // Print individual reservation
    const handlePrintReservation = (res: ReservationRecord) => {
        setSelectedRes(res);
        setTimeout(() => {
            window.print();
        }, 200);
    };

    // Open Payment Approval Modal
    const handleOpenPaymentModal = (res: ReservationRecord) => {
        setPaymentModalRes(res);
        setApprovalPaymentOption(cleanPaymentOption(res.paymentOption));
        setApprovalCoverage("full");
        setApprovalPaymentStatus(
            res.paymentStatus?.toLowerCase().includes("paid") &&
                !res.paymentStatus?.toLowerCase().includes("unpaid")
                ? "Paid"
                : "Paid",
        );
    };

    // Save Payment Approval
    // SEPARATE RULE: Marking payment as Paid does NOT approve reservation
    const handleSavePaymentApproval = async () => {
        if (!paymentModalRes) return;
        setIsUpdatingPayment(true);

        const newPaymentStatus = approvalPaymentStatus;
        const savedOption = cleanPaymentOption(approvalPaymentOption);
        const confNum = paymentModalRes.confirmationNumber;

        // Optimistically update local state
        setReservations((prev) =>
            prev.map((r) =>
                r.confirmationNumber === confNum
                    ? {
                          ...r,
                          paymentStatus: newPaymentStatus,
                          paymentOption: savedOption,
                      }
                    : r,
            ),
        );

        if (selectedRes && selectedRes.confirmationNumber === confNum) {
            setSelectedRes((prev) =>
                prev
                    ? {
                          ...prev,
                          paymentStatus: newPaymentStatus,
                          paymentOption: savedOption,
                      }
                    : null,
            );
        }

        // Forward to Google Sheet via webhook
        const webhook =
            scriptWebhookUrl.trim() ||
            localStorage.getItem("WFM_APPS_SCRIPT_URL") ||
            "";

        if (webhook) {
            try {
                await fetch(webhook, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "update_reservation_status",
                        confirmationNumber: confNum,
                        paymentStatus: newPaymentStatus,
                        paymentOption: savedOption,
                        coverage: approvalCoverage,
                    }),
                });
            } catch (err) {
                console.error("Payment status webhook error:", err);
            }
        }

        setIsUpdatingPayment(false);
        setPaymentModalRes(null);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Payment Updated!",
            message: `Payment status for #${confNum} set to "${newPaymentStatus}" (${savedOption} - ${approvalCoverage === "full" ? "Full payment" : "Partial deposit"}). Reservation status remains separate and unchanged.`,
        });
    };

    // Open Reservation Status Modal
    const handleOpenResStatusModal = (res: ReservationRecord) => {
        setResStatusModalRes(res);
        const current = (res.reservationStatus || "Pending").toLowerCase();
        if (current.includes("approv")) {
            setTargetResStatus("Approved");
        } else if (current.includes("decline")) {
            setTargetResStatus("Declined");
        } else {
            setTargetResStatus("Pending");
        }
    };

    // Save Reservation Status
    const handleSaveResStatus = async () => {
        if (!resStatusModalRes) return;

        // Validation: Reservation Status can be approved only when Payment Status is Paid
        if (targetResStatus === "Approved") {
            const pStatus = (
                resStatusModalRes.paymentStatus || ""
            ).toLowerCase();
            const isPaid =
                pStatus.includes("paid") && !pStatus.includes("unpaid");
            if (!isPaid) {
                setAlertModal({
                    isOpen: true,
                    type: "error",
                    title: "Payment Required for Approval",
                    message: `Reservation #${resStatusModalRes.confirmationNumber} cannot be approved because Payment Status is "${resStatusModalRes.paymentStatus || "Pending"}". Payment must be Paid first.`,
                });
                return;
            }
        }

        setIsUpdatingResStatus(true);

        const confNum = resStatusModalRes.confirmationNumber;
        const newResStatus = targetResStatus;

        // Optimistically update local state
        setReservations((prev) =>
            prev.map((r) =>
                r.confirmationNumber === confNum
                    ? {
                          ...r,
                          reservationStatus: newResStatus,
                      }
                    : r,
            ),
        );

        if (selectedRes && selectedRes.confirmationNumber === confNum) {
            setSelectedRes((prev) =>
                prev ? { ...prev, reservationStatus: newResStatus } : null,
            );
        }

        const webhook =
            scriptWebhookUrl.trim() ||
            localStorage.getItem("WFM_APPS_SCRIPT_URL") ||
            "";

        if (webhook) {
            try {
                await fetch(webhook, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "update_reservation_status",
                        confirmationNumber: confNum,
                        reservationStatus: newResStatus,
                    }),
                });
            } catch (err) {
                console.error("Reservation status webhook error:", err);
            }
        }

        setIsUpdatingResStatus(false);
        setResStatusModalRes(null);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Reservation Status Updated!",
            message: `Reservation #${confNum} is now marked as "${newResStatus}".`,
        });
    };

    // Open Edit Customer/Dates Modal
    const handleOpenEditModal = (res: ReservationRecord) => {
        setEditingRes(res);
        setEditForm({
            firstName: res.firstName || "",
            lastName: res.lastName || "",
            email: res.email || "",
            phone: res.phone || "",
            pickupDate: res.pickupDate || "",
            pickupTime: res.pickupTime || "10:00 AM",
            returnDate: res.returnDate || "",
            returnTime: res.returnTime || "10:00 AM",
            pickupLocation: res.pickupLocation || "",
            returnLocation: res.returnLocation || "",
            notes: res.notes || "",
        });
    };

    // Save Edit Form
    const handleSaveEditForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRes) return;
        setIsSavingEdit(true);

        const confNum = editingRes.confirmationNumber;
        const updatedRes: ReservationRecord = {
            ...editingRes,
            ...editForm,
        };

        setReservations((prev) =>
            prev.map((r) =>
                r.confirmationNumber === confNum ? updatedRes : r,
            ),
        );

        if (selectedRes && selectedRes.confirmationNumber === confNum) {
            setSelectedRes(updatedRes);
        }

        const webhook =
            scriptWebhookUrl.trim() ||
            localStorage.getItem("WFM_APPS_SCRIPT_URL") ||
            "";

        if (webhook) {
            try {
                await fetch(webhook, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "update_reservation_status",
                        confirmationNumber: confNum,
                        ...editForm,
                    }),
                });
            } catch (err) {
                console.error("Save edit webhook error:", err);
            }
        }

        setIsSavingEdit(false);
        setEditingRes(null);
        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Reservation Details Updated!",
            message: `Customer & rental dates for #${confNum} updated successfully.`,
        });
    };

    // Helper: calculate new return date when extended by X days
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

    // Format Date string: "2026-11-17" -> "Nov 17, 2026"
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

    // Handle Quick Status Change from Details Panel (e.g. Approve / Decline)
    const handleQuickStatusChange = async (
        res: ReservationRecord,
        newStatus: "Approved" | "Declined" | "Pending",
    ) => {
        // Validation: Reservation Status can be approved only when Payment Status is Paid
        if (newStatus === "Approved") {
            const pStatus = (res.paymentStatus || "").toLowerCase();
            const isPaid =
                pStatus.includes("paid") && !pStatus.includes("unpaid");
            if (!isPaid) {
                setAlertModal({
                    isOpen: true,
                    type: "error",
                    title: "Payment Required for Approval",
                    message: `Reservation #${res.confirmationNumber} cannot be approved because Payment Status is "${res.paymentStatus || "Pending"}". Payment must be Paid first.`,
                });
                return;
            }
        }

        const confNum = res.confirmationNumber;
        const updated = { ...res, reservationStatus: newStatus };

        setReservations((prev) =>
            prev.map((r) => (r.confirmationNumber === confNum ? updated : r)),
        );
        setSelectedRes(updated);

        const webhook =
            scriptWebhookUrl.trim() ||
            localStorage.getItem("WFM_APPS_SCRIPT_URL") ||
            "";

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
                console.error("Quick status webhook error:", err);
            }
        }

        setAlertModal({
            isOpen: true,
            type: "success",
            title: "Reservation Status Updated!",
            message: `Reservation #${confNum} is now marked as "${newStatus}".`,
        });
    };

    // Handle Extend Rental Save
    const handleApplyExtension = async () => {
        if (!selectedRes) return;
        setIsExtending(true);

        const currentReturnDate = selectedRes.returnDate;
        const newReturnDate = calculateExtendedReturnDate(
            currentReturnDate,
            extendDays,
        );

        const car = selectedRes.vehicle;
        const dailyRentRate =
            car && car.rentPrice !== undefined && car.rentPrice > 0
                ? car.rentPrice
                : car
                  ? car.originalPrice || car.price
                  : selectedRes.rentalRate || 0;

        let extraCharge = 0;
        if (extendChargeType === "daily") {
            extraCharge = dailyRentRate * extendDays;
        } else if (extendChargeType === "custom") {
            extraCharge = customExtendAmount || 0;
        }

        const prevTotal = selectedRes.estimatedTotal || 0;
        const newEstimatedTotal = prevTotal + extraCharge;

        const updated: ReservationRecord = {
            ...selectedRes,
            returnDate: newReturnDate,
            estimatedTotal: newEstimatedTotal,
            notes: selectedRes.notes
                ? `${selectedRes.notes}\n[Extended +${extendDays} day(s) until ${newReturnDate}. Additional: $${extraCharge}]`
                : `[Extended +${extendDays} day(s) until ${newReturnDate}. Additional: $${extraCharge}]`,
        };

        const confNum = selectedRes.confirmationNumber;
        setReservations((prev) =>
            prev.map((r) => (r.confirmationNumber === confNum ? updated : r)),
        );
        setSelectedRes(updated);

        const webhook =
            scriptWebhookUrl.trim() ||
            localStorage.getItem("WFM_APPS_SCRIPT_URL") ||
            "";

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

    // Calculate Status Card Counts
    const totalReservationsCount = reservations.length;
    const pendingReservationsCount = reservations.filter((r) => {
        const s = (r.reservationStatus || "Pending").toLowerCase();
        return !s.includes("approv") && !s.includes("decline");
    }).length;
    const approvedReservationsCount = reservations.filter((r) => {
        const s = (r.reservationStatus || "").toLowerCase();
        return s.includes("approv");
    }).length;
    const declinedReservationsCount = reservations.filter((r) => {
        const s = (r.reservationStatus || "").toLowerCase();
        return s.includes("decline");
    }).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                Rental Reservations
                            </h2>
                            <span className="text-xs bg-dark-purple/10 text-dark-purple font-bold px-2.5 py-0.5 rounded-full border border-dark-purple/20">
                                {reservations.length} Bookings
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Review, approve, or decline rental requests.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.rent.index")}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            <svg
                                className="w-4 h-4 text-vivid-red"
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
                            <span>View All Rent Cars</span>
                        </Link>
                        <button
                            type="button"
                            onClick={loadData}
                            disabled={loading}
                            title="Reload reservations from Google Sheet"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shadow-sm disabled:opacity-50"
                        >
                            <svg
                                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Rental Reservations - Wright Finder Motors" />

            <div className="space-y-5">
                {/* Status KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 1. Total Reservations */}
                    <div
                        onClick={() => setStatusFilter("all")}
                        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all cursor-pointer flex items-center gap-4 ${
                            statusFilter === "all"
                                ? "border-purple shadow-md ring-2 ring-purple/20"
                                : "border-slate-200/80 hover:border-slate-300 hover:shadow"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple text-white flex items-center justify-center shrink-0 shadow-md shadow-purple/20">
                            <svg
                                className="w-6 h-6"
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
                        </div>
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                                {totalReservationsCount}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-1 truncate">
                                Total Reservations
                            </div>
                        </div>
                    </div>

                    {/* 2. Pending */}
                    <div
                        onClick={() => setStatusFilter("pending")}
                        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all cursor-pointer flex items-center gap-4 ${
                            statusFilter === "pending"
                                ? "border-amber-400 shadow-md ring-2 ring-amber-400/20"
                                : "border-slate-200/80 hover:border-slate-300 hover:shadow"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                                {pendingReservationsCount}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-1 truncate">
                                Pending
                            </div>
                        </div>
                    </div>

                    {/* 3. Approved */}
                    <div
                        onClick={() => setStatusFilter("approved")}
                        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all cursor-pointer flex items-center gap-4 ${
                            statusFilter === "approved"
                                ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                                : "border-slate-200/80 hover:border-slate-300 hover:shadow"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                                {approvedReservationsCount}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-1 truncate">
                                Approved
                            </div>
                        </div>
                    </div>

                    {/* 4. Declined */}
                    <div
                        onClick={() => setStatusFilter("declined")}
                        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all cursor-pointer flex items-center gap-4 ${
                            statusFilter === "declined"
                                ? "border-rose-500 shadow-md ring-2 ring-rose-500/20"
                                : "border-slate-200/80 hover:border-slate-300 hover:shadow"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                                {declinedReservationsCount}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-1 truncate">
                                Declined
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Control Bar: Search, Status, Payment, Sort, Reset */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[240px] max-w-lg">
                        <svg
                            className="w-4 h-4 text-purple absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Name, Reservation ID, Email, Phone, or Stock ID..."
                            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple placeholder:text-slate-400 shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter & Sort Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Reservation Status Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">
                                Status:
                            </span>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="declined">Declined</option>
                                </select>
                                <svg
                                    className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Payment Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">
                                Payment:
                            </span>
                            <div className="relative">
                                <select
                                    value={paymentFilter}
                                    onChange={(e) =>
                                        setPaymentFilter(e.target.value)
                                    }
                                    className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                </select>
                                <svg
                                    className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Sort By Dropdown */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">
                                Sort By:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as SortOption)
                                    }
                                    className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="pickup-soonest">
                                        Pickup: Soonest
                                    </option>
                                    <option value="total-high">
                                        Total: High to Low
                                    </option>
                                    <option value="total-low">
                                        Total: Low to High
                                    </option>
                                    <option value="name-asc">
                                        Driver (A - Z)
                                    </option>
                                </select>
                                <svg
                                    className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Reset Filters Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setPaymentFilter("all");
                                setSortBy("newest");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Reset filters"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    {/* Error State */}
                    {error && (
                        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 flex items-center justify-between">
                            <span className="text-xs font-semibold">
                                {error}
                            </span>
                            <button
                                onClick={loadData}
                                className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-dark-purple text-white text-[11px] font-bold uppercase tracking-wider select-none border-b border-dark-purple">
                                    <th className="py-3.5 px-3 text-center w-12 shrink-0">
                                        No
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[210px]">
                                        Reservation ID / Rental Dates
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[200px]">
                                        Customer Info
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[250px]">
                                        Vehicle Info
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[180px]">
                                        Price &amp; Savings
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[120px]">
                                        Payment
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[120px]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[130px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-9 h-9 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Fetching reservations from
                                                    Google Sheet...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedReservations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <p className="text-sm font-semibold text-slate-600">
                                                    No reservations found
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Try adjusting your search
                                                    criteria or filters above.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReservations.map((res, index) => {
                                        const autoIncNo =
                                            (currentPage - 1) * itemsPerPage +
                                            index +
                                            1;
                                        const car = res.vehicle;

                                        // Image
                                        const mainImage =
                                            car?.mainImageUrl ||
                                            (car?.images && car.images[0]) ||
                                            "";

                                        // Rental Days & Gross
                                        const { days, grossTotal } =
                                            calculateGrossTotal(res);
                                        const finalTotal =
                                            res.estimatedTotal > 0
                                                ? res.estimatedTotal
                                                : grossTotal;
                                        const hasCoupon = Boolean(
                                            res.couponCode &&
                                            res.couponCode.trim(),
                                        );
                                        const couponSavings =
                                            res.couponDiscount !== undefined &&
                                            res.couponDiscount > 0
                                                ? res.couponDiscount
                                                : Math.max(
                                                      0,
                                                      grossTotal - finalTotal,
                                                  );
                                        const savingsPct =
                                            grossTotal > 0 && couponSavings > 0
                                                ? Math.round(
                                                      (couponSavings /
                                                          grossTotal) *
                                                          100,
                                                  )
                                                : 0;

                                        // Payment status
                                        const pLower = (
                                            res.paymentStatus || ""
                                        ).toLowerCase();
                                        const isPaid =
                                            pLower.includes("paid") &&
                                            !pLower.includes("unpaid");
                                        const isUnpaid =
                                            pLower.includes("unpaid");
                                        const isPaymentPending =
                                            !isPaid && !isUnpaid;

                                        // Reservation status
                                        const rLower = (
                                            res.reservationStatus || "Pending"
                                        ).toLowerCase();
                                        const isApproved =
                                            rLower.includes("approv");
                                        const isDeclined =
                                            rLower.includes("decline");
                                        const isResPending =
                                            !isApproved && !isDeclined;

                                        // Clean Payment option
                                        const displayPaymentOption =
                                            cleanPaymentOption(
                                                res.paymentOption,
                                            );

                                        return (
                                            <tr
                                                key={
                                                    res.confirmationNumber ||
                                                    index
                                                }
                                                className="transition-colors group hover:bg-slate-50/80"
                                            >
                                                {/* 1. NO */}
                                                <td className="py-4 px-3 text-center font-bold text-slate-700">
                                                    {autoIncNo}
                                                </td>

                                                {/* 2. RESERVATION ID / RENTAL DATE */}
                                                <td className="py-4 px-4">
                                                    {/* Confirmation Number Pill */}
                                                    <div className="mb-2">
                                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple/10 text-purple border border-purple/20">
                                                            {
                                                                res.confirmationNumber
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Pickup Date & Time */}
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                                                        <span className="text-emerald-600 font-bold">
                                                            📅
                                                        </span>
                                                        <span>
                                                            <strong className="font-bold">
                                                                Pickup:
                                                            </strong>{" "}
                                                            {res.pickupDate ||
                                                                "N/A"}{" "}
                                                            {res.pickupTime
                                                                ? `at ${res.pickupTime}`
                                                                : ""}
                                                        </span>
                                                    </div>

                                                    {/* Return Date & Time */}
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mt-0.5">
                                                        <span className="text-rose-500 font-bold">
                                                            📅
                                                        </span>
                                                        <span>
                                                            <strong className="font-bold">
                                                                Return:
                                                            </strong>{" "}
                                                            {res.returnDate ||
                                                                "N/A"}{" "}
                                                            {res.returnTime
                                                                ? `at ${res.returnTime}`
                                                                : ""}
                                                        </span>
                                                    </div>

                                                    {/* Difference of dates */}
                                                    <div className="text-[11px] font-bold text-slate-500 mt-1 pl-5">
                                                        ({days}{" "}
                                                        {days === 1
                                                            ? "Day"
                                                            : "Days"}
                                                        )
                                                    </div>
                                                </td>

                                                {/* 3. CUSTOMER INFO */}
                                                <td className="py-4 px-4">
                                                    {/* First & Last Name */}
                                                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                                                        <svg
                                                            className="w-3.5 h-3.5 text-purple shrink-0"
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
                                                        <span>
                                                            {res.firstName}{" "}
                                                            {res.lastName}
                                                        </span>
                                                    </div>

                                                    {/* Email */}
                                                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-1 truncate max-w-[200px]">
                                                        <svg
                                                            className="w-3.5 h-3.5 text-slate-400 shrink-0"
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
                                                        <a
                                                            href={`mailto:${res.email}`}
                                                            className="hover:text-purple hover:underline truncate"
                                                            title={res.email}
                                                        >
                                                            {res.email}
                                                        </a>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-1">
                                                        <svg
                                                            className="w-3.5 h-3.5 text-slate-400 shrink-0"
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
                                                        <span>
                                                            {res.phone || "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 4. VEHICLE INFO (2 subcolumns: left car image, right vehicle specs) */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Left side: Car Image */}
                                                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center shadow-sm">
                                                            {mainImage ? (
                                                                <img
                                                                    src={
                                                                        mainImage
                                                                    }
                                                                    alt={
                                                                        car?.make ||
                                                                        "Vehicle"
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.currentTarget as HTMLElement
                                                                        ).style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-xs text-slate-400">
                                                                    🚗
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Right side: Vehicle Details */}
                                                        <div className="min-w-0">
                                                            {/* Year + Car Name + Model */}
                                                            <div className="font-bold text-slate-900 leading-snug truncate">
                                                                {[
                                                                    car?.year,
                                                                    car?.make,
                                                                    car?.model,
                                                                ]
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .join(
                                                                        " ",
                                                                    ) ||
                                                                    res.carTitle ||
                                                                    "Vehicle"}
                                                            </div>

                                                            {/* Body Style and Fuel Type */}
                                                            <div className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                                                                {car?.bodyStyle ||
                                                                    "Sedan"}{" "}
                                                                |{" "}
                                                                {car?.fuelType ||
                                                                    "Gasoline"}
                                                            </div>

                                                            {/* Car ID */}
                                                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                                Stock ID:{" "}
                                                                <span className="font-mono font-bold text-slate-700">
                                                                    {res.carId ||
                                                                        car?.id ||
                                                                        "-"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 5. PRICE & SAVINGS */}
                                                <td className="py-4 px-4 font-sans text-xs">
                                                    {/* Before Coupon */}
                                                    <div className="text-slate-600 flex items-center justify-between gap-2">
                                                        <span>
                                                            Before Coupon:
                                                        </span>
                                                        <span className="font-bold text-slate-900">
                                                            {formatCurrency(
                                                                grossTotal,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Coupon with reduce cost */}
                                                    <div className="text-slate-600 flex items-center justify-between gap-2 mt-0.5">
                                                        <span>Coupon:</span>
                                                        {hasCoupon ? (
                                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                                {res.couponCode}{" "}
                                                                (-
                                                                {formatCurrency(
                                                                    couponSavings,
                                                                )}
                                                                )
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* After Coupon */}
                                                    <div className="text-slate-700 flex items-center justify-between gap-2 mt-0.5">
                                                        <span>
                                                            After Coupon:
                                                        </span>
                                                        <span className="font-black text-slate-900 text-sm">
                                                            {formatCurrency(
                                                                finalTotal,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Savings cost Badge */}
                                                    <div className="mt-1.5">
                                                        {couponSavings > 0 ? (
                                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                Savings:{" "}
                                                                {formatCurrency(
                                                                    couponSavings,
                                                                )}{" "}
                                                                ({savingsPct}%)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                                                Savings: $0
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 6. PAYMENT */}
                                                <td className="py-4 px-4 text-center">
                                                    {/* Payment Status Pill */}
                                                    <div className="mb-1">
                                                        {isPaid && (
                                                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                Paid
                                                            </span>
                                                        )}
                                                        {isPaymentPending && (
                                                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                        {isUnpaid && (
                                                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                                Unpaid
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Payment Option */}
                                                    <div className="text-xs font-semibold text-slate-700">
                                                        {displayPaymentOption}
                                                    </div>
                                                </td>

                                                {/* 7. STATUS */}
                                                <td className="py-4 px-4 text-center">
                                                    {isApproved ? (
                                                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            Approved
                                                        </span>
                                                    ) : isDeclined ? (
                                                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                            Declined
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 8. ACTIONS */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* 1. View button */}
                                                        <Link
                                                            href={route(
                                                                "admin.reservations.show",
                                                                {
                                                                    confirmationNumber:
                                                                        res.confirmationNumber,
                                                                },
                                                            )}
                                                            title="View Reservation Details"
                                                            aria-label="View Details"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-dark-purple bg-slate-50 border border-slate-200 transition shadow-sm inline-flex items-center justify-center"
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
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </Link>

                                                        {/* 2. Edit button */}
                                                        <Link
                                                            href={route(
                                                                "admin.reservations.edit",
                                                                {
                                                                    confirmationNumber:
                                                                        res.confirmationNumber,
                                                                },
                                                            )}
                                                            title="Edit Reservation Details"
                                                            aria-label="Edit Reservation"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-purple bg-slate-50 border border-slate-200 transition shadow-sm inline-flex items-center justify-center"
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
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </Link>

                                                        {/* 3. Reservation button (Status indicator & switcher) */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenResStatusModal(
                                                                    res,
                                                                )
                                                            }
                                                            title={`Reservation Status: ${res.reservationStatus || "Pending"} (Click to change: Pending, Approved, Declined)`}
                                                            aria-label="Change Reservation Status"
                                                            className={`p-1.5 rounded-lg border transition shadow-sm ${
                                                                isApproved
                                                                    ? "text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border-emerald-200"
                                                                    : isDeclined
                                                                      ? "text-rose-700 hover:bg-rose-100 bg-rose-50 border-rose-200"
                                                                      : "text-amber-800 hover:bg-amber-100 bg-amber-50 border-amber-200"
                                                            }`}
                                                        >
                                                            {isApproved ? (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            ) : isDeclined ? (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                        <div>
                            Showing{" "}
                            <span className="font-bold text-slate-900">
                                {processedReservations.length === 0
                                    ? 0
                                    : (currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-slate-900">
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    processedReservations.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-slate-900">
                                {processedReservations.length}
                            </span>{" "}
                            reservations
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1.5 font-bold text-slate-800">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL / PANEL FOR RESERVATION */}
            {selectedRes &&
                (() => {
                    const days = getRentalDays(
                        selectedRes.pickupDate,
                        selectedRes.returnDate,
                    );
                    const car = selectedRes.vehicle;
                    const dailyRentRate =
                        car && car.rentPrice !== undefined && car.rentPrice > 0
                            ? car.rentPrice
                            : car
                              ? car.originalPrice || car.price
                              : selectedRes.rentalRate || 0;
                    const beforeCouponCost = dailyRentRate * days;
                    const hasCoupon = Boolean(
                        selectedRes.couponCode && selectedRes.couponCode.trim(),
                    );
                    const totalCost =
                        selectedRes.estimatedTotal || beforeCouponCost;
                    const savingsCost = Math.max(
                        0,
                        beforeCouponCost - totalCost,
                    );
                    const savingsPercent =
                        beforeCouponCost > 0
                            ? Math.round((savingsCost / beforeCouponCost) * 100)
                            : 0;

                    const resStatus =
                        selectedRes.reservationStatus || "Pending";
                    const rLower = resStatus.toLowerCase();
                    const isApproved = rLower.includes("approv");
                    const isDeclined = rLower.includes("decline");
                    const isPending = !isApproved && !isDeclined;

                    // Extend rental calculations
                    const extendedReturnDateStr = calculateExtendedReturnDate(
                        selectedRes.returnDate,
                        extendDays,
                    );
                    let extensionAdditionalCharge = 0;
                    if (extendChargeType === "daily") {
                        extensionAdditionalCharge = dailyRentRate * extendDays;
                    } else if (extendChargeType === "custom") {
                        extensionAdditionalCharge = customExtendAmount || 0;
                    }
                    const newTotalWithExtension =
                        totalCost + extensionAdditionalCharge;

                    // Car details
                    const carImageUrl =
                        car?.mainImageUrl ||
                        formatDriveImageUrl(car?.images?.[0] || "");
                    const carTitleStr =
                        [car?.year, car?.make, car?.model]
                            .filter(Boolean)
                            .join(" ") ||
                        selectedRes.carTitle ||
                        "Vehicle Details";
                    const bodyStyleFuelStr = `${car?.bodyStyle || "Sedan"} • ${car?.fuelType || "Gasoline"}`;
                    const stockIdStr = selectedRes.carId || car?.id || "N/A";

                    return (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
                            onClick={() => setSelectedRes(null)}
                        >
                            <div
                                className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 transform transition-all relative overflow-hidden my-auto max-h-[92vh] flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Top Purple Header Bar */}
                                <div className="bg-gradient-to-r from-[#591ba5] via-[#6d28d9] to-[#7c3aed] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
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
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-black tracking-wide text-white">
                                            Reservation Details
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRes(null)}
                                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Scrollable Content Body */}
                                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
                                    {/* Reservation Status & Confirmation Header */}
                                    <div className="space-y-1">
                                        <div>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
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
                                        <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                                            <span>Reservation:</span>
                                            <span className="text-purple font-mono">
                                                {selectedRes.confirmationNumber}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Requested on:{" "}
                                            {formatReservationTimestamp(
                                                selectedRes.timestamp,
                                            )}
                                        </div>
                                    </div>

                                    {/* Vehicle Information Section */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-4">
                                        {/* Left side: Vehicle car image */}
                                        <div className="w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden bg-white border border-slate-200/80 shrink-0 flex items-center justify-center shadow-sm">
                                            {carImageUrl ? (
                                                <img
                                                    src={carImageUrl}
                                                    alt={carTitleStr}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-2xl text-slate-300">
                                                    🚗
                                                </span>
                                            )}
                                        </div>

                                        {/* Right side: Vehicle specs */}
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="text-sm font-black text-slate-900 leading-snug truncate">
                                                {carTitleStr}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-600">
                                                {bodyStyleFuelStr}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-500">
                                                Stock ID:{" "}
                                                <span className="font-mono font-bold text-slate-800">
                                                    {stockIdStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information Section */}
                                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-1.5 border-b border-slate-100">
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
                                            <span>Customer Information</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-semibold text-[11px]">
                                                    Name:
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedRes.firstName}{" "}
                                                    {selectedRes.lastName}
                                                </span>
                                            </div>
                                            <div className="truncate">
                                                <span className="text-slate-400 block font-semibold text-[11px]">
                                                    Email:
                                                </span>
                                                <a
                                                    href={`mailto:${selectedRes.email}`}
                                                    className="font-bold text-purple hover:underline truncate block"
                                                    title={selectedRes.email}
                                                >
                                                    {selectedRes.email || "N/A"}
                                                </a>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-semibold text-[11px]">
                                                    Phone:
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedRes.phone || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rental Schedule Section */}
                                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-1.5 border-b border-slate-100">
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
                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                    <span className="text-emerald-600">
                                                        📅
                                                    </span>
                                                    <span>Pickup:</span>
                                                    <span className="text-slate-900">
                                                        {formatDisplayDate(
                                                            selectedRes.pickupDate,
                                                        )}{" "}
                                                        at{" "}
                                                        {selectedRes.pickupTime ||
                                                            "10:00 AM"}{" "}
                                                        (EST)
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 pl-6 flex items-center gap-1 mt-0.5">
                                                    <span>📍</span>
                                                    <span>
                                                        {selectedRes.pickupLocation ||
                                                            "Dayton, Ohio: Wright finder motors (primary hub)"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                    <span className="text-rose-600">
                                                        📅
                                                    </span>
                                                    <span>Return:</span>
                                                    <span className="text-slate-900">
                                                        {formatDisplayDate(
                                                            selectedRes.returnDate,
                                                        )}{" "}
                                                        at{" "}
                                                        {selectedRes.returnTime ||
                                                            "10:00 AM"}{" "}
                                                        (EST)
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 pl-6 flex items-center gap-1 mt-0.5">
                                                    <span>📍</span>
                                                    <span>
                                                        {selectedRes.returnLocation ||
                                                            selectedRes.pickupLocation ||
                                                            "Dayton, Ohio: Wright finder motors (primary hub)"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-semibold">
                                                    Duration:
                                                </span>
                                                <span className="font-black text-slate-900">
                                                    {days}{" "}
                                                    {days === 1
                                                        ? "Day"
                                                        : "Days"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing & Savings Section */}
                                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-1.5 border-b border-slate-100">
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
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600 font-medium">
                                                    Before Coupon ({days} days x{" "}
                                                    {formatCurrency(
                                                        dailyRentRate,
                                                    )}
                                                    /day):
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    {formatCurrency(
                                                        beforeCouponCost,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600 font-medium">
                                                    Coupon:{" "}
                                                    {hasCoupon ? (
                                                        <span className="font-bold text-emerald-600">
                                                            {
                                                                selectedRes.couponCode
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            -
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-bold text-emerald-600">
                                                    {hasCoupon
                                                        ? `-${formatCurrency(savingsCost)}`
                                                        : "$0"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded-xl bg-purple/5 border border-purple/10">
                                                <span className="font-black text-slate-900">
                                                    After Coupon (Total):
                                                </span>
                                                <span className="text-base font-black text-slate-900">
                                                    {formatCurrency(totalCost)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                                                <span className="font-bold text-emerald-800">
                                                    Total Savings:
                                                </span>
                                                <span className="font-black text-emerald-700">
                                                    {formatCurrency(
                                                        savingsCost,
                                                    )}{" "}
                                                    {savingsPercent > 0
                                                        ? `(${savingsPercent}%)`
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information Section */}
                                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-1.5 border-b border-slate-100">
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
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-semibold text-[11px] mb-1">
                                                    Payment Status:
                                                </span>
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                                                        (
                                                            selectedRes.paymentStatus ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .includes("paid") &&
                                                        !(
                                                            selectedRes.paymentStatus ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .includes("unpaid")
                                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                            : (
                                                                    selectedRes.paymentStatus ||
                                                                    ""
                                                                )
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        "unpaid",
                                                                    )
                                                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                              : "bg-amber-100 text-amber-900 border border-amber-200"
                                                    }`}
                                                >
                                                    {selectedRes.paymentStatus ||
                                                        "Pending"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-semibold text-[11px] mb-1">
                                                    Payment Method:
                                                </span>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {cleanPaymentOption(
                                                        selectedRes.paymentOption,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extend Rental Section */}
                                    <div className="p-4 rounded-2xl bg-[#faf7ff] border border-purple/20 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center shrink-0">
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
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-purple">
                                                    Extend Rental
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Add more rental days or
                                                    adjust the extension charge.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                            {/* Left side: Add Days */}
                                            <div className="space-y-1.5">
                                                <label className="block text-[11px] font-bold text-slate-700">
                                                    Add Days:
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExtendDays((d) =>
                                                                Math.max(
                                                                    1,
                                                                    d - 1,
                                                                ),
                                                            )
                                                        }
                                                        className="w-9 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-base flex items-center justify-center text-slate-700 transition shadow-sm"
                                                    >
                                                        -
                                                    </button>
                                                    <div className="w-14 h-9 rounded-xl bg-white border border-slate-300 font-black text-sm flex items-center justify-center text-slate-900 shadow-inner">
                                                        {extendDays}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExtendDays(
                                                                (d) => d + 1,
                                                            )
                                                        }
                                                        className="w-9 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-base flex items-center justify-center text-slate-700 transition shadow-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Right side: Extension Charge Option */}
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-bold text-slate-700">
                                                    Extension Charge Option:
                                                </label>
                                                <div className="space-y-1.5 text-xs">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="extendCharge"
                                                            checked={
                                                                extendChargeType ===
                                                                "free"
                                                            }
                                                            onChange={() =>
                                                                setExtendChargeType(
                                                                    "free",
                                                                )
                                                            }
                                                            className="text-purple focus:ring-purple/40"
                                                        />
                                                        <span className="text-slate-700 font-medium">
                                                            No Charge
                                                            (Complimentary)
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="extendCharge"
                                                            checked={
                                                                extendChargeType ===
                                                                "daily"
                                                            }
                                                            onChange={() =>
                                                                setExtendChargeType(
                                                                    "daily",
                                                                )
                                                            }
                                                            className="text-purple focus:ring-purple/40"
                                                        />
                                                        <span className="text-slate-700 font-medium">
                                                            Use Daily Rate (
                                                            {formatCurrency(
                                                                dailyRentRate,
                                                            )}
                                                            /day) -{" "}
                                                            <span className="font-bold text-slate-900">
                                                                {formatCurrency(
                                                                    dailyRentRate *
                                                                        extendDays,
                                                                )}
                                                            </span>
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
                                                        <span className="text-slate-700 font-medium">
                                                            Custom Amount
                                                        </span>
                                                        <div className="flex items-center gap-1 ml-auto">
                                                            <span className="font-bold text-slate-500">
                                                                $
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    customExtendAmount
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setExtendChargeType(
                                                                        "custom",
                                                                    );
                                                                    setCustomExtendAmount(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    );
                                                                }}
                                                                className="w-20 px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple/40 text-black"
                                                            />
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Extension Summary Card */}
                                        <div className="p-3 rounded-xl bg-purple/10 border border-purple/20 text-xs text-purple space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span>ℹ️</span>
                                                <span>
                                                    New Return Date &amp; Time:{" "}
                                                    {formatDisplayDate(
                                                        extendedReturnDateStr,
                                                    )}{" "}
                                                    at{" "}
                                                    {selectedRes.returnTime ||
                                                        "10:00 AM"}{" "}
                                                    (EST)
                                                </span>
                                            </div>
                                            <div className="text-[11px] font-semibold text-slate-700 pl-5">
                                                Additional Charge:{" "}
                                                <strong className="text-purple font-black">
                                                    {formatCurrency(
                                                        extensionAdditionalCharge,
                                                    )}
                                                </strong>{" "}
                                                | New Total:{" "}
                                                <strong className="text-slate-900 font-black">
                                                    {formatCurrency(
                                                        newTotalWithExtension,
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Extend button & cancel button */}
                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setExtendDays(2);
                                                    setExtendChargeType("free");
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                            >
                                                Reset Extension
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleApplyExtension}
                                                disabled={isExtending}
                                                className="px-4 py-1.5 rounded-xl bg-purple hover:bg-dark-purple text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
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
                                    {selectedRes.notes && (
                                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                                            <h4 className="font-bold text-amber-900 text-[11px] mb-1">
                                                Special Notes / Customer
                                                Requests
                                            </h4>
                                            <p className="text-slate-700 whitespace-pre-wrap">
                                                {selectedRes.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Panel Footer Action Buttons */}
                                <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                                    <div className="flex items-center gap-2">
                                        {/* Approve Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuickStatusChange(
                                                    selectedRes,
                                                    "Approved",
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                                        >
                                            <span>✓</span>
                                            <span>Approve</span>
                                        </button>

                                        {/* Decline Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuickStatusChange(
                                                    selectedRes,
                                                    "Declined",
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
                                        >
                                            <span>✕</span>
                                            <span>Decline</span>
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenEditModal(selectedRes)
                                            }
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple/30 bg-purple/10 text-purple hover:bg-purple hover:text-white font-bold text-xs transition shadow-sm"
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
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            <span>Edit</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePrintReservation(
                                                    selectedRes,
                                                )
                                            }
                                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition shadow-sm"
                                        >
                                            Print Voucher
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRes(null)}
                                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

            {/* PAYMENT APPROVAL MODAL */}
            {paymentModalRes && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setPaymentModalRes(null)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Approve &amp; Update Payment
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Reservation #
                                    {paymentModalRes.confirmationNumber}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPaymentModalRes(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Note about separate approval */}
                        <div className="mb-4 p-3 rounded-xl bg-purple/10 border border-purple/20 text-xs text-purple font-medium">
                            <strong>Note:</strong> Payment approval and
                            Reservation approval are completely separate.
                            Marking payment as Paid will not automatically
                            approve the reservation.
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* Payment Status Dropdown */}
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">
                                    Payment Status
                                </label>
                                <select
                                    value={approvalPaymentStatus}
                                    onChange={(e) =>
                                        setApprovalPaymentStatus(
                                            e.target.value as any,
                                        )
                                    }
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl focus:ring-2 focus:ring-purple/40"
                                >
                                    <option value="Paid">
                                        Paid (Payment Received)
                                    </option>
                                    <option value="Pending">
                                        Pending (Awaiting Payment)
                                    </option>
                                    <option value="Unpaid">Unpaid</option>
                                </select>
                            </div>

                            {/* Payment Method / Option */}
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">
                                    Payment Option (Google Sheet column saves
                                    clean name only)
                                </label>
                                <select
                                    value={approvalPaymentOption}
                                    onChange={(e) =>
                                        setApprovalPaymentOption(e.target.value)
                                    }
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl focus:ring-2 focus:ring-purple/40"
                                >
                                    <option value="Zelle">Zelle</option>
                                    <option value="Cash App">Cash App</option>
                                    <option value="In Person">
                                        In Person / Cash
                                    </option>
                                </select>
                            </div>

                            {/* Coverage (Full or Partial deposit) */}
                            <div>
                                <label className="block font-bold uppercase text-slate-700 mb-1">
                                    Payment Scope
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setApprovalCoverage("full")
                                        }
                                        className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                                            approvalCoverage === "full"
                                                ? "bg-dark-purple text-white border-dark-purple shadow-sm"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        Full Amount
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setApprovalCoverage("partial")
                                        }
                                        className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                                            approvalCoverage === "partial"
                                                ? "bg-dark-purple text-white border-dark-purple shadow-sm"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        Partial / Deposit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setPaymentModalRes(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePaymentApproval}
                                disabled={isUpdatingPayment}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
                            >
                                {isUpdatingPayment
                                    ? "Saving..."
                                    : "Confirm Payment Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RESERVATION STATUS CHANGE MODAL */}
            {resStatusModalRes && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setResStatusModalRes(null)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple/10 text-purple flex items-center justify-center mb-3">
                            <svg
                                className="w-7 h-7"
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
                        </div>

                        <h3 className="text-base font-black text-slate-900">
                            Change Reservation Status
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Reservation #{resStatusModalRes.confirmationNumber}{" "}
                            for {resStatusModalRes.firstName}{" "}
                            {resStatusModalRes.lastName}
                        </p>

                        <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-semibold">
                                    Current Status:
                                </span>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                        (
                                            resStatusModalRes.reservationStatus ||
                                            ""
                                        )
                                            .toLowerCase()
                                            .includes("approv")
                                            ? "bg-emerald-100 text-emerald-800"
                                            : (
                                                    resStatusModalRes.reservationStatus ||
                                                    ""
                                                )
                                                    .toLowerCase()
                                                    .includes("decline")
                                              ? "bg-rose-100 text-rose-800"
                                              : "bg-amber-100 text-amber-900"
                                    }`}
                                >
                                    {resStatusModalRes.reservationStatus ||
                                        "Pending"}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Select New Status:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            "Pending",
                                            "Approved",
                                            "Declined",
                                        ] as const
                                    ).map((status) => {
                                        const isSelected =
                                            targetResStatus === status;
                                        const colorClass =
                                            status === "Approved"
                                                ? isSelected
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                                : status === "Declined"
                                                  ? isSelected
                                                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                                                      : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                                                  : isSelected
                                                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                                    : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100";

                                        return (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() =>
                                                    setTargetResStatus(status)
                                                }
                                                className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center flex items-center justify-center gap-1.5 ${colorClass}`}
                                            >
                                                {status === "Approved"}
                                                {status === "Declined"}
                                                {status === "Pending"}
                                                <span>{status}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setResStatusModalRes(null)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveResStatus}
                                disabled={isUpdatingResStatus}
                                className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition shadow-sm ${
                                    targetResStatus === "Approved"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : targetResStatus === "Declined"
                                          ? "bg-rose-600 hover:bg-rose-700"
                                          : "bg-amber-600 hover:bg-amber-700"
                                }`}
                            >
                                {isUpdatingResStatus
                                    ? "Saving..."
                                    : `Mark as ${targetResStatus}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT RESERVATION MODAL / PANEL */}
            {editingRes && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
                    onClick={() => setEditingRes(null)}
                >
                    <div
                        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 transform transition-all relative overflow-hidden my-auto max-h-[92vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Purple Header Bar */}
                        <div className="bg-gradient-to-r from-[#591ba5] via-[#6d28d9] to-[#7c3aed] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black tracking-wide text-white">
                                        Edit Reservation Details
                                    </h3>
                                    <p className="text-[11px] text-purple-200">
                                        Update client information &amp; rental
                                        schedule (Vehicle details unchanged)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingRes(null)}
                                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form Content */}
                        <form
                            onSubmit={handleSaveEditForm}
                            className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-sans text-purple"
                        >
                            {/* Confirmation Number Banner */}
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                        Confirmation
                                    </span>
                                    <span className="text-sm font-black text-purple font-mono">
                                        #{editingRes.confirmationNumber}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                        Status
                                    </span>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                        {editingRes.reservationStatus ||
                                            "Pending"}
                                    </span>
                                </div>
                            </div>

                            {/* Client Information Section */}
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100">
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                            value={editForm.lastName}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    lastName: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                            value={editForm.phone}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rental Schedule Section */}
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-900 pb-2 border-b border-slate-100">
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                            Pickup Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.pickupDate}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                            value={editForm.pickupTime}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                        value={editForm.pickupLocation}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                pickupLocation: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                                    <div>
                                        <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                                            Return Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.returnDate}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                            value={editForm.returnTime}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
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
                                        value={editForm.returnLocation}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                returnLocation: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Special Notes Section */}
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                                <label className="block font-bold text-slate-700 text-[11px] uppercase">
                                    Special Notes / Customer Requests
                                </label>
                                <textarea
                                    rows={2}
                                    value={editForm.notes}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple/40 text-xs"
                                    placeholder="Enter additional instructions or customer requests..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingRes(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="px-5 py-2 rounded-xl bg-purple hover:bg-dark-purple text-white font-bold text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <span>
                                        {isSavingEdit
                                            ? "Saving Changes..."
                                            : "Save Changes"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ALERT MODAL */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
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
