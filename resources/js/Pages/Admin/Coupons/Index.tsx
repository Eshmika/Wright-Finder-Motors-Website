import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Coupon,
    calculateCouponStatus,
    fetchAllCoupons,
    getAllAutoCoupons,
} from "@/Services/couponService";
import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export default function CouponsIndex() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 12;

    // Google Apps Script Webhook URL from localStorage
    const [scriptWebhookUrl, setScriptWebhookUrl] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";
        }
        return "";
    });

    const [isSavingToSheet, setIsSavingToSheet] = useState<boolean>(false);
    const [syncMessage, setSyncMessage] = useState<{
        type: "success" | "error" | "info";
        text: string;
    } | null>(null);

    // Modal state for Add / Edit Coupon
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formCode, setFormCode] = useState<string>("");
    const [formTitle, setFormTitle] = useState<string>("");
    const [formCategory, setFormCategory] = useState<
        "monthly" | "major_holiday" | "observance" | "custom"
    >("custom");
    const [formDiscount, setFormDiscount] = useState<number>(15);
    const [formStartDate, setFormStartDate] = useState<string>("");
    const [formEndDate, setFormEndDate] = useState<string>("");
    const [formActiveToggle, setFormActiveToggle] = useState<boolean>(true);
    const [formDescription, setFormDescription] = useState<string>("");
    const [formError, setFormError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        loadAllCoupons();
    }, []);

    async function loadAllCoupons() {
        setLoading(true);
        try {
            const list = await fetchAllCoupons();
            setCoupons(list);
        } catch (e) {
            console.error("Failed to load coupons:", e);
            setCoupons(getAllAutoCoupons());
        } finally {
            setLoading(false);
        }
    }

    // Save webhook URL
    const handleSaveWebhookUrl = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("WFM_APPS_SCRIPT_URL", scriptWebhookUrl.trim());
        setSyncMessage({
            type: "info",
            text: "Webhook URL saved locally. You can now sync coupons to your Google Sheet.",
        });
        setTimeout(() => setSyncMessage(null), 4000);
    };

    // Sync all currently visible/configured coupons to Google Sheet "Coupons" tab via Apps Script
    const handleSyncToGoogleSheet = async () => {
        if (!scriptWebhookUrl.trim()) {
            setSyncMessage({
                type: "error",
                text: "Please enter your Google Apps Script Webhook URL above first.",
            });
            return;
        }

        setIsSavingToSheet(true);
        setSyncMessage({
            type: "info",
            text: "Syncing coupons to Google Sheet 'Coupons' tab...",
        });

        try {
            const payload = {
                action: "sync_coupons",
                coupons: coupons.map((c) => ({
                    id: c.id,
                    code: c.code,
                    title: c.title,
                    category: c.category,
                    discountPercent: c.discountPercent,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    status: c.isActiveToggle ? c.status : "inactive",
                    description: c.description || "",
                })),
            };

            const response = await fetch(scriptWebhookUrl.trim(), {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status === "success" || result.status === "ok") {
                setSyncMessage({
                    type: "success",
                    text: `Successfully synced ${coupons.length} coupons to Google Sheet tab "Coupons"!`,
                });
            } else {
                setSyncMessage({
                    type: "error",
                    text:
                        result.message ||
                        "Failed to sync coupons to Google Sheet.",
                });
            }
        } catch (err: any) {
            console.error("Sync error:", err);
            setSyncMessage({
                type: "error",
                text: `Could not reach Apps Script webhook: ${err.message || err}`,
            });
        } finally {
            setIsSavingToSheet(false);
            setTimeout(() => setSyncMessage(null), 6000);
        }
    };

    // Toggle Active/Inactive state of a coupon
    const handleToggleStatus = async (coupon: Coupon) => {
        const updated = coupons.map((c) => {
            if (c.code === coupon.code) {
                const nextToggle = !c.isActiveToggle;
                return {
                    ...c,
                    isActiveToggle: nextToggle,
                    status: calculateCouponStatus(
                        c.startDate,
                        c.endDate,
                        nextToggle,
                    ),
                };
            }
            return c;
        });
        setCoupons(updated);

        // If Webhook configured, push update in background
        if (scriptWebhookUrl.trim()) {
            try {
                fetch(scriptWebhookUrl.trim(), {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "save_coupon",
                        coupon: {
                            ...coupon,
                            isActiveToggle: !coupon.isActiveToggle,
                            status: !coupon.isActiveToggle
                                ? calculateCouponStatus(
                                      coupon.startDate,
                                      coupon.endDate,
                                      true,
                                  )
                                : "inactive",
                        },
                    }),
                });
            } catch (e) {
                console.error("Background sync toggle failed:", e);
            }
        }
    };

    // Open Modal for Add
    const handleOpenCreateModal = () => {
        setEditingCoupon(null);
        setFormCode("");
        setFormTitle("");
        setFormCategory("custom");
        setFormDiscount(15);
        const todayStr = new Date().toISOString().split("T")[0];
        setFormStartDate(todayStr);
        const plus20 = new Date();
        plus20.setDate(plus20.getDate() + 20);
        setFormEndDate(plus20.toISOString().split("T")[0]);
        setFormActiveToggle(true);
        setFormDescription("");
        setFormError(null);
        setModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormCode(coupon.code);
        setFormTitle(coupon.title);
        setFormCategory(coupon.category);
        setFormDiscount(coupon.discountPercent);
        setFormStartDate(coupon.startDate);
        setFormEndDate(coupon.endDate);
        setFormActiveToggle(coupon.isActiveToggle ?? true);
        setFormDescription(coupon.description || "");
        setFormError(null);
        setModalOpen(true);
    };

    // Submit Modal Form (Add or Edit)
    const handleSaveCouponForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const cleanCode = formCode
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");
        if (!cleanCode) {
            setFormError(
                "Coupon code is required and must contain letters and numbers.",
            );
            return;
        }
        if (!formTitle.trim()) {
            setFormError("Coupon title/offer name is required.");
            return;
        }
        if (!formStartDate || !formEndDate) {
            setFormError("Both start date and expiration date are required.");
            return;
        }
        if (formEndDate < formStartDate) {
            setFormError("Expiration date cannot be earlier than start date.");
            return;
        }
        if (formDiscount <= 0 || formDiscount > 90) {
            setFormError("Discount percentage must be between 1% and 90%.");
            return;
        }

        const calculatedStatus = calculateCouponStatus(
            formStartDate,
            formEndDate,
            formActiveToggle,
        );

        const savedCoupon: Coupon = {
            id: editingCoupon ? editingCoupon.id : `custom-${Date.now()}`,
            code: cleanCode,
            title: formTitle.trim(),
            category: formCategory,
            discountPercent: Number(formDiscount),
            startDate: formStartDate,
            endDate: formEndDate,
            status: calculatedStatus,
            isActiveToggle: formActiveToggle,
            description: formDescription.trim(),
            isAutoGenerated: editingCoupon
                ? editingCoupon.isAutoGenerated
                : false,
        };

        if (editingCoupon) {
            setCoupons((prev) =>
                prev.map((c) =>
                    c.code === editingCoupon.code ? savedCoupon : c,
                ),
            );
        } else {
            // Check for duplicate code
            if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
                setFormError(`Coupon code "${cleanCode}" already exists.`);
                return;
            }
            setCoupons((prev) => [savedCoupon, ...prev]);
        }

        setModalOpen(false);

        // Optionally send to webhook
        if (scriptWebhookUrl.trim()) {
            try {
                fetch(scriptWebhookUrl.trim(), {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "save_coupon",
                        coupon: savedCoupon,
                    }),
                });
            } catch (err) {
                console.error("Save coupon webhook error:", err);
            }
        }
    };

    // Delete custom coupon
    const handleDeleteCoupon = (coupon: Coupon) => {
        if (
            !window.confirm(
                `Are you sure you want to delete coupon ${coupon.code}?`,
            )
        ) {
            return;
        }
        setCoupons((prev) => prev.filter((c) => c.code !== coupon.code));

        if (scriptWebhookUrl.trim()) {
            try {
                fetch(scriptWebhookUrl.trim(), {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "delete_coupon",
                        code: coupon.code,
                        id: coupon.id,
                    }),
                });
            } catch (e) {
                console.error("Delete webhook failed:", e);
            }
        }
    };

    // Filter & Sort
    const filteredCoupons = useMemo(() => {
        return coupons.filter((c) => {
            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchCode = c.code.toLowerCase().includes(q);
                const matchTitle = c.title.toLowerCase().includes(q);
                const matchDesc = (c.description || "")
                    .toLowerCase()
                    .includes(q);
                if (!matchCode && !matchTitle && !matchDesc) return false;
            }

            // Category filter
            if (selectedCategory !== "all" && c.category !== selectedCategory) {
                return false;
            }

            // Status filter
            if (selectedStatus !== "all") {
                if (selectedStatus === "inactive" && c.isActiveToggle !== false)
                    return false;
                if (
                    selectedStatus !== "inactive" &&
                    c.status !== selectedStatus
                )
                    return false;
            }

            // Year filter (based on start date)
            if (selectedYear) {
                const cYear = parseInt(c.startDate.slice(0, 4), 10);
                if (cYear !== selectedYear) return false;
            }

            return true;
        });
    }, [coupons, searchQuery, selectedCategory, selectedStatus, selectedYear]);

    // Pagination
    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;
    const paginatedCoupons = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCoupons.slice(start, start + itemsPerPage);
    }, [filteredCoupons, currentPage]);

    // Statistics counts
    const activeCount = coupons.filter(
        (c) => c.status === "active" && c.isActiveToggle !== false,
    ).length;
    const upcomingCount = coupons.filter(
        (c) => c.status === "upcoming" && c.isActiveToggle !== false,
    ).length;
    const expiredCount = coupons.filter(
        (c) => c.status === "expired" || c.isActiveToggle === false,
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="Coupons &amp; Offers Management - Wright Finder Motors" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-poppins">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dark-blue via-[#1f1747] to-dark-purple p-6 rounded-2xl text-white shadow-xl border border-white/10">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
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
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <span>USA Calendar Offers &amp; Discounts</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Coupons &amp; Offers Management
                        </h1>
                        <p className="text-sm text-gray-300 mt-1 max-w-2xl">
                            Automatically generates all eligible monthly (10%
                            OFF), major U.S. holidays (25% OFF), and observances
                            (15% OFF) with 20-day validity, synced directly with
                            Google Sheet &ldquo;Coupons&rdquo; tab.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold transition shadow-lg shadow-vivid-red/30 active:scale-95"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span>Create Custom Coupon</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSyncToGoogleSheet}
                            disabled={isSavingToSheet}
                            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                                isSavingToSheet
                                    ? "bg-emerald-700/60 text-white/80 cursor-wait"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 ${isSavingToSheet ? "animate-spin" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span>
                                {isSavingToSheet
                                    ? "Syncing..."
                                    : "Sync to Google Sheet"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Sync Notification Banner */}
                {syncMessage && (
                    <div
                        className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                            syncMessage.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : syncMessage.type === "error"
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                    >
                        <span>{syncMessage.text}</span>
                        <button
                            type="button"
                            onClick={() => setSyncMessage(null)}
                            className="font-bold underline ml-2"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                            Total Configured
                        </span>
                        <span className="text-2xl font-black text-dark-blue">
                            {coupons.length}
                        </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            Currently Active
                        </span>
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-2xl font-black text-emerald-700">
                                {activeCount}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                            Upcoming (Coming Soon)
                        </span>
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-2xl font-black text-amber-600">
                                {upcomingCount}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                            Expired / Inactive
                        </span>
                        <span className="text-2xl font-black text-gray-500">
                            {expiredCount}
                        </span>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search Input */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                                Search Code or Title
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="e.g. WFMOCT, Thanksgiving..."
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red focus:border-vivid-red"
                            />
                        </div>

                        {/* Year Selector */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                                Calendar Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red focus:border-vivid-red"
                            >
                                <option value={2025}>2025 Calendar</option>
                                <option value={2026}>
                                    2026 Calendar (Current)
                                </option>
                                <option value={2027}>2027 Calendar</option>
                                <option value={2028}>2028 Calendar</option>
                            </select>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                                Offer Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red focus:border-vivid-red"
                            >
                                <option value="all">All Categories</option>
                                <option value="monthly">
                                    Monthly Coupons (10% OFF)
                                </option>
                                <option value="major_holiday">
                                    Major U.S. Holidays (25% OFF)
                                </option>
                                <option value="observance">
                                    Observances &amp; Others (15% OFF)
                                </option>
                                <option value="custom">Custom Offers</option>
                            </select>
                        </div>

                        {/* Status Selector */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                                Status Filter
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red focus:border-vivid-red"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">
                                    Active (Valid Now)
                                </option>
                                <option value="upcoming">
                                    Upcoming (Coming Soon)
                                </option>
                                <option value="expired">Expired</option>
                                <option value="inactive">
                                    Disabled / Inactive
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Coupon Code</th>
                                    <th className="py-3 px-4">Offer Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Discount</th>
                                    <th className="py-3 px-4">
                                        Valid Window (USA EST)
                                    </th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Active Toggle</th>
                                    <th className="py-3 px-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-400 font-semibold"
                                        >
                                            Loading coupons from USA Calendar
                                            &amp; Google Sheet...
                                        </td>
                                    </tr>
                                ) : paginatedCoupons.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-400 font-semibold"
                                        >
                                            No coupons found matching your
                                            selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCoupons.map((coupon) => {
                                        const isLive =
                                            coupon.status === "active" &&
                                            coupon.isActiveToggle !== false;
                                        const isUpcoming =
                                            coupon.status === "upcoming" &&
                                            coupon.isActiveToggle !== false;
                                        const isInactive =
                                            coupon.isActiveToggle === false;
                                        const isExpired =
                                            coupon.status === "expired" &&
                                            !isInactive;

                                        return (
                                            <tr
                                                key={coupon.code}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                {/* Code with Copy Button */}
                                                <td className="py-3 px-4 font-mono font-bold text-dark-blue">
                                                    <div className="inline-flex items-center space-x-1.5 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                        <span>
                                                            {coupon.code}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            title="Copy code"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    coupon.code,
                                                                );
                                                                alert(
                                                                    `Copied "${coupon.code}" to clipboard!`,
                                                                );
                                                            }}
                                                            className="text-gray-400 hover:text-vivid-red"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Title */}
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-gray-900">
                                                        {coupon.title}
                                                    </div>
                                                    {coupon.description && (
                                                        <div className="text-[11px] text-gray-400 line-clamp-1">
                                                            {coupon.description}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Category */}
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                                            coupon.category ===
                                                            "major_holiday"
                                                                ? "bg-red-50 text-vivid-red border border-red-200"
                                                                : coupon.category ===
                                                                    "observance"
                                                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                                  : coupon.category ===
                                                                      "monthly"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                                        }`}
                                                    >
                                                        {coupon.category.replace(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Discount % */}
                                                <td className="py-3 px-4">
                                                    <span className="font-extrabold text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                        {coupon.discountPercent}
                                                        % OFF
                                                    </span>
                                                </td>

                                                {/* Date Window */}
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                                                    <div>
                                                        From:{" "}
                                                        <span className="font-bold text-gray-800">
                                                            {coupon.startDate}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        To:{" "}
                                                        <span className="font-bold text-gray-800">
                                                            {coupon.endDate}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-sans">
                                                        (20 days total)
                                                    </span>
                                                </td>

                                                {/* Status Pill */}
                                                <td className="py-3 px-4">
                                                    {isLive && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span>
                                                                Active Now
                                                            </span>
                                                        </span>
                                                    )}
                                                    {isUpcoming && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            <span>
                                                                Coming Soon
                                                            </span>
                                                        </span>
                                                    )}
                                                    {isExpired && (
                                                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                                                            Expired
                                                        </span>
                                                    )}
                                                    {isInactive && (
                                                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Active Switch Toggle */}
                                                <td className="py-3 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                coupon,
                                                            )
                                                        }
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                            coupon.isActiveToggle !==
                                                            false
                                                                ? "bg-emerald-500"
                                                                : "bg-gray-300"
                                                        }`}
                                                        title="Toggle Active/Inactive"
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                                                coupon.isActiveToggle !==
                                                                false
                                                                    ? "translate-x-4"
                                                                    : "translate-x-0"
                                                            }`}
                                                        />
                                                    </button>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenEditModal(
                                                                coupon,
                                                            )
                                                        }
                                                        title="Edit Coupon"
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-dark-blue hover:text-white text-gray-700 transition"
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
                                                    </button>

                                                    {!coupon.isAutoGenerated && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteCoupon(
                                                                    coupon,
                                                                )
                                                            }
                                                            title="Delete Custom Coupon"
                                                            className="p-1.5 rounded-lg bg-red-50 hover:bg-vivid-red hover:text-white text-vivid-red transition"
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-600">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredCoupons.length,
                                )}{" "}
                                of {filteredCoupons.length} coupons
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    className="px-2.5 py-1 rounded bg-white border border-gray-300 disabled:opacity-40"
                                >
                                    &larr; Prev
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((pg) => (
                                    <button
                                        key={pg}
                                        type="button"
                                        onClick={() => setCurrentPage(pg)}
                                        className={`w-7 h-7 rounded font-bold ${
                                            currentPage === pg
                                                ? "bg-vivid-red text-white"
                                                : "bg-white border border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    className="px-2.5 py-1 rounded bg-white border border-gray-300 disabled:opacity-40"
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Coupon Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative font-poppins">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <h3 className="text-lg font-bold text-dark-blue">
                                {editingCoupon
                                    ? `Edit Coupon: ${editingCoupon.code}`
                                    : "Create Custom Coupon"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                {formError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSaveCouponForm}
                            className="space-y-4 text-xs"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formCode}
                                        onChange={(e) =>
                                            setFormCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g. WFMSUMMER25"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono font-bold uppercase focus:ring-2 focus:ring-vivid-red"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">
                                        Discount % *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={90}
                                        value={formDiscount}
                                        onChange={(e) =>
                                            setFormDiscount(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold focus:ring-2 focus:ring-vivid-red"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">
                                    Offer Title *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) =>
                                        setFormTitle(e.target.value)
                                    }
                                    placeholder="e.g. Summer VIP Special"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">
                                    Category
                                </label>
                                <select
                                    value={formCategory}
                                    onChange={(e) =>
                                        setFormCategory(e.target.value as any)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red"
                                >
                                    <option value="custom">Custom Offer</option>
                                    <option value="monthly">
                                        Monthly Offer (10%)
                                    </option>
                                    <option value="major_holiday">
                                        Major Holiday (25%)
                                    </option>
                                    <option value="observance">
                                        Observance (15%)
                                    </option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formStartDate}
                                        onChange={(e) =>
                                            setFormStartDate(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">
                                        Expiration Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formEndDate}
                                        onChange={(e) =>
                                            setFormEndDate(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">
                                    Description / Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={formDescription}
                                    onChange={(e) =>
                                        setFormDescription(e.target.value)
                                    }
                                    placeholder="Optional notes regarding vehicle classes or terms..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vivid-red"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="formActiveCheck"
                                    checked={formActiveToggle}
                                    onChange={(e) =>
                                        setFormActiveToggle(e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-vivid-red focus:ring-vivid-red"
                                />
                                <label
                                    htmlFor="formActiveCheck"
                                    className="text-gray-700 font-bold"
                                >
                                    Enable this coupon immediately (Active
                                    status)
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-vivid-red hover:bg-red-600 text-white font-bold shadow-md"
                                >
                                    {editingCoupon
                                        ? "Save Changes"
                                        : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
