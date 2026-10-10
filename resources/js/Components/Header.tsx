import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { useState } from 'react';

interface HeaderProps {
    user?: User;
}

export default function Header({ user }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[#170a3d]/95 backdrop-blur-md border-b border-purple/30 text-white font-poppins">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <img
                            src="/storage/images/logo.webp"
                            alt="Wright Finder Motors Logo"
                            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                            onError={(e) => {
                                // Fallback if image not ready
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white">
                                Wright <span className="text-vivid-red">Finder</span> Motors
                            </span>
                            <span className="text-xs text-gray-300 uppercase tracking-widest">
                                Sell &amp; Rent Vehicles
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        <Link href="/" className="text-white hover:text-vivid-red transition-colors">
                            Home
                        </Link>
                        <a href="#vehicles" className="text-gray-200 hover:text-vivid-red transition-colors">
                            Buy Cars
                        </a>
                        <a href="#rent" className="text-gray-200 hover:text-vivid-red transition-colors">
                            Rentals
                        </a>
                        <a href="#services" className="text-gray-200 hover:text-vivid-red transition-colors">
                            Services
                        </a>
                        <a href="#about" className="text-gray-200 hover:text-vivid-red transition-colors">
                            About Us
                        </a>
                        <a href="#contact" className="text-gray-200 hover:text-vivid-red transition-colors">
                            Contact
                        </a>
                    </nav>

                    {/* Auth / CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-full bg-vivid-red text-white text-sm font-semibold hover:bg-red-600 transition shadow-md hover:shadow-lg"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-gray-200 hover:text-white transition px-3 py-2"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2.5 rounded-full bg-vivid-red text-white text-sm font-semibold hover:bg-red-600 transition shadow-md hover:shadow-lg"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-purple/40 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#170a3d] border-b border-purple/40 px-4 pt-2 pb-6 space-y-3">
                    <Link
                        href="/"
                        className="block text-white hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <a
                        href="#vehicles"
                        className="block text-gray-200 hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Buy Cars
                    </a>
                    <a
                        href="#rent"
                        className="block text-gray-200 hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Rentals
                    </a>
                    <a
                        href="#services"
                        className="block text-gray-200 hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Services
                    </a>
                    <a
                        href="#about"
                        className="block text-gray-200 hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        About Us
                    </a>
                    <a
                        href="#contact"
                        className="block text-gray-200 hover:text-vivid-red py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Contact
                    </a>
                    <div className="pt-4 border-t border-purple/30 flex flex-col space-y-2">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full text-center py-2.5 rounded-lg bg-vivid-red text-white font-semibold"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="w-full text-center py-2.5 rounded-lg border border-purple text-gray-200 font-semibold"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="w-full text-center py-2.5 rounded-lg bg-vivid-red text-white font-semibold"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
