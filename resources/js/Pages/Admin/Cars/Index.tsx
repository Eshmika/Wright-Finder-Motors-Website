import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DetailedVehicle, fetchAllVehicles } from "@/Services/vehicleService";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

type SortOption =
    | "recently"
    | "price-low"
    | "price-high"
    | "year-new"
    | "year-old"
    | "mileage-low"
    | "name-asc";

export default function Index() {
    const [vehicles, setVehicles] = useState<DetailedVehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Controls
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOption>("recently");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Load vehicles
    const loadVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllVehicles();
            setVehicles(data);
        } catch (err: any) {
            console.error("Failed to load vehicles:", err);
            setError(
                err?.message || "Failed to load vehicles from Google Sheet",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    // Filter & Sort
    const processedVehicles = useMemo(() => {
        let list = [...vehicles];

        // Search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((v) => {
                const combined =
                    `${v.id} ${v.make} ${v.model} ${v.trim} ${v.year} ${v.bodyStyle} ${v.vin} ${v.titleStatus} ${v.availabilities} ${v.rentOrSell || ""} ${v.exteriorColor} ${v.interiorColor}`.toLowerCase();
                return combined.includes(q);
            });
        }

        // Status filter
        if (statusFilter !== "all") {
            list = list.filter(
                (v) =>
                    (v.availabilities || "").toLowerCase() ===
                    statusFilter.toLowerCase(),
            );
        }

        // Category filter (Rent or Sell)
        if (categoryFilter !== "all") {
            list = list.filter(
                (v) =>
                    (v.rentOrSell || "").toLowerCase() ===
                    categoryFilter.toLowerCase(),
            );
        }

        // Sorting
        switch (sortBy) {
            case "recently":
                // Reverse order so most recently added vehicle is at the top
                list.reverse();
                break;
            case "price-low":
                list.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                list.sort((a, b) => b.price - a.price);
                break;
            case "year-new":
                list.sort((a, b) => b.year - a.year);
                break;
            case "year-old":
                list.sort((a, b) => a.year - b.year);
                break;
            case "mileage-low":
                list.sort((a, b) => {
                    const mA =
                        parseInt(
                            String(a.mileage).replace(/[^0-9]/g, ""),
                            10,
                        ) || 0;
                    const mB =
                        parseInt(
                            String(b.mileage).replace(/[^0-9]/g, ""),
                            10,
                        ) || 0;
                    return mA - mB;
                });
                break;
            case "name-asc":
                list.sort((a, b) =>
                    `${a.make} ${a.model}`.localeCompare(
                        `${b.make} ${b.model}`,
                    ),
                );
                break;
        }

        return list;
    }, [vehicles, searchTerm, sortBy, statusFilter, categoryFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(processedVehicles.length / itemsPerPage) || 1;
    const paginatedVehicles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedVehicles.slice(start, start + itemsPerPage);
    }, [processedVehicles, currentPage]);

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, statusFilter, categoryFilter]);

    // Unique statuses and categories for filter dropdowns
    const availableStatuses = useMemo(() => {
        const set = new Set<string>();
        vehicles.forEach((v) => {
            if (v.availabilities && v.availabilities.trim()) {
                set.add(v.availabilities.trim());
            }
        });
        return Array.from(set);
    }, [vehicles]);

    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        vehicles.forEach((v) => {
            if (v.rentOrSell && v.rentOrSell.trim()) {
                set.add(v.rentOrSell.trim());
            }
        });
        return Array.from(set);
    }, [vehicles]);

    // Print handler (top bar)
    const handlePrint = () => {
        window.print();
    };

    // Share handler (top bar)
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Wright Finder Motors - Vehicle Inventory",
                    text: `Browsing ${vehicles.length} vehicle details from Wright Finder Motors.`,
                    url: window.location.href,
                });
            } catch (err) {
                // Ignore abort
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Inventory page link copied to clipboard!");
        }
    };

    // Helper for formatting price
    const formatCurrency = (val: number) => {
        if (isNaN(val) || val <= 0) return "$0";
        return `$${val.toLocaleString()}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            View All Cars
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time inventory connected to the Google Sheet
                            "Vehicle details" tab.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.cars.create")}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-vivid-red text-white shadow-md hover:bg-red-600 transition"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span>Add New Car</span>
                        </Link>
                        <button
                            type="button"
                            onClick={loadVehicles}
                            disabled={loading}
                            title="Reload from Google Sheets"
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
            <Head title="View All Cars - Wright Finder Motors" />

            <div className="space-y-5">
                {/* Top Action Bar: Sort Dropdown (Left) & Print + Share Buttons (Right) */}
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
                                    <option value="recently">
                                        Recently Added
                                    </option>
                                    <option value="price-low">
                                        Price: Low to High
                                    </option>
                                    <option value="price-high">
                                        Price: High to Low
                                    </option>
                                    <option value="year-new">
                                        Year: Newest First
                                    </option>
                                    <option value="year-old">
                                        Year: Oldest First
                                    </option>
                                    <option value="mileage-low">
                                        Mileage: Lowest First
                                    </option>
                                    <option value="name-asc">
                                        Make / Model (A - Z)
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
                                placeholder="Search inventory..."
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

                        {/* Category filter */}
                        {availableCategories.length > 0 && (
                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                                className="appearance-none px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                            >
                                <option value="all">All Categories</option>
                                {availableCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Status filter */}
                        {availableStatuses.length > 0 && (
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="appearance-none px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                            >
                                <option value="all">All Statuses</option>
                                {availableStatuses.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Right: Print Button and Share Button */}
                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 shadow-sm transition active:scale-95"
                            title="Print inventory table"
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
                            <span>Print</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-purple hover:bg-purple text-white shadow-sm transition active:scale-95"
                            title="Share inventory"
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
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Main Content / Table Section */}
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
                                onClick={loadVehicles}
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
                                    <th className="py-3.5 px-4 min-w-[160px]">
                                        MAKE / MODEL-TRIM
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[110px]">
                                        YEAR / BODY STYLE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[90px]">
                                        MILEAGE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[80px]">
                                        TITLE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[140px]">
                                        TRANSMISSION / ENGINE TYPE-SIZE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[130px]">
                                        DRIVETRAIN / FUEL TYPE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[140px]">
                                        SEATS MATERIAL / INTERIOR COLOR
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[110px]">
                                        EXTERIOR COLOR
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[120px]">
                                        PRICE / DISCOUNT
                                    </th>
                                    <th className="py-3.5 px-3 text-center min-w-[95px]">
                                        STATUS
                                    </th>
                                    <th className="py-3.5 px-3 text-center min-w-[95px]">
                                        CATEGORY
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[140px]">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={14}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-9 h-9 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Fetching vehicle data from
                                                    Google Sheets...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedVehicles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={14}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <svg
                                                    className="w-10 h-10 text-slate-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                    />
                                                </svg>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    No vehicles found
                                                </p>
                                                <p className="text-xs text-slate-400 max-w-xs">
                                                    Try adjusting your search
                                                    criteria or filter options
                                                    above.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedVehicles.map((car, index) => {
                                        const autoIncNo =
                                            (currentPage - 1) * itemsPerPage +
                                            index +
                                            1;
                                        const modelTrim =
                                            [car.model, car.trim]
                                                .filter(Boolean)
                                                .join(" - ") ||
                                            car.model ||
                                            "-";
                                        const engineDisplay =
                                            [car.engine, car.engineTypeSize]
                                                .filter(Boolean)
                                                .join(" - ") ||
                                            car.engineTypeSize ||
                                            car.engine ||
                                            "-";
                                        const discountedPriceVal =
                                            car.discount > 0 &&
                                            car.originalPrice >= car.discount
                                                ? car.originalPrice -
                                                  car.discount
                                                : car.originalPrice > 0
                                                  ? car.originalPrice
                                                  : car.price;

                                        return (
                                            <tr
                                                key={car.id || index}
                                                className="hover:bg-purple/5 transition-colors group"
                                            >
                                                {/* 1. NO: Auto increment number */}
                                                <td className="py-3 px-3 text-center font-bold text-slate-800">
                                                    {autoIncNo}
                                                </td>

                                                {/* 2. IMAGE: Main Image URLs */}
                                                <td className="py-2 px-3 text-center">
                                                    <Link
                                                        href={route(
                                                            "admin.cars.show",
                                                            {
                                                                id: car.id,
                                                            },
                                                        )}
                                                        className="w-14 h-11 mx-auto rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200 cursor-pointer block"
                                                        title="Click to view details panel"
                                                    >
                                                        {car.mainImageUrl ||
                                                        (car.images &&
                                                            car.images[0]) ? (
                                                            <img
                                                                src={
                                                                    car.mainImageUrl ||
                                                                    car
                                                                        .images[0]
                                                                }
                                                                alt={car.title}
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
                                                    </Link>
                                                </td>

                                                {/* 3. MAKE/ MODEL-TRIM: Line 1: Car Name (dark), Line 2: Model (light) */}
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-slate-900 leading-snug">
                                                        {car.make || "-"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                                                        {modelTrim}
                                                    </div>
                                                </td>

                                                {/* 4. YEAR/ BODY STYLE: Line 1: Year (dark), Line 2: Body Style (light) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.year || "-"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {car.bodyStyle || "-"}
                                                    </div>
                                                </td>

                                                {/* 5. MILEAGE: Mileage (dark) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.mileage
                                                            ? `${car.mileage}`
                                                            : "-"}
                                                    </div>
                                                </td>

                                                {/* 6. TITLE: Title (dark) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.titleStatus || "-"}
                                                    </div>
                                                </td>

                                                {/* 7. TRANSMISSION/ ENGINE TYPE-SIZE: Line 1: Transmission (dark), Line 2: Engine Type/Size (light) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.transmission ||
                                                            "-"}
                                                    </div>
                                                    <div
                                                        className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate max-w-[160px]"
                                                        title={engineDisplay}
                                                    >
                                                        {engineDisplay}
                                                    </div>
                                                </td>

                                                {/* 8. DRIVETRAIN/ FUEL TYPE: Line 1: Driveline (dark), Line 2: Fuel Type (light) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.driveline || "-"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {car.fuelType || "-"}
                                                    </div>
                                                </td>

                                                {/* 9. SEATS MATERIAL/ INTERIOR COLOR: Line 1: Seat Material (dark), Line 2: Interior Color (light) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {car.seatMaterial ||
                                                            "-"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {car.interiorColor ||
                                                            "-"}
                                                    </div>
                                                </td>

                                                {/* 10. EXTERIOR COLOR: Exterior Color (dark) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    (
                                                                        car.exteriorColor ||
                                                                        "gray"
                                                                    ).toLowerCase(),
                                                            }}
                                                        />
                                                        <span>
                                                            {car.exteriorColor ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* 11. PRICE/ DISCOUNT: Line 1: Price (dark), Line 2: 'Price'-'Discount' (light) */}
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-slate-900">
                                                        {formatCurrency(
                                                            car.originalPrice ||
                                                                car.price,
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                        {car.discount > 0 ? (
                                                            <span className="text-emerald-600 font-semibold">
                                                                {formatCurrency(
                                                                    discountedPriceVal,
                                                                )}{" "}
                                                                (-
                                                                {formatCurrency(
                                                                    car.discount,
                                                                )}
                                                                )
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {formatCurrency(
                                                                    discountedPriceVal,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 12. STATUS: Status (dark) with subtle tag badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                            (
                                                                car.availabilities ||
                                                                ""
                                                            ).toLowerCase() ===
                                                            "available"
                                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                                : (
                                                                        car.availabilities ||
                                                                        ""
                                                                    ).toLowerCase() ===
                                                                    "sold"
                                                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                                  : (
                                                                          car.availabilities ||
                                                                          ""
                                                                      ).toLowerCase() ===
                                                                      "pending"
                                                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                                        }`}
                                                    >
                                                        {car.availabilities ||
                                                            "-"}
                                                    </span>
                                                </td>

                                                {/* 13. CATEGORY: Rent or Sell (dark) with badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                            (
                                                                car.rentOrSell ||
                                                                ""
                                                            ).toLowerCase() ===
                                                            "rent"
                                                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                                : (
                                                                        car.rentOrSell ||
                                                                        ""
                                                                    ).toLowerCase() ===
                                                                    "sell"
                                                                  ? "bg-purple/10 text-purple border border-purple/20"
                                                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                                                        }`}
                                                    >
                                                        {car.rentOrSell || "-"}
                                                    </span>
                                                </td>

                                                {/* 14. ACTIONS: View, Edit, Delete, Print, Share buttons */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* View button - Opens vehicle details screen panel */}
                                                        <Link
                                                            href={route(
                                                                "admin.cars.show",
                                                                {
                                                                    id: car.id,
                                                                },
                                                            )}
                                                            title="View Vehicle Details Panel"
                                                            aria-label="View Vehicle Details Panel"
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
                                                        </Link>

                                                        {/* Edit button - Opens vehicle edit panel */}
                                                        <Link
                                                            href={route(
                                                                "admin.cars.edit",
                                                                {
                                                                    id: car.id,
                                                                },
                                                            )}
                                                            title="Edit Vehicle Details Panel"
                                                            aria-label="Edit Vehicle Details Panel"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95 inline-flex items-center justify-center"
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

                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            title="Delete"
                                                            aria-label="Delete"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition active:scale-95"
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
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* Print button */}
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handlePrint
                                                            }
                                                            title="Print"
                                                            aria-label="Print"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple hover:bg-slate-100 transition active:scale-95"
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

                                                        {/* Share button */}
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleShare
                                                            }
                                                            title="Share"
                                                            aria-label="Share"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-dark-blue hover:bg-slate-100 transition active:scale-95"
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
                    <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                        <div>
                            Showing{" "}
                            <span className="font-semibold text-slate-900">
                                {processedVehicles.length === 0
                                    ? 0
                                    : (currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-slate-900">
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    processedVehicles.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-900">
                                {processedVehicles.length}
                            </span>{" "}
                            vehicles
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(p - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition"
                                >
                                    Previous
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((pg) => (
                                    <button
                                        key={pg}
                                        type="button"
                                        onClick={() => setCurrentPage(pg)}
                                        className={`w-8 h-8 rounded-lg font-semibold transition ${
                                            currentPage === pg
                                                ? "bg-dark-purple text-white shadow-sm"
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
