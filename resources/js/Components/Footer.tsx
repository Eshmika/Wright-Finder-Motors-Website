import { Link } from "@inertiajs/react";
import BackToTop from "@/Components/BackToTop";

export default function Footer() {
    return (
        <>
            <BackToTop />
            <footer className="bg-dark-purple border-t border-purple/30 text-gray-300 font-poppins">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-center lg:text-left">
                        {/* Brand Info */}
                        <div className="space-y-4 flex flex-col items-center lg:items-start">
                            <div className="flex items-center justify-center lg:justify-start">
                                <img
                                    src="/storage/images/logo.webp"
                                    alt="Wright Finder Motors Logo"
                                    className="h-40 lg:h-56 w-auto object-contain bg-white p-5 rounded-lg shadow-md"
                                    onError={(e) => {
                                        (
                                            e.target as HTMLElement
                                        ).style.display = "none";
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                                Wright Finder Motors redefines the car buying
                                experience through innovation, reliability, and
                                precision. Whether seeking a high-performance
                                machine, luxury cruiser, or practical family
                                SUV, our dedicated team guides you toward the
                                ideal vehicle to turn your automotive dreams
                                into reality.
                            </p>
                            <div className="flex justify-center lg:justify-start space-x-4 pt-2">
                                <a
                                    href="#"
                                    className="h-9 w-9 rounded-full bg-[#232754] flex items-center justify-center text-gray-300 hover:text-white hover:bg-vivid-red transition"
                                >
                                    <span className="sr-only">Facebook</span>
                                    <svg
                                        className="w-4 h-4 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.888C10.597 0 9 1.582 9 4.615V8z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="h-9 w-9 rounded-full bg-[#232754] flex items-center justify-center text-gray-300 hover:text-white hover:bg-vivid-red transition"
                                >
                                    <span className="sr-only">Twitter</span>
                                    <svg
                                        className="w-4 h-4 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="h-9 w-9 rounded-full bg-[#232754] flex items-center justify-center text-gray-300 hover:text-white hover:bg-vivid-red transition"
                                >
                                    <span className="sr-only">Instagram</span>
                                    <svg
                                        className="w-4 h-4 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-col items-center lg:items-start">
                            <h4 className="text-white text-base font-semibold mb-4 border-b-2 lg:border-b-0 lg:border-l-2 border-vivid-red pb-1 lg:pb-0 lg:pl-3 inline-block">
                                Quick Links
                            </h4>
                            <ul className="space-y-2 text-sm flex flex-col items-center lg:items-start">
                                <li>
                                    <a
                                        href="/"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/buy"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Buy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/rent"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Rent
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#services"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Repair
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#blog"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="hover:text-vivid-red transition"
                                    >
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact & Map */}
                        <div className="flex flex-col items-center lg:items-start space-y-4">
                            <h4 className="text-white text-base font-semibold border-b-2 lg:border-b-0 lg:border-l-2 border-vivid-red pb-1 lg:pb-0 lg:pl-3 inline-block">
                                Get In Touch
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-300 w-full flex flex-col items-center lg:items-start">
                                {/* Address */}
                                <li className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start text-center sm:text-left gap-2 sm:gap-3">
                                    <span className="p-2 rounded-lg bg-[#232754] text-vivid-red shrink-0">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </span>
                                    <span className="pt-1 text-gray-300">
                                        Dayton, OH, United States
                                    </span>
                                </li>

                                {/* Phone Numbers */}
                                <li className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start text-center sm:text-left gap-2 sm:gap-3 w-full">
                                    <span className="p-2 rounded-lg bg-[#232754] text-vivid-red shrink-0">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </span>
                                    <div className="flex flex-col items-center lg:items-start space-y-1 pt-1">
                                        <a
                                            href="tel:+19374754737"
                                            className="hover:text-vivid-red transition font-medium text-gray-300"
                                        >
                                            +1937-475-4737
                                        </a>
                                        <a
                                            href="tel:+19372706688"
                                            className="hover:text-vivid-red transition font-medium text-gray-300"
                                        >
                                            +1937-270-6688
                                        </a>
                                        <a
                                            href="tel:+14409079599"
                                            className="hover:text-vivid-red transition font-medium text-gray-300"
                                        >
                                            +1440-907-9599
                                        </a>
                                    </div>
                                </li>

                                {/* Email */}
                                <li className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start text-center sm:text-left gap-2 sm:gap-3">
                                    <span className="p-2 rounded-lg bg-[#232754] text-vivid-red shrink-0">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </span>
                                    <a
                                        href="mailto:contact@wrightfindermotors.com"
                                        className="pt-1 hover:text-vivid-red transition text-gray-300 break-all"
                                    >
                                        contact@wrightfindermotors.com
                                    </a>
                                </li>

                                {/* Google Maps iFrame */}
                                <li className="w-full pt-3">
                                    <div className="w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-xl border border-purple/30 shadow-md">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d24536.12128934873!2d-84.194032!3d39.761768!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884080d5aedd1403%3A0xa640e392f20e4ce4!2sDayton%2C%20OH!5e0!3m2!1sen!2sus!4v1791625785773!5m2!1sen!2sus"
                                            width="100%"
                                            height="180"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            title="Wright Finder Motors Location Map"
                                            className="w-full"
                                        />
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-purple/30 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 space-y-4 sm:space-y-0 text-center sm:text-left">
                        <p>
                            © {new Date().getFullYear()} Wright Finder Motors.
                            All rights reserved.
                        </p>
                        <div className="flex-col lg:flex-row gap-3 justify-center items-center flex text-center lg:text-left w-full lg:w-auto">
                            <a href="#" className="hover:text-white transition">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-white transition">
                                Terms of Service
                            </a>
                            <a href="#" className="hover:text-white transition">
                                Cookie Settings
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
