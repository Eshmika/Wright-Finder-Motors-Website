import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";

export default function PrivacyPolicy({ auth }: PageProps) {
    const lastUpdated = "November 18, 2026";

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Privacy Policy - Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative text-white py-16 lg:py-24 overflow-hidden bg-[#0d0524]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#170a3d] via-[#1a1145] to-[#0a0319]" />
                    <div className="absolute top-10 right-10 w-[450px] h-[450px] rounded-full bg-vivid-red/15 blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-purple/40 blur-[120px] pointer-events-none" />

                    <div
                        className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                            backgroundSize: "64px 64px",
                        }}
                    />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold tracking-wide shadow-sm mb-6">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span className="text-gray-200">
                                Legal &amp; Data Protection
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Privacy{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vivid-red via-red-400 to-rose-300">
                                Policy
                            </span>
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                            We value your trust. Learn how Wright Finder Motors
                            collects, protects, and handles your personal
                            information across our vehicle sales and rental
                            services.
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-400">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-12 lg:py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 lg:p-12 space-y-10">
                            {/* Introduction */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    1. Introduction
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    Welcome to Wright Finder Motors
                                    (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                                    &ldquo;us&rdquo;). Located in Dayton, Ohio,
                                    we are dedicated to delivering top-tier
                                    vehicle sales, car rental services, and
                                    automotive solutions. This Privacy Policy
                                    describes how we collect, use, disclose, and
                                    safeguard your data when you visit our
                                    website or interact with our services.
                                </p>
                            </div>

                            {/* Information We Collect */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    2. Information We Collect
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                                    We may collect information about you in a
                                    variety of ways:
                                </p>
                                <ul className="space-y-3 text-sm sm:text-base text-gray-600 list-disc list-inside ml-2">
                                    <li>
                                        <strong className="text-gray-900">
                                            Personal Identification:
                                        </strong>{" "}
                                        Full name, email address, phone number,
                                        mailing address, driver's license number
                                        (for rentals), and date of birth.
                                    </li>
                                    <li>
                                        <strong className="text-gray-900">
                                            Vehicle &amp; Reservation Data:
                                        </strong>{" "}
                                        Vehicle preferences, rental start/end
                                        dates, pickup and drop-off locations,
                                        booking confirmation numbers, and
                                        applied coupon codes.
                                    </li>
                                    <li>
                                        <strong className="text-gray-900">
                                            Communication History:
                                        </strong>{" "}
                                        Records and copies of your
                                        correspondence when you submit inquiry
                                        forms, email us, or contact our support
                                        team.
                                    </li>
                                    <li>
                                        <strong className="text-gray-900">
                                            Technical Device Data:
                                        </strong>{" "}
                                        IP address, browser type, operating
                                        system, referring URLs, device
                                        identifiers, and browsing activity
                                        collected via cookies and tracking
                                        technologies.
                                    </li>
                                </ul>
                            </div>

                            {/* How We Use Your Information */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    3. How We Use Your Information
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                                    We utilize collected data to fulfill our
                                    commitments and provide an exceptional
                                    customer journey:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                                            Reservations &amp; Sales
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            Processing car purchase inquiries,
                                            confirming rental reservations, and
                                            verifying valid driver credentials.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                                            Customer Support
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            Responding to requests, providing
                                            assistance, sending receipts, and
                                            notifying you about booking
                                            statuses.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                                            Website Optimization
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            Improving page load performance,
                                            optimizing our inventory search
                                            tools, and analyzing traffic trends.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                                            Safety &amp; Compliance
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            Preventing fraudulent transactions,
                                            enforcing our terms of service, and
                                            complying with applicable Ohio &amp;
                                            federal laws.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Information Sharing */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    4. Information Sharing &amp; Disclosure
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                                    We do not sell, rent, or trade your personal
                                    information. We may disclose data only under
                                    the following limited circumstances:
                                </p>
                                <ul className="space-y-2 text-sm sm:text-base text-gray-600 list-disc list-inside ml-2">
                                    <li>
                                        <strong className="text-gray-900">
                                            Service Providers:
                                        </strong>{" "}
                                        Trusted third-party vendors assisting in
                                        payment processing, transactional email
                                        delivery, and cloud infrastructure.
                                    </li>
                                    <li>
                                        <strong className="text-gray-900">
                                            Legal Compliance:
                                        </strong>{" "}
                                        When required by subpoenas, court
                                        orders, law enforcement, or government
                                        regulations.
                                    </li>
                                    <li>
                                        <strong className="text-gray-900">
                                            Protection of Rights:
                                        </strong>{" "}
                                        To investigate potential violations,
                                        protect physical safety, or defend
                                        against legal claims.
                                    </li>
                                </ul>
                            </div>

                            {/* Data Security */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    5. Data Security &amp; Retention
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    We implement standard administrative,
                                    technical, and physical security measures to
                                    safeguard your personal information against
                                    unauthorized access, loss, or alteration. We
                                    retain personal details only as long as
                                    necessary to provide services and fulfill
                                    legal, tax, or accounting requirements.
                                </p>
                            </div>

                            {/* Your Rights */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    6. Your Rights &amp; Choices
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                                    Depending on your location, you may have
                                    rights regarding your personal data,
                                    including:
                                </p>
                                <ul className="space-y-2 text-sm sm:text-base text-gray-600 list-disc list-inside ml-2">
                                    <li>
                                        Accessing and reviewing the personal
                                        data we hold about you.
                                    </li>
                                    <li>
                                        Requesting corrections to inaccurate or
                                        incomplete records.
                                    </li>
                                    <li>
                                        Requesting the deletion of your personal
                                        data, subject to legal retention
                                        obligations.
                                    </li>
                                    <li>
                                        Opting out of non-essential
                                        communications or customizing cookie
                                        preferences.
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Section */}
                            <div className="pt-6 border-t border-slate-200">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                                    Have Questions About Your Privacy?
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                                    If you have questions, inquiries, or would
                                    like to exercise any of your data privacy
                                    rights, please contact us:
                                </p>
                                <div className="p-5 rounded-xl bg-dark-purple text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-sm sm:text-base">
                                            Wright Finder Motors - Privacy Team
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-300">
                                            Dayton, OH, United States
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-300">
                                            Email:
                                            contact@wrightfindermotors.com
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-300">
                                            Phone: +1937-475-4737
                                        </p>
                                    </div>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-vivid-red hover:bg-red-600 text-white text-xs sm:text-sm font-semibold transition shadow-md"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
