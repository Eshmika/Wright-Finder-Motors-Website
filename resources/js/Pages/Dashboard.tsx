import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-black">
                        Dashboard
                    </h2>
                    <p className="text-xs text-black mt-0.5">
                        Wright Finder Motors administrative control center.
                    </p>
                </div>
            }
        >
            <Head title="Dashboard - Wright Finder Motors" />

            <div className="backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-12 shadow-xl min-h-[480px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-vivid-red/10 border border-vivid-red/20 text-vivid-red flex items-center justify-center mb-5 shadow-lg">
                    <svg
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                    Dashboard Panel
                </h3>
                <p className="text-sm text-black max-w-md mb-6 leading-relaxed">
                    This panel is ready for metrics, showroom statistics, sales
                    analysis, and live activity reports.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
