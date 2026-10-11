import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Link } from "@inertiajs/react";
import { PropsWithChildren, ReactNode } from "react";

interface GuestLayoutProps extends PropsWithChildren {
    title?: string;
    subtitle?: string;
    badge?: string;
    sideContent?: ReactNode;
}

export default function Guest({
    children,
    title = "Welcome Back",
    subtitle = "Sign in to access your Wright Finder Motors portal",
    badge = "Client & Agent Portal",
}: GuestLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-bggray text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 py-12 md:py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background ambient lighting */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vivid-red/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#170a3d]/25 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-5xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
                        {/* LEFT BRAND PROMO PANEL (5 of 12 columns on desktop) */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-[#170a3d] via-[#12082b] to-[#090214] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
                            {/* Subtle glowing accents */}
                            <div className="absolute -top-16 -right-16 w-60 h-60 bg-vivid-red/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple/30 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                {/* Logo */}
                                <Link href="/" className="inline-block group">
                                    <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-md group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src="/storage/images/logo.webp"
                                            alt="Wright Finder Motors Logo"
                                            className="h-12 w-auto object-contain"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLElement
                                                ).style.display = "none";
                                            }}
                                        />
                                    </div>
                                </Link>

                                <div className="space-y-3">
                                    <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-vivid-red/20 border border-vivid-red/30 text-vivid-red text-[11px] font-black uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-vivid-red animate-pulse" />
                                        <span>{badge}</span>
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                                        Drive Your Ambition With Confidence.
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                        Explore certified vehicles, track your
                                        negotiations, request private viewings,
                                        and manage your garage in one unified
                                        space.
                                    </p>
                                </div>
                            </div>

                            {/* Trust Perks */}
                            <div className="relative z-10 pt-8 mt-6 border-t border-white/10 space-y-3.5">
                                <div className="flex items-center space-x-3 text-xs text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-vivid-red/20 text-vivid-red flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Verified inventory with transparent
                                        title statuses
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-vivid-red/20 text-vivid-red flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Dedicated vehicle agents & rapid support
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-vivid-red/20 text-vivid-red flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Direct phone & test drive scheduling
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT FORM CONTAINER (7 of 12 columns on desktop) */}
                        <div className="lg:col-span-7 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-slate-900/60">
                            <div className="space-y-2 mb-8">
                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-400">
                                    {subtitle}
                                </p>
                            </div>

                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
