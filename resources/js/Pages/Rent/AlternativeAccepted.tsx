import React from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";

interface AlternativeAcceptedProps extends PageProps {
    confirmationNumber: string;
    carTitle?: string;
    carId?: string;
    newTotal?: string;
    syncSuccess: boolean;
}

export default function AlternativeAccepted({
    auth,
    confirmationNumber,
    carTitle,
    carId,
    newTotal,
    syncSuccess,
}: AlternativeAcceptedProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head
                title={`Alternative Vehicle Accepted - Reservation #${confirmationNumber} - Wright Finder Motors`}
            />

            {/* Header */}
            <Header user={auth?.user} />

            <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-8 sm:p-12 relative">
                    <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                        Alternative Vehicle Accepted
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#170a3d] mb-3">
                        Vehicle Selected Successfully!
                    </h1>

                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                        Thank you! You have accepted the alternative vehicle for
                        confirmation number{" "}
                        <strong className="text-gray-900 font-mono bg-gray-100 px-2.5 py-1 rounded-md text-sm sm:text-base border border-gray-200">
                            #{confirmationNumber}
                        </strong>
                        .
                    </p>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 text-left mb-8 space-y-2.5">
                        {carTitle && (
                            <div className="flex items-start justify-between border-b border-slate-200/80 pb-2">
                                <span className="font-semibold text-slate-500">
                                    Selected Vehicle:
                                </span>
                                <span className="font-bold text-[#170a3d] text-right">
                                    {carTitle}
                                </span>
                            </div>
                        )}
                        {carId && (
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                <span className="font-semibold text-slate-500">
                                    Stock ID:
                                </span>
                                <span className="font-mono font-bold text-vivid-red">
                                    #{carId}
                                </span>
                            </div>
                        )}
                        {newTotal && (
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                <span className="font-semibold text-slate-500">
                                    Estimated Total:
                                </span>
                                <span className="font-extrabold text-emerald-600 text-sm">
                                    {newTotal.startsWith("$")
                                        ? newTotal
                                        : `$${newTotal}`}
                                </span>
                            </div>
                        )}
                        <p className="pt-2 text-slate-500 text-xs leading-relaxed">
                            Your reservation remains pending until our team
                            finalizes and approves the updated booking. You will
                            receive an approval email as soon as it is
                            confirmed.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-vivid-red hover:bg-red-700 text-white font-bold text-sm shadow-md transition"
                        >
                            Return to Home
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#170a3d] font-bold text-sm transition"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
