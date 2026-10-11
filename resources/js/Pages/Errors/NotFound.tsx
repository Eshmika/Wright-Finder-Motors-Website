import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";

export default function NotFound({ auth }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="404 - Lost on the Road | Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            {/* Main Content Area */}
            <main className="flex-1 bg-bggray py-16 sm:py-20 lg:py-24 relative overflow-hidden">
                {/* Background Ambient Glows on bg-bggray */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-vivid-red/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#170a3d]/30 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Elevated Box Container with the signature dark gradient matching CTA / Buy card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#170a3d] via-[#1a1145] to-[#0a0319] text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-white/10 text-center">
                        {/* Glow halos inside card */}
                        <div className="absolute -right-16 -top-16 w-80 h-80 bg-vivid-red/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple/40 rounded-full blur-3xl pointer-events-none" />

                        {/* Subtle grid pattern texture */}
                        <div
                            className="absolute inset-0 opacity-[0.04] pointer-events-none"
                            style={{
                                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
                                backgroundSize: "24px 24px",
                            }}
                        />

                        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                            {/* Pill status badge */}
                            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                                <span className="text-gray-200">
                                    Error 404 • Wrong Turn
                                </span>
                            </div>

                            {/* Headings & Narrative */}
                            <div className="space-y-3 pt-2">
                                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    You've Steered{" "}
                                    <span className="text-vivid-red">
                                        Off Track
                                    </span>
                                    !
                                </h2>
                                <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
                                    The vehicle, link, or page you are looking
                                    for has been parked in another garage, sold,
                                    or doesn't exist on our showroom floor.
                                </p>
                            </div>

                            {/* Interactive Buttons */}
                            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300"
                                >
                                    <span>Need Help? Contact Us</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
