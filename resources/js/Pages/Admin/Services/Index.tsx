import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ServiceCategory,
    RepairService,
    fetchAllCategories,
    fetchAllServices,
    PRESET_CATEGORY_ICONS,
} from "@/Services/repairService";
import { formatDriveImageUrl } from "@/Services/vehicleService";

export default function Index() {
    const [services, setServices] = useState<RepairService[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & search
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for view & delete confirmation
    const [viewService, setViewService] = useState<RepairService | null>(null);
    const [deleteModalService, setDeleteModalService] =
        useState<RepairService | null>(null);
    const [deleteModalCategory, setDeleteModalCategory] =
        useState<ServiceCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackAlert, setFeedbackAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [catList, srvList] = await Promise.all([
                fetchAllCategories(),
                fetchAllServices(),
            ]);
            setCategories(catList);
            setServices(srvList);
        } catch (err) {
            console.error("Failed to load service catalog data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Count services per category
    const categoryCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        services.forEach((s) => {
            const cName = (s.category || "").trim().toLowerCase();
            counts[cName] = (counts[cName] || 0) + 1;
        });
        return counts;
    }, [services]);

    // Filter services list
    const filteredServices = useMemo(() => {
        return services.filter((s) => {
            // Category filter
            if (
                selectedCategoryFilter !== "all" &&
                s.category.toLowerCase() !==
                    selectedCategoryFilter.toLowerCase()
            ) {
                return false;
            }
            // Status filter
            if (
                selectedStatusFilter !== "all" &&
                s.status.toLowerCase() !== selectedStatusFilter.toLowerCase()
            ) {
                return false;
            }
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = s.name.toLowerCase().includes(q);
                const matchCat = s.category.toLowerCase().includes(q);
                const matchDesc = (s.description || "")
                    .toLowerCase()
                    .includes(q);
                if (!matchName && !matchCat && !matchDesc) return false;
            }
            return true;
        });
    }, [services, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

    const handleResetFilters = () => {
        setSelectedCategoryFilter("all");
        setSelectedStatusFilter("all");
        setSearchQuery("");
    };

    // Helper to render category icon strictly from Google Sheet category definition
    const renderCategoryIcon = (categoryName: string, iconRaw?: string) => {
        const trimmedName = (categoryName || "").trim();
        const trimmedIcon = (iconRaw || "").trim();

        // Retrieve the category icon strictly from the Google Sheet category definition
        let categoryIconData = trimmedIcon;
        if (!categoryIconData && trimmedName && categories.length > 0) {
            const matchedCategory = categories.find(
                (c) =>
                    c.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
                    c.id.trim().toLowerCase() === trimmedName.toLowerCase(),
            );
            if (matchedCategory) {
                categoryIconData = (matchedCategory.icon || "").trim();
            }
        }

        // If the category icon in Google Sheet matches a preset key exactly
        if (categoryIconData && PRESET_CATEGORY_ICONS[categoryIconData]) {
            const preset = PRESET_CATEGORY_ICONS[categoryIconData];
            return (
                <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${preset.color}`}
                    dangerouslySetInnerHTML={{ __html: preset.svg }}
                />
            );
        }

        // If the category icon in Google Sheet contains SVG markup
        if (
            categoryIconData &&
            (categoryIconData.startsWith("<svg") ||
                categoryIconData.includes("<svg"))
        ) {
            return (
                <div
                    className="w-6 h-6 flex items-center justify-center shrink-0 text-slate-700 [&>svg]:w-5 [&>svg]:h-5"
                    dangerouslySetInnerHTML={{ __html: categoryIconData }}
                />
            );
        }

        // If the category icon in Google Sheet is an image URL (e.g. Google Drive, direct link)
        if (
            categoryIconData &&
            (categoryIconData.startsWith("http://") ||
                categoryIconData.startsWith("https://"))
        ) {
            return (
                <img
                    src={formatDriveImageUrl(categoryIconData)}
                    alt={categoryName}
                    className="w-5 h-5 object-contain shrink-0"
                />
            );
        }

        return (
            <svg
                className="w-5 h-5 text-slate-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
            </svg>
        );
    };

    // Helper for category badge styling (matches screenshot aesthetic)
    const getCategoryBadgeClass = (categoryName: string) => {
        const lower = categoryName.toLowerCase();
        if (lower.includes("maint"))
            return "bg-[#e8f1ff] text-[#1d4ed8] border-[#bfdbfe]";
        if (lower.includes("brake"))
            return "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]";
        if (lower.includes("tire"))
            return "bg-[#e2f9e8] text-[#15803d] border-[#bbf7d0]";
        if (lower.includes("hvac") || lower.includes("air"))
            return "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]";
        if (lower.includes("elect"))
            return "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]";
        if (lower.includes("diag"))
            return "bg-[#fef3c7] text-[#b45309] border-[#fde68a]";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    // Delete Service Handler
    const handleConfirmDeleteService = async () => {
        if (!deleteModalService) return;
        setIsDeleting(true);
        try {
            const webhookUrl =
                localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";

            const res = await fetch("/admin/services", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    id: deleteModalService.id,
                    name: deleteModalService.name,
                    scriptUrl: webhookUrl.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data?.message || `Server error (${res.status})`,
                );
            }

            setServices((prev) =>
                prev.filter((s) => s.id !== deleteModalService.id),
            );
            setFeedbackAlert({
                type: "success",
                message: `Service "${deleteModalService.name}" has been deleted successfully.`,
            });
        } catch (err: any) {
            console.error("Delete service error:", err);
            setFeedbackAlert({
                type: "error",
                message:
                    err?.message ||
                    "Failed to delete service. Please check your connection.",
            });
        } finally {
            setIsDeleting(false);
            setDeleteModalService(null);
        }
    };

    // Delete Category Handler
    const handleConfirmDeleteCategory = async () => {
        if (!deleteModalCategory) return;
        setIsDeleting(true);
        try {
            const webhookUrl =
                localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";

            const res = await fetch("/admin/categories", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    id: deleteModalCategory.id,
                    name: deleteModalCategory.name,
                    scriptUrl: webhookUrl.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data?.message || `Server error (${res.status})`,
                );
            }

            setCategories((prev) =>
                prev.filter((c) => c.id !== deleteModalCategory.id),
            );
            setFeedbackAlert({
                type: "success",
                message: `Category "${deleteModalCategory.name}" has been deleted successfully.`,
            });
        } catch (err: any) {
            console.error("Delete category error:", err);
            setFeedbackAlert({
                type: "error",
                message:
                    err?.message ||
                    "Failed to delete category. Please check your connection.",
            });
        } finally {
            setIsDeleting(false);
            setDeleteModalCategory(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Services & Categories
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage repair services catalog, category groups,
                            pricing, and labor times.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("admin.services.create")}
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
                            <span>Add New Service</span>
                        </Link>
                        <Link
                            href={route("admin.categories.create")}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-purple text-white shadow-md hover:bg-purple transition"
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
                            <span>Add Category</span>
                        </Link>
                        <button
                            type="button"
                            onClick={loadAllData}
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
            <Head title="Services & Categories - Wright Finder Motors Admin" />

            <div className="space-y-5">
                {/* Feedback Alert Toast */}
                {feedbackAlert && (
                    <div
                        className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm transition animate-fade-in ${
                            feedbackAlert.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span>
                                {feedbackAlert.type === "success" ? "✓" : "⚠"}
                            </span>
                            <span>{feedbackAlert.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFeedbackAlert(null)}
                            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* 1. TOP CONTROLS & FILTER BAR (Matching Cars Admin Panel Style) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Category filter */}
                        <div className="relative">
                            <select
                                value={selectedCategoryFilter}
                                onChange={(e) =>
                                    setSelectedCategoryFilter(e.target.value)
                                }
                                className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
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

                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={selectedStatusFilter}
                                onChange={(e) =>
                                    setSelectedStatusFilter(e.target.value)
                                }
                                className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple cursor-pointer shadow-sm"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search services..."
                                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple placeholder:text-slate-400 shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
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
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 shadow-sm transition active:scale-95"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* 2. REPAIR SERVICE LIST TABLE (Matching Dark-purple Header Table in Cars) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            {/* Table Header: Dark-purple background & white text */}
                            <thead>
                                <tr className="bg-dark-purple text-white text-[11px] font-bold uppercase tracking-wider select-none border-b border-dark-purple">
                                    <th className="py-3.5 px-3 text-center w-12 shrink-0">
                                        NO
                                    </th>
                                    <th className="py-3.5 px-3 text-center w-20 shrink-0">
                                        IMAGE
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[200px]">
                                        SERVICE NAME
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[140px]">
                                        CATEGORY
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[110px]">
                                        PRICE
                                    </th>
                                    <th className="py-3.5 px-3 min-w-[110px]">
                                        LABOR TIME
                                    </th>
                                    <th className="py-3.5 px-3 text-center min-w-[100px]">
                                        STATUS
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[130px]">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-9 h-9 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Fetching services catalog...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredServices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
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
                                                    No services found
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
                                    filteredServices.map((srv, idx) => {
                                        const isActive =
                                            (srv.status || "").toLowerCase() ===
                                            "active";
                                        const rowHighlightClass = isActive
                                            ? "bg-green-50/60 hover:bg-green-100/70 border-l-4 border-l-green-400"
                                            : "hover:bg-purple/5";

                                        return (
                                            <tr
                                                key={srv.id || idx}
                                                className={`transition-colors group ${rowHighlightClass}`}
                                            >
                                                {/* NO */}
                                                <td className="py-3 px-3 text-center font-bold text-slate-800">
                                                    {idx + 1}
                                                </td>

                                                {/* IMAGE */}
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewService(srv)
                                                        }
                                                        className="w-14 h-11 mx-auto rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                                                        title="Click to view details"
                                                    >
                                                        {srv.image ? (
                                                            <img
                                                                src={formatDriveImageUrl(
                                                                    srv.image,
                                                                )}
                                                                alt={srv.name}
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
                                                    </button>
                                                </td>

                                                {/* SERVICE NAME */}
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-slate-900 leading-snug">
                                                        {srv.name}
                                                    </div>
                                                    {srv.description && (
                                                        <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 line-clamp-1">
                                                            {srv.description}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* CATEGORY */}
                                                <td className="py-3 px-3">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                                        {renderCategoryIcon(
                                                            srv.category,
                                                        )}
                                                        <span>
                                                            {srv.category}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* PRICE */}
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-slate-900">
                                                        {typeof srv.price ===
                                                            "number" ||
                                                        (!isNaN(
                                                            Number(srv.price),
                                                        ) &&
                                                            srv.price !== "")
                                                            ? `$${Number(srv.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                            : srv.price ||
                                                              "$0.00"}
                                                    </div>
                                                </td>

                                                {/* LABOR TIME */}
                                                <td className="py-3 px-3 font-medium text-slate-700">
                                                    {srv.laborTime || "30 min"}
                                                </td>

                                                {/* STATUS */}
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                            isActive
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                                        }`}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        <span>
                                                            {srv.status ||
                                                                "Active"}
                                                        </span>
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewService(
                                                                    srv,
                                                                )
                                                            }
                                                            title="View Details"
                                                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
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

                                                        {/* Edit */}
                                                        <Link
                                                            href={route(
                                                                "admin.services.edit",
                                                                { id: srv.id },
                                                            )}
                                                            title="Edit Service"
                                                            className="p-1.5 rounded-lg border border-purple/30 text-purple hover:bg-purple/10 transition shadow-xs"
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
                                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                />
                                                            </svg>
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteModalService(
                                                                    srv,
                                                                )
                                                            }
                                                            title="Delete Service"
                                                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition shadow-xs"
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
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SERVICE CATEGORY TABLE (Matching theme with Dark-purple Header) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="bg-dark-purple text-white px-5 py-3.5 flex items-center justify-between border-b border-dark-purple">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-purple-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                Service Categories ({categories.length})
                            </h3>
                        </div>

                        <Link
                            href={route("admin.categories.create")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition border border-white/20 shadow-xs"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span>Add Category</span>
                        </Link>
                    </div>

                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                            {categories.map((cat) => {
                                const count =
                                    categoryCounts[
                                        cat.name.trim().toLowerCase()
                                    ] || 0;
                                return (
                                    <div
                                        key={cat.id}
                                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-purple/30 hover:shadow-sm transition flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                                                {renderCategoryIcon(
                                                    cat.name,
                                                    cat.icon,
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 text-xs truncate">
                                                    {cat.name}{" "}
                                                    <span className="text-slate-400 font-medium text-[11px]">
                                                        ({count})
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                                    {cat.description ||
                                                        "No description set"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Edit Category */}
                                            <Link
                                                href={route(
                                                    "admin.categories.edit",
                                                    { id: cat.id },
                                                )}
                                                title="Edit Category"
                                                className="p-1.5 rounded-lg border border-slate-200 hover:border-purple/40 text-slate-600 hover:text-purple hover:bg-purple/10 transition shadow-xs"
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
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                    />
                                                </svg>
                                            </Link>

                                            {/* Delete Category */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteModalCategory(cat)
                                                }
                                                title="Delete Category"
                                                className="p-1.5 rounded-lg border border-rose-200 hover:border-rose-400 text-rose-600 hover:bg-rose-50 transition shadow-xs"
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
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* VIEW SERVICE DETAILS MODAL */}
            {viewService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden text-slate-800">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`p-2 rounded-xl border ${getCategoryBadgeClass(viewService.category)}`}
                                >
                                    {renderCategoryIcon(viewService.category)}
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        {viewService.name}
                                    </h3>
                                    <span className="text-xs text-slate-500 font-semibold">
                                        {viewService.category} &bull; Labor:{" "}
                                        {viewService.laborTime}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewService(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Service Image */}
                        {viewService.image ? (
                            <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-52 flex items-center justify-center">
                                <img
                                    src={formatDriveImageUrl(viewService.image)}
                                    alt={viewService.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (
                                            e.currentTarget as HTMLElement
                                        ).style.display = "none";
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="mb-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                                No image uploaded for this service.
                            </div>
                        )}

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="font-semibold text-slate-600">
                                    Price:
                                </span>
                                <span className="font-extrabold text-slate-900 text-sm font-mono">
                                    {typeof viewService.price === "number" ||
                                    (!isNaN(Number(viewService.price)) &&
                                        viewService.price !== "")
                                        ? `$${Number(viewService.price).toFixed(2)}`
                                        : viewService.price}
                                </span>
                            </div>

                            {viewService.description && (
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Service Description
                                    </label>
                                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        {viewService.description}
                                    </p>
                                </div>
                            )}

                            {viewService.includes &&
                                viewService.includes.length > 0 && (
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Service Includes
                                        </label>
                                        <ul className="list-disc pl-5 space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            {viewService.includes.map(
                                                (inc, i) => (
                                                    <li key={i}>{inc}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewService(null)}
                                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE SERVICE WARNING MODAL */}
            {deleteModalService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-3 shadow-inner">
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">
                            Delete Service?
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            Are you sure you want to permanently delete{" "}
                            <strong className="text-slate-900">
                                &quot;{deleteModalService.name}&quot;
                            </strong>
                            ? This action cannot be undone.
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteModalService(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDeleteService}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CATEGORY WARNING MODAL */}
            {deleteModalCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-3 shadow-inner">
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">
                            Delete Category?
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            Are you sure you want to delete the category{" "}
                            <strong className="text-slate-900">
                                &quot;{deleteModalCategory.name}&quot;
                            </strong>
                            ?
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteModalCategory(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDeleteCategory}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
