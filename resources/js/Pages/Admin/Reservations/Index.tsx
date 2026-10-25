import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    DetailedVehicle,
    fetchAllReservations,
    fetchAllVehicles,
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
    const [paymentFilter, setPaymentFilter] = useState<string>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // View Modal State
    const [selectedRes, setSelectedRes] = useState<ReservationRecord | null>(
        null,
    );

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
        // Rent Price from vehicle details (fallback to car.price or reservation rentalRate)
        const dailyRentRate =
            car && car.rentPrice !== undefined && car.rentPrice > 0
                ? car.rentPrice
                : car
                  ? car.originalPrice || car.price
                  : res.rentalRate || 0;
        const gross = dailyRentRate * days;
        return { days, grossTotal: gross };
    };

    // Filter & Sort Reservations
    const processedReservations = useMemo(() => {
        let list = [...reservations];

        // Search filter
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

        // Payment status filter
        if (paymentFilter !== "all") {
            list = list.filter((r) => {
                const status = (r.paymentStatus || "").toLowerCase();
                if (paymentFilter === "paid") {
                    return (
                        status.includes("paid") || status.includes("received")
                    );
                }
                if (paymentFilter === "pending") {
                    return (
                        status.includes("pending") ||
                        status.includes("no payment")
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
    }, [reservations, searchTerm, sortBy, paymentFilter]);

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
    }, [searchTerm, sortBy, paymentFilter]);

    // Share reservation link
    const handleShareReservation = async (res: ReservationRecord) => {
        const shareUrl = res.carId
            ? `${window.location.origin}/rent/reserve/${encodeURIComponent(res.carId)}`
            : `${window.location.origin}/rent`;
        const title = `Reservation #${res.confirmationNumber} - ${res.carTitle || "Rental Vehicle"}`;
        const text = `Booking Reference #${res.confirmationNumber} for ${res.firstName} ${res.lastName} (${res.pickupDate} to ${res.returnDate}).`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                return;
            } catch (err: any) {
                if (err.name === "AbortError") return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setAlertModal({
                isOpen: true,
                type: "success",
                title: "Reservation Link Copied!",
                message: `Booking page link for Reservation #${res.confirmationNumber} was copied to your clipboard.`,
            });
        } catch {
            window.prompt("Copy link:", shareUrl);
        }
    };

    // Print individual reservation
    const handlePrintReservation = (res: ReservationRecord) => {
        setSelectedRes(res);
        setTimeout(() => {
            window.print();
        }, 200);
    };

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
                            Live reservation records from Google Sheet
                            "Reservation" tab connected with "Vehicle details".
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
                {/* Top Control Bar: Sort, Filter, Search, Print */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Sort By Dropdown & Quick Search */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                                <svg
                                    className="w-4 h-4 text-purple"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                                    />
                                </svg>
                                Sort by:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as SortOption)
                                    }
                                    className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                                >
                                    <option value="newest">
                                        Recently Booked
                                    </option>
                                    <option value="oldest">
                                        Oldest Bookings
                                    </option>
                                    <option value="pickup-soonest">
                                        Pickup: Soonest First
                                    </option>
                                    <option value="total-high">
                                        Total: High to Low
                                    </option>
                                    <option value="total-low">
                                        Total: Low to High
                                    </option>
                                    <option value="name-asc">
                                        Driver Name (A - Z)
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

                        {/* Search Input */}
                        <div className="relative min-w-[200px] sm:min-w-[240px]">
                            <svg
                                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search reservations or cars..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple placeholder:text-slate-400 shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                        {/* Payment Filter */}
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="appearance-none px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                        >
                            <option value="all">All Payment Statuses</option>
                            <option value="pending">Pending Reservation</option>
                            <option value="paid">
                                Payment Received / Paid
                            </option>
                        </select>
                    </div>

                    {/* Right: Print Table */}
                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 shadow-sm transition active:scale-95"
                            title="Print Reservation Table"
                        >
                            <svg
                                className="w-4 h-4 text-purple"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            <span>Print Table</span>
                        </button>
                    </div>
                </div>

                {/* Table Card Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    {/* Error State */}
                    {error && (
                        <div className="p-6 bg-rose-50 border-b border-rose-200 text-rose-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg
                                    className="w-5 h-5 text-rose-500 shrink-0"
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
                                <span className="text-sm font-medium">
                                    {error}
                                </span>
                            </div>
                            <button
                                onClick={loadData}
                                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Table Container with Horizontal Scroll */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1300px]">
                            {/* Table Header: Dark-purple background & white text */}
                            <thead>
                                <tr className="bg-dark-purple text-white text-[11px] font-bold uppercase tracking-wider select-none border-b border-dark-purple">
                                    <th className="py-3.5 px-3 text-center w-12 shrink-0">
                                        NO
                                    </th>
                                    <th className="py-3.5 px-3 text-center w-20 shrink-0">
                                        IMAGE
                                    </th>
                                    <th className="py-3.5 px-3.5 min-w-[170px]">
                                        DATE / TIME PICK UP-RETURN
                                    </th>
                                    <th className="py-3.5 px-3.5 min-w-[170px]">
                                        LOCATION PICK UP-RETURN
                                    </th>
                                    <th className="py-3.5 px-3.5 min-w-[160px]">
                                        MAKE / MODEL-TRIM
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[110px]">
                                        YEAR / BODY STYLE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[130px]">
                                        DRIVETRAIN / FUEL TYPE
                                    </th>
                                    <th className="py-3.5 px-3.5 min-w-[150px]">
                                        TOTAL PRICE / DISCOUNT
                                    </th>
                                    <th className="py-3.5 px-3 text-center min-w-[130px]">
                                        PAYMENT STATUS
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[120px]">
                                        ACTION
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-9 h-9 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Fetching reservations &
                                                    connecting vehicle
                                                    details...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedReservations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <svg
                                                    className="w-12 h-12 text-slate-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                                <p className="text-sm font-semibold text-slate-600">
                                                    No reservations found
                                                </p>
                                                <p className="text-xs text-slate-400 max-w-sm">
                                                    Try adjusting your search
                                                    criteria or filter options
                                                    above.
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

                                        // Make / Model - Trim
                                        const carMake =
                                            car?.make ||
                                            res.carTitle ||
                                            "Wright Finder Vehicle";
                                        const modelTrim =
                                            [car?.model, car?.trim]
                                                .filter(Boolean)
                                                .join(" - ") ||
                                            car?.model ||
                                            res.carId ||
                                            "-";

                                        // Year / Body Style
                                        const carYear =
                                            car?.year ||
                                            (res.carTitle?.match(
                                                /\b(19\d\d|20\d\d)\b/,
                                            )
                                                ? res.carTitle.match(
                                                      /\b(19\d\d|20\d\d)\b/,
                                                  )![0]
                                                : "-");
                                        const bodyStyle = car?.bodyStyle || "-";

                                        // Drivetrain / Fuel Type
                                        const driveline = car?.driveline || "-";
                                        const fuelType = car?.fuelType || "-";

                                        // Total Price / Discount
                                        const { days, grossTotal } =
                                            calculateGrossTotal(res);
                                        const estimatedTotalVal =
                                            res.estimatedTotal > 0
                                                ? res.estimatedTotal
                                                : grossTotal;

                                        // Payment Status styling
                                        const statusLower = (
                                            res.paymentStatus || ""
                                        ).toLowerCase();
                                        const isPaid =
                                            statusLower.includes("paid") ||
                                            statusLower.includes("received");

                                        return (
                                            <tr
                                                key={
                                                    res.confirmationNumber ||
                                                    index
                                                }
                                                className="transition-colors group hover:bg-purple/5"
                                            >
                                                {/* 1. NO: Auto increment number */}
                                                <td className="py-3 px-3 text-center font-bold text-slate-800">
                                                    {autoIncNo}
                                                </td>

                                                {/* 2. IMAGE: relevant car Main Image URLs */}
                                                <td className="py-2 px-3 text-center">
                                                    <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mx-auto flex items-center justify-center shrink-0">
                                                        {mainImage ? (
                                                            <img
                                                                src={mainImage}
                                                                alt={carMake}
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
                                                            <svg
                                                                className="w-5 h-5 text-slate-300"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 3. DATE/ TIME PICK UP-RETURN: Line 1 dark (Pickup), Line 2 light (Return) */}
                                                <td className="py-3 px-3.5">
                                                    <div className="font-semibold text-slate-900 leading-snug flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                                                        <span>
                                                            {res.pickupDate ||
                                                                "N/A"}{" "}
                                                            {res.pickupTime
                                                                ? `• ${res.pickupTime}`
                                                                : ""}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 flex items-center gap-1.5 pl-3">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block shrink-0" />
                                                        <span>
                                                            {res.returnDate ||
                                                                "N/A"}{" "}
                                                            {res.returnTime
                                                                ? `• ${res.returnTime}`
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 4. LOCATION PICK UP-RETURN: Line 1 dark (Pickup Loc), Line 2 light (Return Loc) */}
                                                <td className="py-3 px-3.5">
                                                    <div
                                                        className="font-semibold text-slate-900 leading-snug truncate max-w-[200px]"
                                                        title={
                                                            res.pickupLocation
                                                        }
                                                    >
                                                        {res.pickupLocation ||
                                                            "Wright Finder Motors"}
                                                    </div>
                                                    <div
                                                        className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate max-w-[200px]"
                                                        title={
                                                            res.returnLocation
                                                        }
                                                    >
                                                        {res.returnLocation ||
                                                            res.pickupLocation ||
                                                            "-"}
                                                    </div>
                                                </td>

                                                {/* 5. MAKE/ MODEL-TRIM: Line 1 dark (Car Name), Line 2 light (Model-Trim) */}
                                                <td className="py-3 px-3.5">
                                                    <div className="font-semibold text-slate-900 leading-snug">
                                                        {carMake}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                                                        {modelTrim}
                                                    </div>
                                                </td>

                                                {/* 6. YEAR/ BODY STYLE: Line 1 dark (Year), Line 2 light (Body Style) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {carYear}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {bodyStyle}
                                                    </div>
                                                </td>

                                                {/* 7. DRIVETRAIN/ FUEL TYPE: Line 1 dark (Driveline), Line 2 light (Fuel Type) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {driveline}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {fuelType}
                                                    </div>
                                                </td>

                                                {/* 8. TOTAL PRICE/ DISCOUNT: Line 1 dark (Gross rate * days), Line 2 light (Estimated Total) */}
                                                <td className="py-3 px-3.5">
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        <span>
                                                            {formatCurrency(
                                                                grossTotal,
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-normal">
                                                            ({days}{" "}
                                                            {days === 1
                                                                ? "day"
                                                                : "days"}
                                                            )
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] leading-tight mt-0.5">
                                                        <span className="text-emerald-600 font-semibold">
                                                            Est:{" "}
                                                            {formatCurrency(
                                                                estimatedTotalVal,
                                                            )}
                                                        </span>
                                                        {grossTotal >
                                                            estimatedTotalVal && (
                                                            <span className="text-slate-400 ml-1 line-through">
                                                                {formatCurrency(
                                                                    grossTotal,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 9. PAYMENT STATUS: Line 1 dark status with badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                            isPaid
                                                                ? "bg-green-500 text-white"
                                                                : "bg-amber-100 text-amber-900 border border-amber-200"
                                                        }`}
                                                    >
                                                        {res.paymentStatus ||
                                                            "Pending"}
                                                    </span>
                                                </td>

                                                {/* 10. ACTION BUTTONS: Icon only */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* View Details Modal Icon */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedRes(
                                                                    res,
                                                                )
                                                            }
                                                            title="View Reservation Details"
                                                            aria-label="View Reservation Details"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-dark-purple bg-slate-50 border border-slate-200 transition active:scale-95 shadow-sm inline-flex items-center justify-center"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* Edit Vehicle in Admin (if Car ID connected) */}
                                                        {res.carId && (
                                                            <Link
                                                                href={`${route("admin.cars.edit", { id: res.carId })}?from=rent`}
                                                                title="Edit Connected Vehicle"
                                                                aria-label="Edit Connected Vehicle"
                                                                className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-blue-600 bg-slate-50 border border-slate-200 transition active:scale-95 shadow-sm inline-flex items-center justify-center"
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
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </Link>
                                                        )}

                                                        {/* Print Reservation Icon */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handlePrintReservation(
                                                                    res,
                                                                )
                                                            }
                                                            title="Print Reservation Voucher"
                                                            aria-label="Print Reservation Voucher"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-purple bg-slate-50 border border-slate-200 transition active:scale-95 shadow-sm inline-flex items-center justify-center"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* Share Icon */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleShareReservation(
                                                                    res,
                                                                )
                                                            }
                                                            title="Share Reservation Link"
                                                            aria-label="Share Reservation Link"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-purple bg-slate-50 border border-slate-200 transition active:scale-95 shadow-sm inline-flex items-center justify-center"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                                />
                                                            </svg>
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

            {/* DETAIL MODAL FOR RESERVATION */}
            {selectedRes && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedRes(null)}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 transform transition-all relative overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Accent */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dark-purple via-purple to-vivid-red" />

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold uppercase bg-dark-purple text-white px-2.5 py-0.5 rounded-full">
                                        #{selectedRes.confirmationNumber}
                                    </span>
                                    <span
                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            (selectedRes.paymentStatus || "")
                                                .toLowerCase()
                                                .includes("paid")
                                                ? "bg-green-500 text-white"
                                                : "bg-amber-100 text-amber-900 border border-amber-200"
                                        }`}
                                    >
                                        {selectedRes.paymentStatus ||
                                            "Pending Reservation"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mt-1">
                                    {selectedRes.carTitle ||
                                        (selectedRes.vehicle
                                            ? `${selectedRes.vehicle.make} ${selectedRes.vehicle.model}`
                                            : "Vehicle Rental")}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Recorded on:{" "}
                                    {selectedRes.timestamp || "Recent"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRes(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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

                        {/* Customer & Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Primary Driver */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                                    Primary Driver
                                </h4>
                                <div className="font-bold text-slate-900 text-sm">
                                    {selectedRes.firstName}{" "}
                                    {selectedRes.lastName}
                                </div>
                                <p className="text-slate-600">
                                    <span className="font-semibold text-slate-700">
                                        Email:
                                    </span>{" "}
                                    <a
                                        href={`mailto:${selectedRes.email}`}
                                        className="text-vivid-red hover:underline"
                                    >
                                        {selectedRes.email}
                                    </a>
                                </p>
                                <p className="text-slate-600">
                                    <span className="font-semibold text-slate-700">
                                        Phone:
                                    </span>{" "}
                                    <a
                                        href={`tel:${selectedRes.phone}`}
                                        className="text-dark-purple hover:underline"
                                    >
                                        {selectedRes.phone || "N/A"}
                                    </a>
                                </p>
                                <p className="text-slate-600">
                                    <span className="font-semibold text-slate-700">
                                        Age Qualification:
                                    </span>{" "}
                                    {selectedRes.age || "25+"}
                                </p>
                                <p className="text-slate-600">
                                    <span className="font-semibold text-slate-700">
                                        Residency:
                                    </span>{" "}
                                    {selectedRes.residency || "United States"}
                                </p>
                            </div>

                            {/* Schedule & Rate */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                                    Rental Itinerary & Payment
                                </h4>
                                <p className="text-slate-700">
                                    <span className="font-semibold">
                                        Pickup:
                                    </span>{" "}
                                    {selectedRes.pickupDate} (
                                    {selectedRes.pickupTime})
                                </p>
                                <p
                                    className="text-slate-600 text-[11px] truncate"
                                    title={selectedRes.pickupLocation}
                                >
                                    📍 {selectedRes.pickupLocation}
                                </p>
                                <p className="text-slate-700 mt-1">
                                    <span className="font-semibold">
                                        Return:
                                    </span>{" "}
                                    {selectedRes.returnDate} (
                                    {selectedRes.returnTime})
                                </p>
                                <p
                                    className="text-slate-600 text-[11px] truncate"
                                    title={selectedRes.returnLocation}
                                >
                                    📍{" "}
                                    {selectedRes.returnLocation ||
                                        selectedRes.pickupLocation}
                                </p>
                                <p className="text-slate-700 pt-1 border-t border-slate-200">
                                    <span className="font-semibold">
                                        Payment Option:
                                    </span>{" "}
                                    {selectedRes.paymentOption || "In Person"}
                                </p>
                                <div className="text-base font-extrabold text-emerald-600">
                                    Total:{" "}
                                    {formatCurrency(
                                        selectedRes.estimatedTotal ||
                                            selectedRes.rentalRate ||
                                            0,
                                    )}
                                    {selectedRes.discount > 0 && (
                                        <span className="text-xs text-slate-400 font-normal ml-1">
                                            (Savings:{" "}
                                            {formatCurrency(
                                                selectedRes.discount,
                                            )}
                                            )
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Special Notes if available */}
                        {selectedRes.notes && (
                            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                                <h4 className="font-bold text-amber-900 text-[11px] mb-1">
                                    Special Notes / Customer Requests
                                </h4>
                                <p className="text-slate-700 whitespace-pre-wrap">
                                    {selectedRes.notes}
                                </p>
                            </div>
                        )}

                        {/* Connected Vehicle Spec Sheet Preview */}
                        {selectedRes.vehicle && (
                            <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-14 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                        {selectedRes.vehicle.mainImageUrl ? (
                                            <img
                                                src={
                                                    selectedRes.vehicle
                                                        .mainImageUrl
                                                }
                                                alt={selectedRes.vehicle.make}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                🚗
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="font-bold text-sm truncate">
                                            {selectedRes.vehicle.make}{" "}
                                            {selectedRes.vehicle.model} (
                                            {selectedRes.vehicle.year})
                                        </h5>
                                        <p className="text-[11px] text-slate-400 truncate">
                                            Stock #{selectedRes.vehicle.id} •{" "}
                                            {selectedRes.vehicle.transmission ||
                                                "Automatic"}{" "}
                                            •{" "}
                                            {selectedRes.vehicle.driveline ||
                                                "FWD"}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`${route("admin.cars.show", { id: selectedRes.vehicle.id })}?from=rent`}
                                    className="px-3.5 py-1.5 rounded-xl bg-vivid-red text-white text-xs font-bold hover:bg-red-600 transition shadow shrink-0"
                                >
                                    Car Details
                                </Link>
                            </div>
                        )}

                        {/* Modal Footer Buttons */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() =>
                                    handlePrintReservation(selectedRes)
                                }
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition"
                            >
                                Print Voucher
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRes(null)}
                                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                            >
                                Close
                            </button>
                        </div>
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
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
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
