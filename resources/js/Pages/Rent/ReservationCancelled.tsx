import React from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";

interface ReservationCancelledProps extends PageProps {
    confirmationNumber: string;
    syncSuccess: boolean;
}

export default function ReservationCancelled({
    auth,
    confirmationNumber,
    syncSuccess,
}: ReservationCancelledProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head
                title={`Reservation #${confirmationNumber} Cancelled - Wright Finder Motors`}
            />

            {/* Header */}
            <Header user={auth?.user} />

            <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-8 sm:p-12 relative">
                    <div className="w-20 h-20 bg-rose-50 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
                        Status: Cancelled
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#170a3d] mb-3">
                        Reservation Request Cancelled
                    </h1>

                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                        Your reservation request for confirmation number{" "}
                        <strong className="text-gray-900 font-mono bg-gray-100 px-2.5 py-1 rounded-md text-sm sm:text-base border border-gray-200">
                            #{confirmationNumber}
                        </strong>{" "}
                        has been marked as <strong>Cancelled</strong>.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-600 text-left mb-8 space-y-2">
                        <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span>
                                No payment will be captured or scheduled for
                                this booking.
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span>
                                View our{" "}
                                <Link
                                    href="/privacy-policy"
                                    className="text-vivid-red font-semibold hover:underline"
                                >
                                    WFM Rental Cancellation Policy
                                </Link>{" "}
                                for additional details.
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/rent"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-vivid-red hover:bg-red-700 text-white font-bold text-sm shadow-md transition"
                        >
                            Browse Other Rental Cars
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#170a3d] font-bold text-sm transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
