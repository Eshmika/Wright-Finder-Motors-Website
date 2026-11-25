import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { parseCsv } from "@/Services/vehicleService";
import {
    ServiceCategory,
    fetchAllCategories,
    fetchAllEstimates,
    expandYearsSold,
} from "@/Services/repairService";

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

const SERVICE_LOCATIONS = ["WFM Shop", "Mobile Service"];

export default function Create() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [carList, setCarList] = useState<CarListRow[]>([]);
    const [carListLoading, setCarListLoading] = useState(true);
    const [existingCount, setExistingCount] = useState(0);

    // Form state
    const [estimateYear, setEstimateYear] = useState("");
    const [estimateMake, setEstimateMake] = useState("");
    const [estimateModel, setEstimateModel] = useState("");
    const [estimateMileage, setEstimateMileage] = useState("");
    const [estimateCategories, setEstimateCategories] = useState<string[]>([]);
    const [estimateOtherChecked, setEstimateOtherChecked] = useState(false);
    const [estimateOtherCategory, setEstimateOtherCategory] = useState("");
    const [estimateDetails, setEstimateDetails] = useState("");
    const [estimateLocation, setEstimateLocation] = useState(
        SERVICE_LOCATIONS[0],
    );
    const [estimateName, setEstimateName] = useState("");
    const [estimateEmail, setEstimateEmail] = useState("");
    const [estimatePhone, setEstimatePhone] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                setCarListLoading(true);
                const [catList, estList, carRes] = await Promise.all([
                    fetchAllCategories(),
                    fetchAllEstimates(),
                    fetch(CAR_LIST_CSV_URL),
                ]);

                if (isMounted) {
                    setCategories(catList);
                    setExistingCount(estList.length);
                }

                if (carRes.ok) {
                    const text = await carRes.text();
                    const parsed = parseCsv(text);
                    if (parsed.length > 1) {
                        const headers = parsed[0].map((h) => h.toLowerCase());
                        const nameIdx = headers.findIndex((h) =>
                            h.includes("car name"),
                        );
                        const modelIdx = headers.findIndex(
                            (h) => h === "model",
                        );
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
                                modelIdx !== -1
                                    ? r[modelIdx]?.trim() || ""
                                    : "";
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
                }
            } catch (err) {
                console.error("Failed to load initial data:", err);
            } finally {
                if (isMounted) setCarListLoading(false);
            }
        };

        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, []);

    const activeCategories = useMemo(() => {
        return categories.filter(
            (c) => (c.status || "Active").toLowerCase() === "active",
        );
    }, [categories]);

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
            if (!estimateMake || r.carName === estimateMake) {
                if (r.model) set.add(r.model);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!estimateYear || !estimateMake || !estimateModel) {
            setFormError(
                "Please select Year, Make, and Model for the vehicle.",
            );
            return;
        }

        const selectedServices = [...estimateCategories];
        if (estimateOtherChecked) {
            if (!estimateOtherCategory.trim()) {
                setFormError("Please specify the service in the Other field.");
                return;
            }
            selectedServices.push(`Other: ${estimateOtherCategory.trim()}`);
        }

        if (selectedServices.length === 0) {
            setFormError("Please select at least one service needed.");
            return;
        }

        if (
            !estimateName.trim() ||
            !estimateEmail.trim() ||
            !estimatePhone.trim()
        ) {
            setFormError(
                "Please fill in Full Name, Email Address, and Phone Number.",
            );
            return;
        }

        setIsSubmitting(true);
        const estimateRequestId = `EST-${1001 + existingCount}`;

        try {
            const res = await axios.post(route("repair.estimate.store"), {
                estimateRequestId,
                year: estimateYear,
                make: estimateMake,
                model: estimateModel,
                mileage: estimateMileage,
                servicesNeeded: selectedServices.join(", "),
                additionalDetails: estimateDetails,
                serviceLocation: estimateLocation,
                fullName: estimateName,
                email: estimateEmail,
                phone: estimatePhone,
                status: "New",
            });

            if (res.data?.success) {
                router.visit(route("admin.estimates.index"));
            } else {
                setFormError(
                    res.data?.message || "Failed to create estimate request.",
                );
            }
        } catch (err: any) {
            setFormError(
                err?.response?.data?.message ||
                    "An error occurred while creating the estimate request.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span>New Estimate Request</span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Google Sheet Sync
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Create a new customer repair estimate request and
                            sync to the &ldquo;Estimate&rdquo; tab.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route("admin.estimates.index")}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-sm bg-white hover:bg-slate-50 border-gray-200 text-slate-700"
                        >
                            <span>&larr; Back to Estimate Requests</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="New Estimate Request - Wright Finder Motors Admin" />

            <div className="mx-auto space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 1. VEHICLE INFORMATION */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
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
                                    <span className="text-vivid-red">*</span>
                                </label>
                                <select
                                    value={estimateYear}
                                    onChange={(e) =>
                                        setEstimateYear(e.target.value)
                                    }
                                    disabled={carListLoading}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                >
                                    <option
                                        value=""
                                        className="text-slate-800 bg-white"
                                    >
                                        {carListLoading
                                            ? "Loading..."
                                            : "Select Year"}
                                    </option>
                                    {availableYears.map((yr) => (
                                        <option
                                            key={yr}
                                            value={yr}
                                            className="text-slate-800 bg-white"
                                        >
                                            {yr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Make{" "}
                                    <span className="text-vivid-red">*</span>
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
                                    <option
                                        value=""
                                        className="text-slate-800 bg-white"
                                    >
                                        {carListLoading
                                            ? "Loading..."
                                            : "Select Make"}
                                    </option>
                                    {availableMakes.map((mk) => (
                                        <option
                                            key={mk}
                                            value={mk}
                                            className="text-slate-800 bg-white"
                                        >
                                            {mk}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Model{" "}
                                    <span className="text-vivid-red">*</span>
                                </label>
                                <select
                                    value={estimateModel}
                                    onChange={(e) =>
                                        setEstimateModel(e.target.value)
                                    }
                                    disabled={carListLoading || !estimateMake}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option
                                        value=""
                                        className="text-slate-800 bg-white"
                                    >
                                        Select Model
                                    </option>
                                    {availableModels.map((md) => (
                                        <option
                                            key={md}
                                            value={md}
                                            className="text-slate-800 bg-white"
                                        >
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
                                        setEstimateMileage(e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. SERVICE(S) NEEDED */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                            <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                2
                            </span>
                            <h3 className="text-sm sm:text-base font-bold">
                                Service(s) Needed{" "}
                                <span className="text-vivid-red">*</span>
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-xs font-bold text-slate-800">
                                Choose one or more services:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {activeCategories.map((cat) => {
                                    const isChecked =
                                        estimateCategories.includes(cat.name);
                                    return (
                                        <label
                                            key={cat.id}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                                                isChecked
                                                    ? "bg-dark-purple/5 border-dark-purple text-dark-purple"
                                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
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
                                                className="rounded border-slate-300 text-dark-purple focus:ring-dark-purple"
                                            />
                                            <span>{cat.name}</span>
                                        </label>
                                    );
                                })}

                                <label
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                                        estimateOtherChecked
                                            ? "bg-dark-purple/5 border-dark-purple text-dark-purple"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
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
                                        className="rounded border-slate-300 text-dark-purple focus:ring-dark-purple"
                                    />
                                    <span>Other</span>
                                </label>
                            </div>

                            {estimateOtherChecked && (
                                <input
                                    type="text"
                                    placeholder="Please specify other service..."
                                    value={estimateOtherCategory}
                                    onChange={(e) =>
                                        setEstimateOtherCategory(e.target.value)
                                    }
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                />
                            )}
                        </div>
                    </div>

                    {/* 3. ADDITIONAL DETAILS & SERVICE LOCATION */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                            <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                3
                            </span>
                            <h3 className="text-sm sm:text-base font-bold">
                                Additional Details &amp; Location
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe symptoms, noises, or specific requests..."
                                    value={estimateDetails}
                                    onChange={(e) =>
                                        setEstimateDetails(e.target.value)
                                    }
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Service Location{" "}
                                    <span className="text-vivid-red">*</span>
                                </label>
                                <select
                                    value={estimateLocation}
                                    onChange={(e) =>
                                        setEstimateLocation(e.target.value)
                                    }
                                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                >
                                    {SERVICE_LOCATIONS.map((loc) => (
                                        <option
                                            key={loc}
                                            value={loc}
                                            className="text-slate-800 bg-white"
                                        >
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 4. CUSTOMER INFORMATION */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-dark-purple px-5 py-3 flex items-center gap-3 text-white">
                            <span className="w-6 h-6 rounded-full bg-white text-dark-purple text-xs font-extrabold flex items-center justify-center shrink-0">
                                4
                            </span>
                            <h3 className="text-sm sm:text-base font-bold">
                                Customer Information
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
                                        required
                                        placeholder="Enter full name"
                                        value={estimateName}
                                        onChange={(e) =>
                                            setEstimateName(e.target.value)
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
                                        required
                                        placeholder="Enter email address"
                                        value={estimateEmail}
                                        onChange={(e) =>
                                            setEstimateEmail(e.target.value)
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
                                        required
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

                            {formError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-vivid-red">
                                    {formError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Link
                                    href={route("admin.estimates.index")}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-dark-purple hover:bg-purple text-white shadow-md shadow-dark-purple/20 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Estimate Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
