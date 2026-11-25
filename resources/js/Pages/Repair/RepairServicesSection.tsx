import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
    ServiceCategory,
    RepairService,
    fetchAllCategories,
    fetchAllServices,
    expandYearsSold,
    PRESET_CATEGORY_ICONS,
} from "@/Services/repairService";
import { formatDriveImageUrl, parseCsv } from "@/Services/vehicleService";
import { fetchAllCoupons, Coupon } from "@/Services/couponService";

const CAR_LIST_CSV_URL =
    "https://docs.google.com/spreadsheets/d/16dhtw1POBIeifrAEk0ZqmH3jV8s20quo9Si3GfebifE/export?format=csv&gid=1307580665";

interface CarListRow {
    carName: string;
    model: string;
    yearsSold: string;
}

function formatPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (!digits) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

type SubMenuTab = "services" | "appointment" | "estimate" | "coupons";

export default function RepairServicesSection() {
    const [activeTab, setActiveTab] = useState<SubMenuTab>("services");
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [services, setServices] = useState<RepairService[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCategoryFilter, setSelectedCategoryFilter] =
        useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Selected services for multi-selection package calculation
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

    // Collapsed category section keys
    const [collapsedCategories, setCollapsedCategories] = useState<
        Record<string, boolean>
    >({});

    // Appointment Form state
    const [appointmentForm, setAppointmentForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        vehicleMakeModel: "",
        vehicleYear: "",
        preferredDate: "",
        preferredTime: "morning",
        notes: "",
    });
    const [appointmentSubmitted, setAppointmentSubmitted] = useState(false);

    // Estimate calculator state
    const [estimateZip, setEstimateZip] = useState("");
    const [estimateSubmitted, setEstimateSubmitted] = useState(false);
    const [estimateSubmitting, setEstimateSubmitting] = useState(false);
    const [estimateError, setEstimateError] = useState<string | null>(null);
    const [estimateRequestId, setEstimateRequestId] = useState<string | null>(
        null,
    );

    // Car List & Estimate Form State
    const [carList, setCarList] = useState<CarListRow[]>([]);
    const [carListLoading, setCarListLoading] = useState(false);
    const [estimateYear, setEstimateYear] = useState("");
    const [estimateMake, setEstimateMake] = useState("");
    const [estimateModel, setEstimateModel] = useState("");
    const [estimateMileage, setEstimateMileage] = useState("");
    const [estimateCategories, setEstimateCategories] = useState<string[]>([]);
    const [estimateOtherChecked, setEstimateOtherChecked] = useState(false);
    const [estimateOtherCategory, setEstimateOtherCategory] = useState("");
    const [estimateDetails, setEstimateDetails] = useState("");
    const [estimateLocation, setEstimateLocation] = useState<
        "WFM Shop" | "Mobile Service"
    >("WFM Shop");
    const [estimateName, setEstimateName] = useState("");
    const [estimateEmail, setEstimateEmail] = useState("");
    const [estimatePhone, setEstimatePhone] = useState("");

    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = (code: string) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).catch(() => {});
        }
        setCopiedCode(code);
        setTimeout(() => {
            setCopiedCode((prev) => (prev === code ? null : prev));
        }, 2000);
    };

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            setLoading(true);
            try {
                const [cats, srvs, cpons] = await Promise.all([
                    fetchAllCategories(),
                    fetchAllServices(),
                    fetchAllCoupons(),
                ]);
                if (isMounted) {
                    setCategories(cats);
                    setServices(srvs);
                    setCoupons(cpons);
                }
            } catch (err) {
                console.error("Failed to load repair services:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch Car List from Google Sheet for Estimate dropdowns
    useEffect(() => {
        let isMounted = true;
        async function loadCarList() {
            try {
                setCarListLoading(true);
                const res = await fetch(CAR_LIST_CSV_URL);
                if (!res.ok) return;
                const text = await res.text();
                const parsed = parseCsv(text);
                if (parsed.length > 1) {
                    const headers = parsed[0].map((h) => h.toLowerCase());
                    const nameIdx = headers.findIndex((h) =>
                        h.includes("car name"),
                    );
                    const modelIdx = headers.findIndex((h) => h === "model");
                    const yearsIdx = headers.findIndex((h) =>
                        h.includes("year"),
                    );

                    const rows: CarListRow[] = [];
                    for (let i = 1; i < parsed.length; i++) {
                        const r = parsed[i];
                        if (!r || r.length === 0) continue;
                        const cName =
                            nameIdx !== -1 ? r[nameIdx]?.trim() || "" : "";
                        const cModel =
                            modelIdx !== -1 ? r[modelIdx]?.trim() || "" : "";
                        if (!cName && !cModel) continue;
                        rows.push({
                            carName: cName,
                            model: cModel,
                            yearsSold:
                                yearsIdx !== -1
                                    ? r[yearsIdx]?.trim() || ""
                                    : "",
                        });
                    }
                    if (isMounted) setCarList(rows);
                }
            } catch (err) {
                console.error("Failed to load Car List:", err);
            } finally {
                if (isMounted) setCarListLoading(false);
            }
        }
        loadCarList();
        return () => {
            isMounted = false;
        };
    }, []);

    const availableMakes = useMemo(() => {
        const set = new Set<string>();
        carList.forEach((r) => {
            if (r.carName) set.add(r.carName);
        });
        return Array.from(set).sort();
    }, [carList]);

    const availableModels = useMemo(() => {
        const set = new Set<string>();
        carList.forEach((r) => {
            if ((!estimateMake || r.carName === estimateMake) && r.model) {
                set.add(r.model);
            }
        });
        return Array.from(set).sort();
    }, [carList, estimateMake]);

    const availableYears = useMemo(() => {
        const set = new Set<string>();
        carList.forEach((r) => {
            if (estimateMake && r.carName !== estimateMake) return;
            if (estimateModel && r.model !== estimateModel) return;
            expandYearsSold(r.yearsSold).forEach((y) => set.add(y));
        });
        return Array.from(set).sort((a, b) => Number(b) - Number(a));
    }, [carList, estimateMake, estimateModel]);

    const toggleEstimateCategory = (catName: string) => {
        setEstimateCategories((prev) =>
            prev.includes(catName)
                ? prev.filter((c) => c !== catName)
                : [...prev, catName],
        );
    };

    const handleEstimateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEstimateError(null);

        if (!estimateYear || !estimateMake || !estimateModel) {
            setEstimateError(
                "Please select Year, Make, and Model for your vehicle.",
            );
            return;
        }

        const selectedServices = [...estimateCategories];
        if (estimateOtherChecked) {
            if (!estimateOtherCategory.trim()) {
                setEstimateError(
                    "Please specify the service category in the Other field.",
                );
                return;
            }
            selectedServices.push(`Other: ${estimateOtherCategory.trim()}`);
        }

        if (selectedServices.length === 0) {
            setEstimateError("Please choose at least one service needed.");
            return;
        }

        if (
            !estimateName.trim() ||
            !estimateEmail.trim() ||
            !estimatePhone.trim()
        ) {
            setEstimateError(
                "Please fill in your Full Name, Email Address, and Phone Number.",
            );
            return;
        }

        const reqId = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
        setEstimateSubmitting(true);

        try {
            const webhookUrl =
                localStorage.getItem("WFM_APPS_SCRIPT_URL") || "";
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || "";

            const res = await fetch("/repair/estimate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    estimateRequestId: reqId,
                    year: estimateYear,
                    make: estimateMake,
                    model: estimateModel,
                    mileage: estimateMileage.trim()
                        ? `${estimateMileage.trim()} miles`
                        : "",
                    servicesNeeded: selectedServices.join(", "),
                    additionalDetails: estimateDetails.trim(),
                    serviceLocation: estimateLocation,
                    fullName: estimateName.trim(),
                    email: estimateEmail.trim(),
                    phone: estimatePhone.trim(),
                    scriptUrl: webhookUrl.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(
                    data?.message || `Server error (${res.status})`,
                );
            }
            setEstimateRequestId(reqId);
            setEstimateSubmitted(true);
        } catch (err) {
            console.error("Failed to submit estimate:", err);
            setEstimateError(
                "Unable to submit your estimate request right now. Please try again.",
            );
        } finally {
            setEstimateSubmitting(false);
        }
    };

    // Filter only ACTIVE coupons and next-month COMING SOON (upcoming) coupons
    const visibleCoupons = useMemo(() => {
        const now = new Date();
        const nextMonthDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1,
        );
        const nextMonthPrefix = `${nextMonthDate.getFullYear()}-${String(
            nextMonthDate.getMonth() + 1,
        ).padStart(2, "0")}`;

        return coupons.filter((cpn) => {
            if (cpn.isActiveToggle === false) return false;
            if (cpn.status === "active") return true;
            if (cpn.status === "upcoming") {
                return cpn.startDate.startsWith(nextMonthPrefix);
            }
            return false;
        });
    }, [coupons]);

    const activeCoupons = useMemo(
        () => visibleCoupons.filter((cpn) => cpn.status === "active"),
        [visibleCoupons],
    );

    const comingSoonCoupons = useMemo(
        () => visibleCoupons.filter((cpn) => cpn.status === "upcoming"),
        [visibleCoupons],
    );

    // Filter only ACTIVE categories and ACTIVE services
    const activeCategories = useMemo(() => {
        return categories.filter(
            (c) => (c.status || "Active").toLowerCase() === "active",
        );
    }, [categories]);

    const activeServices = useMemo(() => {
        return services.filter(
            (s) => (s.status || "Active").toLowerCase() === "active",
        );
    }, [services]);

    // Active Categories that actually have active services
    const categoriesWithActiveServices = useMemo(() => {
        const catNames = new Set(
            activeServices.map((s) => s.category.trim().toLowerCase()),
        );
        return activeCategories.filter((c) =>
            catNames.has(c.name.trim().toLowerCase()),
        );
    }, [activeCategories, activeServices]);

    // Group services by category
    const servicesByCategory = useMemo(() => {
        const map: Record<
            string,
            { categoryObj?: ServiceCategory; items: RepairService[] }
        > = {};

        // Initialize with active categories in order
        categoriesWithActiveServices.forEach((cat) => {
            map[cat.name] = { categoryObj: cat, items: [] };
        });

        // Add services to their categories
        activeServices.forEach((srv) => {
            const trimmedCat = (srv.category || "General").trim();
            // Search case-insensitive match in map
            const matchedKey = Object.keys(map).find(
                (k) => k.toLowerCase() === trimmedCat.toLowerCase(),
            );
            if (matchedKey) {
                map[matchedKey].items.push(srv);
            } else {
                // If not in known active categories list, check if category is active
                const catObj = activeCategories.find(
                    (c) =>
                        c.name.trim().toLowerCase() ===
                        trimmedCat.toLowerCase(),
                );
                if (catObj) {
                    if (!map[catObj.name]) {
                        map[catObj.name] = { categoryObj: catObj, items: [] };
                    }
                    map[catObj.name].items.push(srv);
                }
            }
        });

        return map;
    }, [categoriesWithActiveServices, activeServices, activeCategories]);

    // Filtered categories based on selected category pill and search query
    const filteredGroupEntries = useMemo(() => {
        return Object.entries(servicesByCategory)
            .map(([catName, group]) => {
                // Check Category Filter
                if (
                    selectedCategoryFilter !== "all" &&
                    catName.toLowerCase() !==
                        selectedCategoryFilter.toLowerCase()
                ) {
                    return null;
                }

                // Check Search Query
                const query = searchQuery.trim().toLowerCase();
                const matchedItems = group.items.filter((item) => {
                    if (!query) return true;
                    const inName = item.name.toLowerCase().includes(query);
                    const inDesc = (item.description || "")
                        .toLowerCase()
                        .includes(query);
                    const inCat = item.category.toLowerCase().includes(query);
                    const inInc = item.includes?.some((inc) =>
                        inc.toLowerCase().includes(query),
                    );
                    return inName || inDesc || inCat || inInc;
                });

                if (matchedItems.length === 0) return null;

                return {
                    categoryName: catName,
                    categoryObj: group.categoryObj,
                    items: matchedItems,
                };
            })
            .filter(Boolean) as {
            categoryName: string;
            categoryObj?: ServiceCategory;
            items: RepairService[];
        }[];
    }, [servicesByCategory, selectedCategoryFilter, searchQuery]);

    // Helper to toggle category collapse
    const toggleCollapse = (catName: string, currentlyCollapsed?: boolean) => {
        setCollapsedCategories((prev) => ({
            ...prev,
            [catName]:
                currentlyCollapsed !== undefined
                    ? !currentlyCollapsed
                    : !prev[catName],
        }));
    };

    // Helper to toggle service selection
    const toggleServiceSelection = (srvId: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(srvId)
                ? prev.filter((id) => id !== srvId)
                : [...prev, srvId],
        );
    };

    // Calculate total price of selected services
    const selectedServicesList = useMemo(() => {
        return activeServices.filter((s) => selectedServiceIds.includes(s.id));
    }, [activeServices, selectedServiceIds]);

    const calculatedTotal = useMemo(() => {
        return selectedServicesList.reduce((acc, curr) => {
            const raw =
                typeof curr.price === "number"
                    ? curr.price
                    : parseFloat(String(curr.price).replace(/[^0-9.]/g, ""));
            return acc + (isNaN(raw) ? 0 : raw);
        }, 0);
    }, [selectedServicesList]);

    // Helper to render category icon strictly from sheet
    const renderCategoryIcon = (categoryName: string, iconRaw?: string) => {
        const trimmedName = (categoryName || "").trim();
        let categoryIconData = (iconRaw || "").trim();

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

        if (categoryIconData && PRESET_CATEGORY_ICONS[categoryIconData]) {
            const preset = PRESET_CATEGORY_ICONS[categoryIconData];
            return (
                <div
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${preset.color}`}
                    dangerouslySetInnerHTML={{ __html: preset.svg }}
                />
            );
        }

        if (
            categoryIconData &&
            (categoryIconData.startsWith("<svg") ||
                categoryIconData.includes("<svg"))
        ) {
            return (
                <div
                    className="w-5 h-5 flex items-center justify-center shrink-0 text-slate-700 [&>svg]:w-5 [&>svg]:h-5"
                    dangerouslySetInnerHTML={{ __html: categoryIconData }}
                />
            );
        }

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
                className="w-5 h-5 text-slate-400 shrink-0"
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

    // Submenu Items definitions
    const subMenuItems: {
        id: SubMenuTab;
        label: string;
        icon: React.ReactNode;
    }[] = [
        {
            id: "services",
            label: "Services",
            icon: (
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            ),
        },
        {
            id: "appointment",
            label: "Book Your Appointment",
            icon: (
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            id: "estimate",
            label: "Get An Estimate",
            icon: (
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
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            id: "coupons",
            label: "Coupons & Offers",
            icon: (
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
            ),
        },
    ];

    return (
        <section className="py-8 sm:py-12 md:py-16 bg-slate-50 font-poppins min-h-[700px]">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* 4 SUBMENUS TAB BAR (STICKY NAV STYLE) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-1.5 sm:p-2.5 mb-8 sm:mb-10">
                    <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                        {subMenuItems.map((item) => {
                            const isCurrent = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center justify-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                        isCurrent
                                            ? "bg-dark-purple text-white shadow-md shadow-dark-purple/20 scale-[1.01]"
                                            : "text-slate-600 hover:text-dark-purple hover:bg-slate-100/80"
                                    }`}
                                >
                                    <span
                                        className={
                                            isCurrent
                                                ? "text-vivid-red"
                                                : "text-slate-400"
                                        }
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                    {item.id === "coupons" &&
                                        visibleCoupons.length > 0 && (
                                            <span
                                                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold ${
                                                    isCurrent
                                                        ? "bg-vivid-red text-white"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {visibleCoupons.length}
                                            </span>
                                        )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB 1: SERVICES TAB (Main attached layout) */}
                {activeTab === "services" && (
                    <div className="space-y-8 animate-fade-in">
                        {/* TOP BAR: Search & Category Filter Pills */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 space-y-4 sm:space-y-5">
                            {/* Search bar & quick counter */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="relative flex-1 max-w-lg">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Search services, categories, or keywords..."
                                        className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple transition"
                                    />
                                    <svg
                                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="text-xs text-slate-500 font-medium shrink-0 flex items-center justify-between sm:justify-start gap-2">
                                    <span>
                                        Showing{" "}
                                        <strong className="text-slate-800 font-bold">
                                            {activeServices.length}
                                        </strong>{" "}
                                        Certified Services
                                    </span>
                                </div>
                            </div>

                            {/* CATEGORY FILTER PILLS (Category name with icon + 'All Services' option) */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    Filter By Category:
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* All Categories Option */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategoryFilter("all")
                                        }
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                            selectedCategoryFilter === "all"
                                                ? "bg-dark-purple text-white shadow-sm shadow-dark-purple/20"
                                                : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                                        }`}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h7"
                                            />
                                        </svg>
                                        <span>All Services</span>
                                        <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded-full bg-white/20">
                                            {activeServices.length}
                                        </span>
                                    </button>

                                    {/* Each Category with its Google Sheet icon */}
                                    {categoriesWithActiveServices.map((cat) => {
                                        const isSelected =
                                            selectedCategoryFilter.toLowerCase() ===
                                            cat.name.toLowerCase();
                                        const count = activeServices.filter(
                                            (s) =>
                                                s.category
                                                    .trim()
                                                    .toLowerCase() ===
                                                cat.name.trim().toLowerCase(),
                                        ).length;

                                        return (
                                            <button
                                                key={cat.id || cat.name}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCategoryFilter(
                                                        cat.name,
                                                    )
                                                }
                                                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                                    isSelected
                                                        ? "bg-dark-purple text-white shadow-sm shadow-dark-purple/20"
                                                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                                                }`}
                                            >
                                                <div className="shrink-0">
                                                    {renderCategoryIcon(
                                                        cat.name,
                                                        cat.icon,
                                                    )}
                                                </div>
                                                <span>{cat.name}</span>
                                                <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded-full bg-white/20">
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* BODY CONTENT: COLLAPSIBLE CATEGORIES & SERVICES */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Category Accordions with Services */}
                            <div className="lg:col-span-8 space-y-6">
                                {loading ? (
                                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
                                        <div className="w-10 h-10 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                        <span className="text-sm font-semibold text-slate-600">
                                            Loading services &amp; categories...
                                        </span>
                                    </div>
                                ) : filteredGroupEntries.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
                                        <svg
                                            className="w-12 h-12 text-slate-300 mx-auto mb-3"
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
                                        <h3 className="text-base font-bold text-slate-800">
                                            No Services Found
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            Try adjusting your category filter
                                            or search terms above to find what
                                            you need.
                                        </p>
                                    </div>
                                ) : (
                                    filteredGroupEntries.map((group, index) => {
                                        // By default, only the first category is expanded; all others are collapsed unless toggled by user
                                        const isCollapsed =
                                            collapsedCategories[
                                                group.categoryName
                                            ] !== undefined
                                                ? !!collapsedCategories[
                                                      group.categoryName
                                                  ]
                                                : index !== 0;

                                        return (
                                            <div
                                                key={group.categoryName}
                                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
                                            >
                                                {/* Category Header (Click to collapse/expand) */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleCollapse(
                                                            group.categoryName,
                                                            isCollapsed,
                                                        )
                                                    }
                                                    className="w-full bg-dark-purple text-white px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between transition-colors hover:bg-dark-purple/95 cursor-pointer text-left"
                                                >
                                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-white/15">
                                                            {renderCategoryIcon(
                                                                group.categoryName,
                                                                group
                                                                    .categoryObj
                                                                    ?.icon,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                                                                    {
                                                                        group.categoryName
                                                                    }
                                                                </h2>
                                                                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-purple-200 shrink-0">
                                                                    {
                                                                        group
                                                                            .items
                                                                            .length
                                                                    }{" "}
                                                                    Services
                                                                </span>
                                                            </div>
                                                            {group.categoryObj
                                                                ?.description && (
                                                                <p className="text-[11px] sm:text-xs text-purple-200/80 mt-0.5 line-clamp-1">
                                                                    {
                                                                        group
                                                                            .categoryObj
                                                                            .description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/80 shrink-0">
                                                        <span className="text-xs font-semibold hidden sm:inline">
                                                            {isCollapsed
                                                                ? "Expand"
                                                                : "Collapse"}
                                                        </span>
                                                        <svg
                                                            className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-200 ${
                                                                isCollapsed
                                                                    ? "-rotate-90"
                                                                    : "rotate-0"
                                                            }`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                                d="M19 9l-7 7-7-7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </button>

                                                {/* Services in this category */}
                                                {!isCollapsed && (
                                                    <div className="divide-y divide-slate-100">
                                                        {group.items.map(
                                                            (srv) => {
                                                                const isSelected =
                                                                    selectedServiceIds.includes(
                                                                        srv.id,
                                                                    );
                                                                const priceNumber =
                                                                    typeof srv.price ===
                                                                    "number"
                                                                        ? srv.price
                                                                        : parseFloat(
                                                                              String(
                                                                                  srv.price,
                                                                              ).replace(
                                                                                  /[^0-9.]/g,
                                                                                  "",
                                                                              ),
                                                                          );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            srv.id
                                                                        }
                                                                        className={`p-5 transition-colors ${
                                                                            isSelected
                                                                                ? "bg-purple/5 border-l-4 border-l-vivid-red"
                                                                                : "hover:bg-slate-50/70"
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-row items-start gap-3 sm:gap-4">
                                                                            {/* Checkbox selector for multiple booking */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    toggleServiceSelection(
                                                                                        srv.id,
                                                                                    )
                                                                                }
                                                                                className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border flex items-center justify-center shrink-0 transition cursor-pointer ${
                                                                                    isSelected
                                                                                        ? "bg-vivid-red border-vivid-red text-white shadow-xs"
                                                                                        : "border-slate-300 bg-white hover:border-slate-400"
                                                                                }`}
                                                                                title={
                                                                                    isSelected
                                                                                        ? "Unselect service"
                                                                                        : "Select this service"
                                                                                }
                                                                            >
                                                                                {isSelected && (
                                                                                    <svg
                                                                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        stroke="currentColor"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth={
                                                                                                3
                                                                                            }
                                                                                            d="M5 13l4 4L19 7"
                                                                                        />
                                                                                    </svg>
                                                                                )}
                                                                            </button>

                                                                            {/* Service Image (Desktop / Tablet view: side by side) */}
                                                                            <div className="hidden sm:flex sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 items-center justify-center">
                                                                                {srv.image ? (
                                                                                    <img
                                                                                        src={formatDriveImageUrl(
                                                                                            srv.image,
                                                                                        )}
                                                                                        alt={
                                                                                            srv.name
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
                                                                                    <svg
                                                                                        className="w-8 h-8 text-slate-300"
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

                                                                            {/* Service Details */}
                                                                            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                                                                        {
                                                                                            srv.name
                                                                                        }
                                                                                    </h3>

                                                                                    {/* Price: Starting at text requirement */}
                                                                                    <div className="text-left sm:text-right shrink-0">
                                                                                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                                                            Starting
                                                                                            at
                                                                                        </span>
                                                                                        <span className="text-sm sm:text-lg font-extrabold text-vivid-red">
                                                                                            {!isNaN(
                                                                                                priceNumber,
                                                                                            )
                                                                                                ? `$${priceNumber.toFixed(2)}`
                                                                                                : srv.price}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Labor time badge */}
                                                                                {srv.laborTime && (
                                                                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                                                                        <svg
                                                                                            className="w-3.5 h-3.5 text-slate-500"
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
                                                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                                            />
                                                                                        </svg>
                                                                                        <span>
                                                                                            Labor
                                                                                            Time:{" "}
                                                                                            {
                                                                                                srv.laborTime
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {/* Service Description */}
                                                                                {srv.description && (
                                                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                                                        {
                                                                                            srv.description
                                                                                        }
                                                                                    </p>
                                                                                )}

                                                                                {/* Service Image (Mobile view: rendered under the Service Details) */}
                                                                                <div className="sm:hidden pt-2">
                                                                                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                                                        {srv.image ? (
                                                                                            <img
                                                                                                src={formatDriveImageUrl(
                                                                                                    srv.image,
                                                                                                )}
                                                                                                alt={
                                                                                                    srv.name
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
                                                                                            <svg
                                                                                                className="w-8 h-8 text-slate-300"
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
                                                                                </div>

                                                                                {/* Service Includes */}
                                                                                {srv.includes &&
                                                                                    srv
                                                                                        .includes
                                                                                        .length >
                                                                                        0 && (
                                                                                        <div className="pt-2">
                                                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                                                                Service
                                                                                                Includes:
                                                                                            </span>
                                                                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                                                                {srv.includes.map(
                                                                                                    (
                                                                                                        inc,
                                                                                                        i,
                                                                                                    ) => (
                                                                                                        <li
                                                                                                            key={
                                                                                                                i
                                                                                                            }
                                                                                                            className="flex items-center gap-2 text-xs text-slate-600"
                                                                                                        >
                                                                                                            <svg
                                                                                                                className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                                                                                                                fill="none"
                                                                                                                viewBox="0 0 24 24"
                                                                                                                stroke="currentColor"
                                                                                                            >
                                                                                                                <path
                                                                                                                    strokeLinecap="round"
                                                                                                                    strokeLinejoin="round"
                                                                                                                    strokeWidth={
                                                                                                                        2.5
                                                                                                                    }
                                                                                                                    d="M5 13l4 4L19 7"
                                                                                                                />
                                                                                                            </svg>
                                                                                                            <span className="line-clamp-1">
                                                                                                                {
                                                                                                                    inc
                                                                                                                }
                                                                                                            </span>
                                                                                                        </li>
                                                                                                    ),
                                                                                                )}
                                                                                            </ul>
                                                                                        </div>
                                                                                    )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Right Column: Multi-Service Booking Summary & 3 Action Buttons + Request a Service */}
                            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                                {/* PACKAGE SUMMARY CARD */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center font-bold">
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
                                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Service Package
                                                </h3>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    {
                                                        selectedServicesList.length
                                                    }{" "}
                                                    service
                                                    {selectedServicesList.length ===
                                                    1
                                                        ? ""
                                                        : "s"}{" "}
                                                    selected
                                                </p>
                                            </div>
                                        </div>

                                        {selectedServicesList.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedServiceIds([])
                                                }
                                                className="text-xs text-slate-400 hover:text-rose-600 transition font-medium"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* List of selected items */}
                                    {selectedServicesList.length === 0 ? (
                                        <div className="py-6 text-center text-slate-400 space-y-2">
                                            <svg
                                                className="w-8 h-8 mx-auto text-slate-300"
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
                                            <p className="text-xs">
                                                Select one or more services from
                                                the catalog to calculate your
                                                total.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                            {selectedServicesList.map((srv) => (
                                                <div
                                                    key={srv.id}
                                                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100"
                                                >
                                                    <span className="font-semibold text-slate-800 truncate pr-2">
                                                        {srv.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="font-bold text-dark-purple">
                                                            {typeof srv.price ===
                                                            "number"
                                                                ? `$${srv.price.toFixed(2)}`
                                                                : srv.price}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleServiceSelection(
                                                                    srv.id,
                                                                )
                                                            }
                                                            className="text-slate-400 hover:text-rose-600"
                                                            title="Remove"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Estimated Total */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Estimated Starting Total
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Pre-tax &amp; parts estimate
                                            </span>
                                        </div>
                                        <span className="text-2xl font-extrabold text-vivid-red">
                                            ${calculatedTotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* 3 ACTION BUTTONS REQUIRED: Book this services, get an estimate, view offers */}
                                    <div className="space-y-2.5 pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("appointment")
                                            }
                                            className="w-full py-3 px-4 rounded-xl bg-dark-purple hover:bg-purple text-white text-xs sm:text-sm font-bold shadow-md shadow-dark-purple/20 transition flex items-center justify-center gap-2 cursor-pointer"
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
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Book This Service</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("estimate")
                                            }
                                            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
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
                                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Get An Estimate</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("coupons")
                                            }
                                            className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100/90 text-vivid-red text-xs sm:text-sm font-bold border border-red-200 transition flex items-center justify-center gap-2 cursor-pointer"
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
                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                />
                                            </svg>
                                            <span>
                                                View Offers &amp; Coupons
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* UNDER THAT: Request a service button -> redirects to /contact */}
                                <div className="bg-gradient-to-br from-dark-purple via-purple to-[#170a3d] rounded-3xl p-6 text-white shadow-xl space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-vivid-red">
                                            Custom Inquiries
                                        </span>
                                        <h4 className="text-base font-bold">
                                            Can&apos;t find your exact service?
                                        </h4>
                                        <p className="text-xs text-purple-200/90 leading-relaxed">
                                            Have an unusual repair requirement,
                                            engine diagnostics, or fleet vehicle
                                            inquiry? Talk directly with our
                                            master technicians.
                                        </p>
                                    </div>

                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-vivid-red hover:bg-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-vivid-red/30 transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        <span>Request a Service</span>
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
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: BOOK YOUR APPOINTMENT */}
                {activeTab === "appointment" && (
                    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-8 animate-fade-in">
                        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-vivid-red">
                                    Schedule Visit
                                </span>
                                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                                    Book Your Repair Appointment
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Select your preferred arrival date and tell
                                    us about your vehicle.
                                </p>
                            </div>
                            {selectedServicesList.length > 0 && (
                                <div className="p-3 bg-purple/5 border border-purple/10 rounded-2xl text-xs">
                                    <span className="text-slate-500 block">
                                        Selected Services:
                                    </span>
                                    <span className="font-bold text-dark-purple">
                                        {selectedServicesList.length} items ( $
                                        {calculatedTotal.toFixed(2)})
                                    </span>
                                </div>
                            )}
                        </div>

                        {appointmentSubmitted ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                                    <svg
                                        className="w-8 h-8"
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
                                <h3 className="text-xl font-bold text-slate-900">
                                    Appointment Request Received!
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                                    Thank you,{" "}
                                    <strong>{appointmentForm.fullName}</strong>.
                                    Our service advisor will contact you
                                    promptly to confirm your slot on{" "}
                                    <strong>
                                        {appointmentForm.preferredDate ||
                                            "the selected date"}
                                    </strong>
                                    .
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAppointmentSubmitted(false);
                                        setActiveTab("services");
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark-purple text-white text-xs font-bold hover:bg-purple transition"
                                >
                                    Return to Services Catalog
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setAppointmentSubmitted(true);
                                }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={appointmentForm.fullName}
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    fullName: e.target.value,
                                                })
                                            }
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={appointmentForm.email}
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={appointmentForm.phone}
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            placeholder="(555) 000-0000"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Vehicle Year, Make &amp; Model *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={
                                                appointmentForm.vehicleMakeModel
                                            }
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    vehicleMakeModel:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="2021 Toyota Camry"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Preferred Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={
                                                appointmentForm.preferredDate
                                            }
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    preferredDate:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Preferred Time Slot
                                        </label>
                                        <select
                                            value={
                                                appointmentForm.preferredTime
                                            }
                                            onChange={(e) =>
                                                setAppointmentForm({
                                                    ...appointmentForm,
                                                    preferredTime:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        >
                                            <option value="morning">
                                                Morning (8:00 AM - 12:00 PM)
                                            </option>
                                            <option value="afternoon">
                                                Afternoon (12:00 PM - 4:00 PM)
                                            </option>
                                            <option value="evening">
                                                Late Afternoon (4:00 PM - 6:00
                                                PM)
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Notes or Specific Vehicle Concerns
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={appointmentForm.notes}
                                        onChange={(e) =>
                                            setAppointmentForm({
                                                ...appointmentForm,
                                                notes: e.target.value,
                                            })
                                        }
                                        placeholder="Describe symptoms, strange noises, warning icons, etc..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("services")}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                                    >
                                        &larr; Back to Services
                                    </button>

                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-vivid-red hover:bg-red-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-vivid-red/30 transition cursor-pointer"
                                    >
                                        Confirm Appointment Booking
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* TAB 3: GET AN ESTIMATE */}
                {activeTab === "estimate" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
                        {/* LEFT COLUMN: 4-STEP ESTIMATE FORM */}
                        <form
                            onSubmit={handleEstimateSubmit}
                            className="lg:col-span-2 space-y-5"
                        >
                            {/* 1. VEHICLE INFORMATION */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                                    <svg
                                        className="w-5 h-5 text-white/90 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                        />
                                    </svg>
                                    <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                        1
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold">
                                        Vehicle Information
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Year{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={estimateYear}
                                            onChange={(e) =>
                                                setEstimateYear(e.target.value)
                                            }
                                            disabled={carListLoading}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        >
                                            <option value="">
                                                {carListLoading
                                                    ? "Loading..."
                                                    : "Select Year"}
                                            </option>
                                            {availableYears.map((yr) => (
                                                <option key={yr} value={yr}>
                                                    {yr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Make{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={estimateMake}
                                            onChange={(e) => {
                                                setEstimateMake(e.target.value);
                                                setEstimateModel("");
                                            }}
                                            disabled={carListLoading}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        >
                                            <option value="">
                                                {carListLoading
                                                    ? "Loading..."
                                                    : "Select Make"}
                                            </option>
                                            {availableMakes.map((mk) => (
                                                <option key={mk} value={mk}>
                                                    {mk}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Model{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={estimateModel}
                                            onChange={(e) =>
                                                setEstimateModel(e.target.value)
                                            }
                                            disabled={
                                                carListLoading || !estimateMake
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple disabled:bg-slate-50 disabled:text-slate-400"
                                        >
                                            <option value="">
                                                Select Model
                                            </option>
                                            {availableModels.map((md) => (
                                                <option key={md} value={md}>
                                                    {md}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Mileage (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="e.g., 52,000 miles"
                                            value={estimateMileage}
                                            onChange={(e) =>
                                                setEstimateMileage(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. SERVICE(S) NEEDED */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                                    <svg
                                        className="w-5 h-5 text-white/90 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                        2
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold">
                                        Service(s) Needed{" "}
                                        <span className="text-vivid-red">
                                            *
                                        </span>
                                    </h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    <p className="text-xs font-bold text-slate-800">
                                        Choose one or more services:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {activeCategories.map((cat) => {
                                            const isChecked =
                                                estimateCategories.includes(
                                                    cat.name,
                                                );
                                            const presetIcon =
                                                PRESET_CATEGORY_ICONS[cat.icon];
                                            return (
                                                <label
                                                    key={cat.id}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                                        isChecked
                                                            ? "border-dark-purple bg-dark-purple/5"
                                                            : "border-slate-200 hover:border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() =>
                                                            toggleEstimateCategory(
                                                                cat.name,
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded border-slate-300 text-dark-purple focus:ring-dark-purple"
                                                    />
                                                    <span className="shrink-0">
                                                        {renderCategoryIcon(
                                                            cat.name,
                                                            cat.icon,
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                        {cat.name}
                                                    </span>
                                                </label>
                                            );
                                        })}

                                        {/* Other (Please specify) */}
                                        <label
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                                estimateOtherChecked
                                                    ? "border-dark-purple bg-dark-purple/5"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={estimateOtherChecked}
                                                onChange={(e) =>
                                                    setEstimateOtherChecked(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-slate-300 text-dark-purple focus:ring-dark-purple"
                                            />
                                            <svg
                                                className="w-5 h-5 text-dark-purple shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                                />
                                            </svg>
                                            <span className="text-xs font-bold text-slate-800">
                                                Other (Please specify)
                                            </span>
                                        </label>
                                    </div>

                                    {estimateOtherChecked && (
                                        <div className="pt-2">
                                            <input
                                                type="text"
                                                placeholder="Type your service category name..."
                                                value={estimateOtherCategory}
                                                onChange={(e) =>
                                                    setEstimateOtherCategory(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. ADDITIONAL DETAILS (OPTIONAL) & SERVICE LOCATION */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                                    <svg
                                        className="w-5 h-5 text-white/90 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                    </svg>
                                    <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                        3
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold">
                                        Additional Details (Optional)
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the issue, any symptoms, or specific service you need... (e.g., noise, maintenance, warning light, etc.)"
                                        value={estimateDetails}
                                        onChange={(e) =>
                                            setEstimateDetails(e.target.value)
                                        }
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                    />

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-2">
                                            Service Location{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 max-w-md">
                                            {(
                                                [
                                                    "WFM Shop",
                                                    "Mobile Service",
                                                ] as const
                                            ).map((loc) => (
                                                <button
                                                    key={loc}
                                                    type="button"
                                                    onClick={() =>
                                                        setEstimateLocation(loc)
                                                    }
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                        estimateLocation === loc
                                                            ? "bg-dark-purple text-white border-dark-purple shadow-sm"
                                                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    {loc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. YOUR INFORMATION */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                                    <svg
                                        className="w-5 h-5 text-white/90 shrink-0"
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
                                    <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                        4
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold">
                                        Your Information
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Full Name{" "}
                                                <span className="text-vivid-red">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your name"
                                                value={estimateName}
                                                onChange={(e) =>
                                                    setEstimateName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Email Address{" "}
                                                <span className="text-vivid-red">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={estimateEmail}
                                                onChange={(e) =>
                                                    setEstimateEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Phone Number{" "}
                                                <span className="text-vivid-red">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="(___) ___-____"
                                                value={estimatePhone}
                                                onChange={(e) =>
                                                    setEstimatePhone(
                                                        formatPhoneNumber(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                            />
                                        </div>
                                    </div>

                                    {estimateError && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-vivid-red">
                                            {estimateError}
                                        </div>
                                    )}

                                    {estimateSubmitted ? (
                                        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold space-y-1">
                                            <p>
                                                ✓ Estimate request received!
                                                Your Estimate Request ID is{" "}
                                                <span className="font-mono font-extrabold">
                                                    {estimateRequestId}
                                                </span>
                                                .
                                            </p>
                                            <p className="text-xs text-emerald-700 font-normal">
                                                We&apos;ll review your request
                                                and send a personalized estimate
                                                to your email.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center pt-1">
                                            <button
                                                type="submit"
                                                disabled={estimateSubmitting}
                                                className="w-full sm:w-auto sm:min-w-[300px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-vivid-red hover:bg-red-700 text-white text-sm font-bold transition shadow-md cursor-pointer disabled:opacity-60"
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
                                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                    />
                                                </svg>
                                                {estimateSubmitting
                                                    ? "Submitting..."
                                                    : "Get My Estimate"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* RIGHT COLUMN: HOW IT WORKS, PLEASE NOTE, NEED HELP */}
                        <div className="space-y-5">
                            {/* How It Works */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple/5 border-b border-slate-200 px-5 py-3.5 flex items-center gap-3">
                                    <svg
                                        className="w-6 h-6 text-dark-purple shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-extrabold text-dark-purple">
                                        How It Works
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-dark-purple text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            1
                                        </span>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                            Tell us about your vehicle and the
                                            service you need.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-dark-purple text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            2
                                        </span>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                            We review your request.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-dark-purple text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            3
                                        </span>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                            You&apos;ll receive a personalized
                                            estimate by email (usually within 1
                                            business day).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Please Note */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-dark-purple/5 border-b border-slate-200 px-5 py-3.5 flex items-center gap-3">
                                    <svg
                                        className="w-6 h-6 text-dark-purple shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-extrabold text-dark-purple">
                                        Please Note
                                    </h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <svg
                                            className="w-4 h-4 text-dark-purple shrink-0 mt-0.5"
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
                                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                            This is an estimate, not a final
                                            repair price.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <svg
                                            className="w-4 h-4 text-dark-purple shrink-0 mt-0.5"
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
                                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                            Final pricing may vary after a full
                                            inspection of your vehicle.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help? */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <svg
                                        className="w-7 h-7 text-dark-purple shrink-0 mt-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-dark-purple">
                                            Need Help?
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-600">
                                            Contact us at
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href="tel:+19374754737"
                                    className="block w-full text-center py-2.5 px-4 rounded-xl bg-vivid-red hover:bg-red-700 text-white text-base font-extrabold tracking-wide transition shadow-sm"
                                >
                                    +1937-475-4737
                                </a>

                                <a
                                    href="mailto:contact@wrightfindermotors.com"
                                    className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-dark-purple transition"
                                >
                                    <svg
                                        className="w-4 h-4 text-dark-purple shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>contact@wrightfindermotors.com</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: COUPONS & OFFERS */}
                {activeTab === "coupons" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center mx-auto space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-vivid-red">
                                Exclusive Deals
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                Current Service Coupons &amp; Specials
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Save on scheduled maintenance, brake jobs, fluid
                                flushes, and state inspections. Mention coupon
                                code at check-in.
                            </p>
                        </div>

                        {visibleCoupons.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
                                <p className="text-sm font-semibold text-slate-700">
                                    No active coupons at this time.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Please check back during upcoming holidays
                                    and seasonal promotions.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {activeCoupons.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                                Active Coupons
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {activeCoupons.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {activeCoupons.map((cpn) => {
                                                const isCopied =
                                                    copiedCode === cpn.code;
                                                return (
                                                    <div
                                                        key={cpn.id || cpn.code}
                                                        className="bg-white rounded-3xl border-2 border-dashed border-red-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-vivid-red border border-red-100">
                                                                    {
                                                                        cpn.discountPercent
                                                                    }
                                                                    % OFF
                                                                </span>
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    Active
                                                                </span>
                                                            </div>

                                                            <h4 className="text-base font-bold text-slate-900">
                                                                {cpn.title}
                                                            </h4>

                                                            {cpn.description && (
                                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                                    {
                                                                        cpn.description
                                                                    }
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 pt-1">
                                                                <span>
                                                                    Start:{" "}
                                                                    <span className="text-slate-700">
                                                                        {
                                                                            cpn.startDate
                                                                        }
                                                                    </span>
                                                                </span>
                                                                <span>
                                                                    End:{" "}
                                                                    <span className="text-slate-700">
                                                                        {
                                                                            cpn.endDate
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCopyCode(
                                                                        cpn.code,
                                                                    )
                                                                }
                                                                title="Copy coupon code"
                                                                className="w-full inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-bold text-dark-purple tracking-wider transition cursor-pointer"
                                                            >
                                                                <span>
                                                                    {cpn.code}
                                                                </span>
                                                                <span className="text-[10px] font-sans font-semibold text-slate-500">
                                                                    {isCopied
                                                                        ? "Copied!"
                                                                        : "Copy"}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {comingSoonCoupons.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                                Coming Soon (Next Month)
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                {comingSoonCoupons.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {comingSoonCoupons.map((cpn) => {
                                                const isCopied =
                                                    copiedCode === cpn.code;
                                                return (
                                                    <div
                                                        key={cpn.id || cpn.code}
                                                        className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-vivid-red border border-red-100">
                                                                    {
                                                                        cpn.discountPercent
                                                                    }
                                                                    % OFF
                                                                </span>
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                                                    Coming Soon
                                                                </span>
                                                            </div>

                                                            <h4 className="text-base font-bold text-slate-900">
                                                                {cpn.title}
                                                            </h4>

                                                            {cpn.description && (
                                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                                    {
                                                                        cpn.description
                                                                    }
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 pt-1">
                                                                <span>
                                                                    Start:{" "}
                                                                    <span className="text-slate-700">
                                                                        {
                                                                            cpn.startDate
                                                                        }
                                                                    </span>
                                                                </span>
                                                                <span>
                                                                    End:{" "}
                                                                    <span className="text-slate-700">
                                                                        {
                                                                            cpn.endDate
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCopyCode(
                                                                        cpn.code,
                                                                    )
                                                                }
                                                                title="Copy coupon code"
                                                                className="w-full inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-bold text-dark-purple tracking-wider transition cursor-pointer"
                                                            >
                                                                <span>
                                                                    {cpn.code}
                                                                </span>
                                                                <span className="text-[10px] font-sans font-semibold text-slate-500">
                                                                    {isCopied
                                                                        ? "Copied!"
                                                                        : "Copy"}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
