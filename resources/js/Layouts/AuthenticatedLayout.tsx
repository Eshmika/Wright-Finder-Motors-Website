import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useState } from "react";

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { url } = usePage();

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Active route checks
    const isDashboard = url === "/dashboard" || route().current("dashboard");
    const isCarsIndex =
        url === "/admin/cars" ||
        route().current("admin.cars.index") ||
        route().current("admin.cars.show");
    const isCarsCreate =
        url === "/admin/cars/create" || route().current("admin.cars.create");
    const isRentIndex =
        url === "/admin/rent-cars" || route().current("admin.rent.index");
    const isProfile =
        url.startsWith("/profile") || route().current("profile.edit");

    return (
        <div className="h-screen w-screen bg-bggray font-poppins text-slate-100 flex flex-col overflow-hidden antialiased selection:bg-vivid-red selection:text-white">
            {/* Top Red Header (Fixed at top, never scrolls) */}
            <header className="shrink-0 z-40 bg-vivid-red text-white shadow-lg border-b border-red-600/40">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 md:py-3.5">
                    {/* Left: Logo & Mobile Hamburger */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                            type="button"
                            onClick={() =>
                                setMobileSidebarOpen(!mobileSidebarOpen)
                            }
                            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
                            aria-label="Toggle Navigation"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <Link
                            href="/"
                            className="flex items-center space-x-3 group"
                        >
                            <div className="p-1.5 bg-white rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105">
                                <img
                                    src="/storage/images/logo.webp"
                                    alt="Wright Finder Motors"
                                    className="h-8 sm:h-10 w-auto object-contain"
                                    onError={(e) => {
                                        (
                                            e.target as HTMLElement
                                        ).style.display = "none";
                                    }}
                                />
                            </div>
                            <div className="hidden sm:block leading-tight">
                                <span className="block text-xs font-black tracking-widest uppercase text-white/95">
                                    Wright Finder
                                </span>
                                <span className="block text-[10px] tracking-widest uppercase text-white/80 font-semibold">
                                    Motors Admin
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Middle: Headline Banner */}
                    <div className="flex-1 max-w-2xl mx-4 sm:mx-8 hidden lg:block">
                        <div className="bg-black/15 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-2">
                            <div className="flex items-center space-x-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                                    <span>Welcome back,</span>
                                    <span className="font-extrabold underline decoration-white/30 decoration-2 underline-offset-4">
                                        WFM
                                    </span>
                                    <span className="text-white/80 font-normal">
                                        |
                                    </span>
                                    <span className="text-amber-200 font-semibold">
                                        {user.name}
                                    </span>
                                </h1>
                            </div>
                            <p className="text-[11px] text-white/85 font-medium mt-0.5 tracking-wide">
                                Dealership management portal & showroom
                                operations
                            </p>
                        </div>
                    </div>

                    {/* Right: Logged User info & Logout Button */}
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-white flex items-center justify-end space-x-1.5">
                                <span>{user.name}</span>
                                <span className="text-[10px] font-semibold bg-white/20 text-white uppercase px-1.5 py-0.5 rounded tracking-wider">
                                    Admin
                                </span>
                            </div>
                            <div className="text-[11px] text-white/80 font-medium">
                                {user.email}
                            </div>
                        </div>

                        {/* User Avatar Circle */}
                        <div className="w-9 h-9 rounded-full bg-white text-vivid-red font-bold text-sm flex items-center justify-center shadow-md border-2 border-white/30 uppercase">
                            {user.name ? user.name.charAt(0) : "U"}
                        </div>

                        {/* Quick Exit Button */}
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="hidden sm:inline-flex items-center space-x-1.5 bg-black/25 hover:bg-black/40 text-white text-xs font-semibold px-3 py-2 rounded-xl transition border border-white/20 shadow-sm"
                            title="Log Out"
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
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>Exit</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Welcome Headline Strip */}
                <div className="lg:hidden px-4 py-1.5 bg-black/15 border-t border-white/10 text-center">
                    <p className="text-xs font-bold text-white">
                        Welcome back, WFM |{" "}
                        <span className="text-amber-200">{user.name}</span>
                    </p>
                    <p className="text-[10px] text-white/80">
                        Dealership management portal & showroom operations
                    </p>
                </div>
            </header>

            {/* Below Header: Sidebar (Fixed screen-fit) + Panel Area (Scrollable) */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile Sidebar Backdrop */}
                {mobileSidebarOpen && (
                    <div
                        onClick={() => setMobileSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}

                {/* Left Main Navigation (Screen fit, permanent non-collapsible sub-menu, never scrolls with panel) */}
                <aside
                    className={`fixed lg:static top-0 bottom-0 left-0 z-40 h-full w-64 shrink-0 bg-white border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
                        mobileSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Section Header */}
                        <div className="px-5 py-4 border-b border-purple/30">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                                Main Navigation
                            </span>
                        </div>

                        {/* Navigation Items (Always visible, clean, no collapsible toggles) */}
                        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                            {/* 1. Dashboard */}
                            <Link
                                href={route("dashboard")}
                                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                                    isDashboard
                                        ? "bg-vivid-red text-white shadow-lg shadow-vivid-red/30"
                                        : "text-black hover:text-black/60 hover:bg-white/10"
                                }`}
                            >
                                <svg
                                    className="w-5 h-5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                                <span>Dashboard</span>
                            </Link>

                            {/* 2. Buy Section Header (Static, always open) */}
                            <div className="pt-2">
                                <div className="flex items-center space-x-3 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-black">
                                    <svg
                                        className="w-4 h-4 text-vivid-red shrink-0"
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
                                    <span>Buy</span>
                                </div>

                                {/* Buy Sub-menu Options: Always expanded, direct panels */}
                                <div className="mt-1 ml-4 pl-3 border-l-2 border-purple/40 space-y-1">
                                    {/* View all Car */}
                                    <Link
                                        href={route("admin.cars.index")}
                                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                            isCarsIndex
                                                ? "bg-vivid-red text-white shadow-lg shadow-vivid-red/30"
                                                : "text-black hover:text-black/60 hover:bg-white/10"
                                        }`}
                                    >
                                        <svg
                                            className={`w-4 h-4 shrink-0 ${isCarsIndex ? "text-white" : "text-vivid-red"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                            />
                                        </svg>
                                        <span>View all Car</span>
                                    </Link>

                                    {/* Add new Car */}
                                    <Link
                                        href={route("admin.cars.create")}
                                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                            isCarsCreate
                                                ? "bg-vivid-red text-white shadow-lg shadow-vivid-red/30"
                                                : "text-black hover:text-black/60 hover:bg-white/10"
                                        }`}
                                    >
                                        <svg
                                            className={`w-4 h-4 shrink-0 ${isCarsCreate ? "text-white" : "text-emerald-400"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        <span>Add new Car</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 3. Rent Section Header */}
                            <div className="pt-2">
                                <div className="flex items-center space-x-3 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-black">
                                    <svg
                                        className="w-4 h-4 text-vivid-red shrink-0"
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
                                    <span>Rent</span>
                                </div>

                                {/* Rent Sub-menu Options */}
                                <div className="mt-1 ml-4 pl-3 border-l-2 border-purple/40 space-y-1">
                                    {/* View all Car */}
                                    <Link
                                        href={route("admin.rent.index")}
                                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                            isRentIndex
                                                ? "bg-vivid-red text-white shadow-lg shadow-vivid-red/30"
                                                : "text-black hover:text-black/60 hover:bg-white/10"
                                        }`}
                                    >
                                        <svg
                                            className={`w-4 h-4 shrink-0 ${isRentIndex ? "text-white" : "text-vivid-red"}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                            />
                                        </svg>
                                        <span>View all Car</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 4. Profile */}
                            <div className="pt-2">
                                <Link
                                    href={route("profile.edit")}
                                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                                        isProfile
                                            ? "bg-vivid-red text-white shadow-lg shadow-vivid-red/30"
                                            : "text-black hover:text-black/60 hover:bg-white/10"
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5 shrink-0"
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
                                    <span>Profile</span>
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar Footer: Website link & Log out */}
                        <div className="p-3 border-t border-purple/30 space-y-1">
                            <Link
                                href="/"
                                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-black hover:text-black/60 transition"
                                title="Public Website"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                                <span>Main Website</span>
                            </Link>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-500/20 transition text-left"
                            >
                                <svg
                                    className="w-5 h-5 shrink-0 text-rose-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                <span>Log out</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Right Panel Area (Independent scroll container with screen-fit parent) */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-50">
                    {/* Header bar within panel if passed */}
                    {header && (
                        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                            <div className="mx-auto flex items-center justify-between">
                                {header}
                            </div>
                        </div>
                    )}

                    {/* Scrollable content inside the panel */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
