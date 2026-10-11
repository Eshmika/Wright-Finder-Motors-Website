import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-black">
                        View all Car
                    </h2>
                    <p className="text-xs text-black mt-0.5">
                        Complete inventory management and vehicle overview.
                    </p>
                </div>
            }
        >
            <Head title="View all Car - Wright Finder Motors" />

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
                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                    View All Cars Panel
                </h3>
                <p className="text-sm text-black max-w-md mb-6 leading-relaxed">
                    This panel is ready for your vehicle listing table, filter
                    controls, inventory search, and batch actions.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
