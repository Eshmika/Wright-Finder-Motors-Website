import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Create() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-black">
                        Add new Car
                    </h2>
                    <p className="text-xs text-black mt-0.5">
                        Register a new vehicle into the Wright Finder Motors
                        showroom inventory.
                    </p>
                </div>
            }
        >
            <Head title="Add new Car - Wright Finder Motors" />

            <div className="backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-12 shadow-xl min-h-[480px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 shadow-lg">
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
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                    Add New Car Panel
                </h3>
                <p className="text-sm text-black max-w-md mb-6 leading-relaxed">
                    This panel is ready for vehicle registration forms, image
                    uploads, VIN decoding, and pricing details.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
