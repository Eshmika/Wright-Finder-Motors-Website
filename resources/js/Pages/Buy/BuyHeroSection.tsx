export default function BuyHeroSection() {
    return (
        <section className="relative text-white py-16 sm:py-20 lg:py-0 overflow-hidden font-poppins h-auto lg:h-[calc(100vh-6rem)] lg:min-h-[600px] flex items-center">
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                >
                    <source src="/storage/images/Hero.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Dark Overlay Gradients for readability and aesthetic */}
                <div className="absolute inset-0 bg-[#170a3d]/20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#170a3d]/45 via-[#170a3d]/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#170a3d]/40 via-transparent to-black/15" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Heading & Content */}
                    <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span>
                                Verified Pre-Owned &amp; Brand New Vehicles
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                            Buy Your <span className="text-vivid-red">Next Car</span> With Total Confidence.
                        </h1>

                        <p className="text-base text-gray-200 max-w-2xl leading-relaxed drop-shadow">
                            Explore our comprehensive catalog of certified, multi-point inspected vehicles with transparent pricing, CARFAX reports, and hassle-free financing options.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                            <a
                                href="#catalog"
                                className="px-6 py-3 rounded-full bg-vivid-red text-white font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/30 transform hover:-translate-y-0.5"
                            >
                                Browse Catalog
                            </a>
                            <a
                                href="#contact"
                                className="px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-semibold text-sm transition"
                            >
                                Schedule Test Drive
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
