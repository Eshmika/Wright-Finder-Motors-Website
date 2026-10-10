import { useState } from "react";

export default function HeroSection() {
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
                <div className="absolute inset-0 bg-[#170a3d]/15 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#170a3d]/35 via-[#170a3d]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#170a3d]/30 via-transparent to-black/10" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Heading & Content */}
                    <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span>
                                100% Trusted car purchase platform in the World
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                            Find Your{" "}
                            <span className="text-vivid-red">Dream Car</span> To
                            Buy Or Rent.
                        </h1>

                        <p className="text-base text-gray-200 max-w-2xl leading-relaxed drop-shadow">
                            Discover thousands of certified pre-owned &amp;
                            brand new vehicles to purchase, or choose from our
                            flexible rental fleet for your next trip.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                            <a
                                href="/buy"
                                className="px-6 py-3 rounded-full bg-vivid-red text-white font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/30 transform hover:-translate-y-0.5"
                            >
                                Explore Inventory
                            </a>
                            <a
                                href="#"
                                className="px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-semibold text-sm transition"
                            >
                                Rent a Vehicle
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
