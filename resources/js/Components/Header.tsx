import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

import { User } from "@/types";

interface HeaderProps {
    user?: User;
}

export default function Header({ user }: HeaderProps = {}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, component } = usePage();

    const isHome = url === "/" || url === "" || component === "Home";
    const isBuy = url.startsWith("/buy") || component === "Buy";
    const isRent = url.startsWith("/rent") || component === "Rent";
    const isContact = url.startsWith("/contact") || component === "Contact";

    const navLinks = [
        { name: "Home", href: "/", isCurrent: isHome },
        { name: "Buy", href: "/buy", isCurrent: isBuy },
        { name: "Rent", href: "/rent", isCurrent: isRent },
        { name: "Repair", href: "#", isCurrent: false },
        { name: "Blog", href: "#", isCurrent: false },
        { name: "Contact Us", href: "/contact", isCurrent: isContact },
    ];

    return (
        <header className="relative w-full z-40 bg-white border-b border-gray-200 shadow-sm font-poppins transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 md:h-24">
                    {/* Brand / Logo */}
                    <Link
                        href="/"
                        className="flex items-center group relative py-1 focus:outline-none"
                    >
                        <div className="relative">
                            <img
                                src="/storage/images/logo.webp"
                                alt="Wright Finder Motors Logo"
                                className="h-16 md:h-18 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display =
                                        "none";
                                }}
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {navLinks.map((link) => {
                            const ComponentTag = link.href.startsWith("/")
                                ? Link
                                : "a";
                            return (
                                <ComponentTag
                                    key={link.name}
                                    href={link.href}
                                    className={`group relative px-3.5 py-2 text-base font-semibold transition-colors duration-200 ${
                                        link.isCurrent
                                            ? "text-vivid-red"
                                            : "text-dark-blue hover:text-vivid-red"
                                    }`}
                                >
                                    <span className="relative z-10">
                                        {link.name}
                                    </span>
                                    {/* Creative underline indicator: fully visible when current/active, animated on hover */}
                                    <span
                                        className={`absolute bottom-0.5 left-3.5 right-3.5 h-[2.5px] rounded-full bg-vivid-red transition-transform duration-300 origin-left ${
                                            link.isCurrent
                                                ? "scale-x-100"
                                                : "scale-x-0 group-hover:scale-x-100"
                                        }`}
                                    />
                                    {/* Soft hover/active background glow pill */}
                                    <span
                                        className={`absolute inset-0 rounded-lg transition-colors duration-200 -z-0 ${
                                            link.isCurrent
                                                ? "bg-red-50/80"
                                                : "bg-red-50/0 group-hover:bg-red-50/80"
                                        }`}
                                    />
                                </ComponentTag>
                            );
                        })}
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl text-dark-blue hover:text-vivid-red hover:bg-gray-50 focus:outline-none transition-all duration-200"
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <svg
                                className="h-6 w-6 transition-transform duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.2}
                            >
                                {mobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 bg-white/98 backdrop-blur-md shadow-lg ${
                    mobileMenuOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 pointer-events-none"
                }`}
            >
                <nav className="px-4 py-4 space-y-1">
                    {navLinks.map((link) => {
                        const ComponentTag = link.href.startsWith("/")
                            ? Link
                            : "a";
                        return (
                            <ComponentTag
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                                    link.isCurrent
                                        ? "text-vivid-red bg-red-50/80"
                                        : "text-dark-blue hover:text-vivid-red hover:bg-red-50/60"
                                }`}
                            >
                                <span>{link.name}</span>
                                <span
                                    className={`transition-all duration-200 text-sm ${
                                        link.isCurrent
                                            ? "text-vivid-red translate-x-1"
                                            : "text-gray-300 group-hover:text-vivid-red group-hover:translate-x-1"
                                    }`}
                                >
                                    &rarr;
                                </span>
                            </ComponentTag>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
