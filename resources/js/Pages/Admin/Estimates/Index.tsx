import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import {
    EstimateRequest,
    RepairService,
    fetchAllEstimates,
    fetchAllServices,
} from "@/Services/repairService";

const STATUS_OPTIONS = [
    "New",
    "In Review",
    "Estimate Sent",
    "Accepted",
    "Declined",
    "Cancelled",
];

const STATUS_BADGE_STYLES: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    "in review": "bg-amber-50 text-amber-700 border-amber-200",
    "estimate sent": "bg-purple/10 text-purple border-purple/20",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    declined: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

const SERVICE_LOCATIONS = [
    "Main Service Center - Willoughby, OH",
    "Mobile / On-Site Inspection",
];

export default function Index() {
    const [estimates, setEstimates] = useState<EstimateRequest[]>([]);
    const [services, setServices] = useState<RepairService[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
    const [selectedDateFilter, setSelectedDateFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [viewEstimate, setViewEstimate] = useState<EstimateRequest | null>(
        null,
    );
    const [editEstimate, setEditEstimate] = useState<EstimateRequest | null>(
        null,
    );
    const [showNewModal, setShowNewModal] = useState(false);

    // New Estimate Form State (matching TAB 3: GET AN ESTIMATE)
    const [formYear, setFormYear] = useState("");
    const [formMake, setFormMake] = useState("");
    const [formModel, setFormModel] = useState("");
    const [formMileage, setFormMileage] = useState("");
    const [formServicesNeeded, setFormServicesNeeded] = useState("");
    const [formAdditionalDetails, setFormAdditionalDetails] = useState("");
    const [formServiceLocation, setFormServiceLocation] = useState(
        SERVICE_LOCATIONS[0],
    );
    const [formFullName, setFormFullName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackAlert, setFeedbackAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [estList, srvList] = await Promise.all([
                fetchAllEstimates(),
                fetchAllServices(),
            ]);
            setEstimates(estList);
            setServices(srvList);
        } catch (err) {
            console.error("Failed to load estimate requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredEstimates = useMemo(() => {
        return estimates.filter((est) => {
            if (
                selectedStatusFilter !== "all" &&
                (est.status || "New").toLowerCase() !==
                    selectedStatusFilter.toLowerCase()
            ) {
                return false;
            }
            if (selectedDateFilter) {
                const ts = (est.timestamp || "").toLowerCase();
                if (!ts.includes(selectedDateFilter.toLowerCase())) {
                    const parsed = new Date(est.timestamp);
                    if (isNaN(parsed.getTime())) return false;
                    const iso = parsed.toISOString().slice(0, 10);
                    if (iso !== selectedDateFilter) return false;
                }
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchId = (est.id || "").toLowerCase().includes(q);
                const matchName = (est.fullName || "")
                    .toLowerCase()
                    .includes(q);
                const matchPhone = (est.phone || "").toLowerCase().includes(q);
                const matchVehicle = `${est.year} ${est.make} ${est.model}`
                    .toLowerCase()
                    .includes(q);
                const matchService = (est.servicesNeeded || "")
                    .toLowerCase()
                    .includes(q);
                if (
                    !matchId &&
                    !matchName &&
                    !matchPhone &&
                    !matchVehicle &&
                    !matchService
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [estimates, selectedStatusFilter, selectedDateFilter, searchQuery]);

    const handleResetFilters = () => {
        setSelectedStatusFilter("all");
        setSelectedDateFilter("");
        setSearchQuery("");
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatusFilter, selectedDateFilter, searchQuery]);

    const totalPages = Math.ceil(filteredEstimates.length / itemsPerPage);
    const paginatedEstimates = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEstimates.slice(start, start + itemsPerPage);
    }, [filteredEstimates, currentPage]);

    const resetNewForm = () => {
        setFormYear("");
        setFormMake("");
        setFormModel("");
        setFormMileage("");
        setFormServicesNeeded("");
        setFormAdditionalDetails("");
        setFormServiceLocation(SERVICE_LOCATIONS[0]);
        setFormFullName("");
        setFormEmail("");
        setFormPhone("");
    };

    const handleCreateEstimate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedbackAlert(null);

        const nextNum = 1001 + estimates.length;
        const estimateRequestId = `EST-${nextNum}`;

        try {
            const res = await axios.post(route("repair.estimate.store"), {
                estimateRequestId,
                year: formYear,
                make: formMake,
                model: formModel,
                mileage: formMileage,
                servicesNeeded: formServicesNeeded,
                additionalDetails: formAdditionalDetails,
                serviceLocation: formServiceLocation,
                fullName: formFullName,
                email: formEmail,
                phone: formPhone,
                status: "New",
            });

            if (res.data?.success) {
                setFeedbackAlert({
                    type: "success",
                    message: `Estimate request ${estimateRequestId} created successfully.`,
                });
                setShowNewModal(false);
                resetNewForm();
                await loadData();
            } else {
                setFeedbackAlert({
                    type: "error",
                    message:
                        res.data?.message ||
                        "Failed to create estimate request.",
                });
            }
        } catch (err: any) {
            setFeedbackAlert({
                type: "error",
                message:
                    err?.response?.data?.message ||
                    "An error occurred while creating the estimate request.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editEstimate) return;
        setEstimates((prev) =>
            prev.map((item) =>
                item.id === editEstimate.id ? editEstimate : item,
            ),
        );
        setFeedbackAlert({
            type: "success",
            message: `Estimate request ${editEstimate.id} updated.`,
        });
        setEditEstimate(null);
    };

    const getStatusBadgeClass = (status: string) => {
        const key = (status || "New").trim().toLowerCase();
        return (
            STATUS_BADGE_STYLES[key] ||
            "bg-slate-100 text-slate-700 border-slate-200"
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-slate-900">
                        Repair &ndash; Estimate Requests
                    </h2>
                </div>
            }
        >
            <Head title="Estimate Requests" />

            <div className="space-y-5">
                {feedbackAlert && (
                    <div
                        className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                            feedbackAlert.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-red-50 border-red-200 text-red-800"
                        }`}
                    >
                        <span>{feedbackAlert.message}</span>
                        <button
                            type="button"
                            onClick={() => setFeedbackAlert(null)}
                            className="ml-4 text-current opacity-70 hover:opacity-100"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Top Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-dark-purple text-white flex items-center justify-center shadow-md shadow-dark-purple/20 shrink-0">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                                Estimate Requests
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                View, review, create estimates, and manage
                                customer requests.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route("admin.estimates.create")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-purple hover:bg-purple text-white text-xs font-bold shadow-md shadow-dark-purple/20 transition active:scale-95 cursor-pointer"
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
                                strokeWidth={2.5}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span>New Estimate Request</span>
                    </Link>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedStatusFilter}
                            onChange={(e) =>
                                setSelectedStatusFilter(e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="w-full md:w-48">
                        <input
                            type="date"
                            value={selectedDateFilter}
                            onChange={(e) =>
                                setSelectedDateFilter(e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                            aria-label="Filter by date"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 relative">
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
                            placeholder="Search by customer, vehicle, or request #"
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
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

                    {/* Reset Button */}
                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80 shadow-sm transition active:scale-95 cursor-pointer"
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

                {/* Estimate Requests Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="bg-dark-purple px-5 py-3 border-b border-dark-purple flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">
                            Estimate Requests ({filteredEstimates.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-dark-purple/95 text-white text-[11px] font-bold uppercase tracking-wider select-none border-b border-dark-purple">
                                    <th className="py-3.5 px-4 min-w-[110px]">
                                        Request #
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[160px]">
                                        Customer
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[150px]">
                                        Vehicle
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[180px]">
                                        Request Service
                                    </th>
                                    <th className="py-3.5 px-4 min-w-[140px]">
                                        Date
                                    </th>
                                    <th className="py-3.5 px-3 text-center min-w-[130px]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-4 text-center min-w-[120px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-9 h-9 border-3 border-dark-purple/30 border-t-dark-purple rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Fetching estimate
                                                    requests...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEstimates.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-16 text-center text-slate-400"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    No estimate requests found
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
                                    paginatedEstimates.map((est, idx) => (
                                        <tr
                                            key={est.id || idx}
                                            className="hover:bg-purple/5 transition-colors"
                                        >
                                            <td className="py-3.5 px-4 font-bold text-purple whitespace-nowrap">
                                                {est.id}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-900 leading-snug">
                                                    {est.fullName}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    {est.phone}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-900 leading-snug">
                                                    {est.year} {est.make}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    {est.model}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                                                {est.servicesNeeded}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                                {est.timestamp
                                                    ? est.timestamp.split(
                                                          " ",
                                                      )[0]
                                                    : ""}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(est.status)}`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    <span>
                                                        {est.status || "New"}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditEstimate({
                                                                ...est,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple hover:text-white text-slate-600 transition cursor-pointer"
                                                        title="Edit"
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
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewEstimate(est)
                                                        }
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-dark-purple hover:text-white text-slate-600 transition cursor-pointer"
                                                        title="View"
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
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                        <div>
                            Showing{" "}
                            <span className="font-semibold text-slate-900">
                                {filteredEstimates.length === 0
                                    ? 0
                                    : (currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-slate-900">
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredEstimates.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-900">
                                {filteredEstimates.length}
                            </span>{" "}
                            estimate requests
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
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition cursor-pointer"
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
                                        className={`w-8 h-8 rounded-lg font-semibold transition cursor-pointer ${
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
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Estimate Request Modal (TAB 3: GET AN ESTIMATE form) */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-dark-purple px-5 py-4 flex items-center justify-between text-white sticky top-0 z-10">
                            <h3 className="text-sm font-bold">
                                New Estimate Request
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowNewModal(false)}
                                className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateEstimate}
                            className="p-5 space-y-5"
                        >
                            {/* 1. Vehicle Information */}
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple mb-3">
                                    1. Vehicle Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Year{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 2020"
                                            value={formYear}
                                            onChange={(e) =>
                                                setFormYear(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Make{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Honda"
                                            value={formMake}
                                            onChange={(e) =>
                                                setFormMake(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Model{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Accord"
                                            value={formModel}
                                            onChange={(e) =>
                                                setFormModel(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Mileage
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 65,000"
                                            value={formMileage}
                                            onChange={(e) =>
                                                setFormMileage(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Services Needed */}
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple mb-3">
                                    2. Services Needed
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Services Needed{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            list="admin-services-list"
                                            placeholder="e.g. Brake Service, Oil Change"
                                            value={formServicesNeeded}
                                            onChange={(e) =>
                                                setFormServicesNeeded(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                        <datalist id="admin-services-list">
                                            {services.map((s) => (
                                                <option
                                                    key={s.id}
                                                    value={s.name}
                                                />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Additional Details
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Describe symptoms, noises, or specific requests..."
                                            value={formAdditionalDetails}
                                            onChange={(e) =>
                                                setFormAdditionalDetails(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Service Location */}
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple mb-3">
                                    3. Service Location
                                </h4>
                                <select
                                    required
                                    value={formServiceLocation}
                                    onChange={(e) =>
                                        setFormServiceLocation(e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                >
                                    {SERVICE_LOCATIONS.map((loc) => (
                                        <option key={loc} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 4. Customer Contact */}
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple mb-3">
                                    4. Customer Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Full Name{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Miller"
                                            value={formFullName}
                                            onChange={(e) =>
                                                setFormFullName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Email{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={formEmail}
                                            onChange={(e) =>
                                                setFormEmail(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Phone{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="(440) 555-0199"
                                            value={formPhone}
                                            onChange={(e) =>
                                                setFormPhone(e.target.value)
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-dark-purple hover:bg-purple text-white shadow-md shadow-dark-purple/20 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Estimate Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Estimate Modal */}
            {viewEstimate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="bg-dark-purple px-5 py-4 flex items-center justify-between text-white">
                            <h3 className="text-sm font-bold">
                                Estimate Request &ndash; {viewEstimate.id}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setViewEstimate(null)}
                                className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Customer
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {viewEstimate.fullName}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Phone
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {viewEstimate.phone}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Email
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {viewEstimate.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Status
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border mt-0.5 ${getStatusBadgeClass(viewEstimate.status)}`}
                                    >
                                        {viewEstimate.status || "New"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Vehicle
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {viewEstimate.year} {viewEstimate.make}{" "}
                                        {viewEstimate.model}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Mileage
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {viewEstimate.mileage || "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block">
                                    Requested Service(s)
                                </span>
                                <span className="font-semibold text-slate-900">
                                    {viewEstimate.servicesNeeded}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block">
                                    Service Location
                                </span>
                                <span className="font-semibold text-slate-800">
                                    {viewEstimate.serviceLocation}
                                </span>
                            </div>
                            {viewEstimate.additionalDetails && (
                                <div>
                                    <span className="text-slate-400 font-semibold block">
                                        Additional Details
                                    </span>
                                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        {viewEstimate.additionalDetails}
                                    </p>
                                </div>
                            )}
                            <div>
                                <span className="text-slate-400 font-semibold block">
                                    Submitted Date
                                </span>
                                <span className="font-semibold text-slate-800">
                                    {viewEstimate.timestamp}
                                </span>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewEstimate(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-purple text-white hover:bg-purple transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Estimate Modal */}
            {editEstimate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
                        <div className="bg-dark-purple px-5 py-4 flex items-center justify-between text-white">
                            <h3 className="text-sm font-bold">
                                Edit Estimate &ndash; {editEstimate.id}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditEstimate(null)}
                                className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                        <form
                            onSubmit={handleSaveEdit}
                            className="p-5 space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editEstimate.status}
                                    onChange={(e) =>
                                        setEditEstimate({
                                            ...editEstimate,
                                            status: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                >
                                    {STATUS_OPTIONS.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Requested Service(s)
                                </label>
                                <input
                                    type="text"
                                    value={editEstimate.servicesNeeded}
                                    onChange={(e) =>
                                        setEditEstimate({
                                            ...editEstimate,
                                            servicesNeeded: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditEstimate(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-purple hover:bg-purple text-white transition cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
