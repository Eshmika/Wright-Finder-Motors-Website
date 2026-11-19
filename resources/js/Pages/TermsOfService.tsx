import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";

export default function TermsOfService({ auth }: PageProps) {
    const lastUpdated = "November 18, 2026";

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Terms of Service - Wright Finder Motors" />

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
                                User Agreement &amp; Rental Policies
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Terms of{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vivid-red via-red-400 to-rose-300">
                                Service
                            </span>
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                            Please review these terms carefully before accessing
                            our website, purchasing vehicles, or booking rental
                            reservations with Wright Finder Motors.
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
                            {/* Agreement to Terms */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    1. Acceptance of Terms
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    By accessing or using Wright Finder Motors'
                                    website (the &ldquo;Platform&rdquo;),
                                    booking a vehicle rental, or initiating an
                                    automotive purchase, you agree to be bound
                                    by these Terms of Service and all applicable
                                    federal, state, and local laws. If you do
                                    not agree with any part of these terms, you
                                    are prohibited from using the platform.
                                </p>
                            </div>

                            {/* Eligibility & Driver Requirements */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    2. Rental Eligibility &amp; Driver
                                    Requirements
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                                    To reserve and operate any vehicle rented
                                    through Wright Finder Motors, renters must
                                    satisfy the following criteria:
                                </p>
                                <ul className="space-y-2 text-sm sm:text-base text-gray-600 list-disc list-inside ml-2">
                                    <li>
                                        Be at least 21 years of age (drivers
                                        under 25 may be subject to a young
                                        driver surcharge).
                                    </li>
                                    <li>
                                        Hold a valid, government-issued
                                        driver&apos;s license in good standing.
                                    </li>
                                    <li>
                                        Provide proof of valid comprehensive
                                        auto insurance coverage or purchase our
                                        approved rental protection.
                                    </li>
                                    <li>
                                        Present a valid major credit or debit
                                        card matching the renter's legal
                                        identity for security deposit
                                        authorizations.
                                    </li>
                                </ul>
                            </div>

                            {/* Reservations, Payments & Cancellations */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    3. Reservations, Rates &amp; Cancellations
                                </h2>
                                <div className="space-y-4 text-sm sm:text-base text-gray-600">
                                    <p>
                                        <strong className="text-gray-900">
                                            Reservations &amp; Confirmation:
                                        </strong>{" "}
                                        Submitting a rental request generates a
                                        confirmation tracking number.
                                        Reservations remain subject to inventory
                                        availability and identification
                                        verification upon vehicle handover.
                                    </p>
                                    <p>
                                        <strong className="text-gray-900">
                                            Rates &amp; Fees:
                                        </strong>{" "}
                                        Daily rates, taxes, state surcharges,
                                        and mileage limits are disclosed during
                                        checkout. Any excess mileage beyond the
                                        agreed allowance will be billed at the
                                        standard rate indicated in your
                                        agreement.
                                    </p>
                                    <p>
                                        <strong className="text-gray-900">
                                            Promotions &amp; Coupons:
                                        </strong>{" "}
                                        Promotional coupon codes are
                                        non-transferable, cannot be redeemed for
                                        cash, and must be submitted at the time
                                        of reservation creation.
                                    </p>
                                    <p>
                                        <strong className="text-gray-900">
                                            Cancellations:
                                        </strong>{" "}
                                        Cancellations made at least 24 hours
                                        prior to scheduled pick-up are eligible
                                        for a full refund or free rescheduling.
                                        Late cancellations may incur a nominal
                                        administrative fee.
                                    </p>
                                </div>
                            </div>

                            {/* Vehicle Use Policies */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    4. Prohibited Vehicle Uses
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                                    Renters agree not to operate our vehicles
                                    under any of the following unauthorized
                                    conditions:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs sm:text-sm text-gray-700">
                                        ❌ Driving while impaired by alcohol,
                                        drugs, or prescription medications.
                                    </div>
                                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs sm:text-sm text-gray-700">
                                        ❌ Engaging in racing, speed contests,
                                        off-roading, or stunts.
                                    </div>
                                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs sm:text-sm text-gray-700">
                                        ❌ Allowing unauthorized or
                                        non-registered individuals to drive.
                                    </div>
                                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs sm:text-sm text-gray-700">
                                        ❌ Smoking, vaping, or transporting
                                        hazardous materials inside the vehicle.
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Sales & Purchases */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    5. Vehicle Purchases &amp; Inventory
                                    Accuracy
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    We make every effort to display accurate
                                    specifications, mileage, pricing, and visual
                                    representations for all inventory listed on
                                    our platform. However, typographical
                                    inaccuracies or temporary inventory
                                    discrepancies may occur. Wright Finder
                                    Motors reserves the right to correct pricing
                                    or specification errors prior to finalized
                                    written sale agreements.
                                </p>
                            </div>

                            {/* Limitation of Liability */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    6. Limitation of Liability
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    To the maximum extent permitted by
                                    applicable law, Wright Finder Motors and its
                                    officers, directors, and employees shall not
                                    be liable for any direct, indirect,
                                    incidental, or consequential damages arising
                                    out of the use or inability to use our
                                    services, rental vehicles, or website.
                                </p>
                            </div>

                            {/* Governing Law */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-4">
                                    7. Governing Law &amp; Jurisdiction
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    These Terms are governed by and construed in
                                    accordance with the laws of the State of
                                    Ohio, United States, without regard to its
                                    conflict of law principles. Any legal suit
                                    or action arising out of these terms shall
                                    be instituted in the state or federal courts
                                    located in Montgomery County, Ohio.
                                </p>
                            </div>

                            {/* Contact Section */}
                            <div className="pt-6 border-t border-slate-200">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                                    Questions Regarding Terms?
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                                    For inquiries regarding rental contracts,
                                    commercial leases, or purchase guidelines,
                                    feel free to reach out directly to our team.
                                </p>
                                <div className="p-5 rounded-xl bg-dark-purple text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-sm sm:text-base">
                                            Wright Finder Motors - Legal
                                            Department
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
                                        Contact Us
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
