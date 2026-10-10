export default function CallToActionSection() {
    return (
        <section id="contact" className="py-20 bg-bggray font-poppins relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Elevated Container Box with Gradient */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170a3d] via-[#232754] to-[#170a3d] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-white/10">
                    {/* Creative Background Glows & Accent Shapes */}
                    <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-vivid-red/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-16 -top-16 w-80 h-80 bg-purple/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

                    {/* Subtle grid pattern texture */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
                            backgroundSize: "24px 24px",
                        }}
                    />

                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                        {/* Pill badge */}
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span className="text-gray-200">
                                Have Questions Or Need Assistance?
                            </span>
                        </div>

                        {/* Heading conveying contact meaning */}
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Let's Connect &amp; Find Your Perfect Automotive
                            Match
                        </h2>

                        {/* Description */}
                        <p className="text-sm lg:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Whether you're looking to purchase your dream car,
                            schedule reliable maintenance, or need support with
                            flexible rentals, our friendly team of automotive
                            experts is here to assist you every step of the way.
                        </p>

                        {/* Single Creative Contact Us Button */}
                        <div className="pt-4 flex justify-center">
                            <a
                                href="#"
                                className="group relative inline-flex items-center space-x-3 px-7 lg:px-9 py-3 lg:py-4 rounded-full bg-vivid-red text-white text-sm lg:text-base font-bold shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-red-500/50"
                            >
                                <span>Contact Us</span>
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 transition-transform duration-300 group-hover:translate-x-1">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
