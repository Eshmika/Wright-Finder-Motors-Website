import React from "react";
import { Link } from "@inertiajs/react";

export default function RepairHeroSection() {
    return (
        <section className="relative text-white py-12 sm:py-16 md:py-20 overflow-hidden font-poppins bg-[#0d0524]">
            {/* Background Gradient & Geometric Glows matching theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#170a3d] via-[#1a1145] to-[#0a0319]" />

            {/* Glowing Accent Orbs */}
            <div className="absolute top-10 right-10 w-72 sm:w-[500px] h-72 sm:h-[500px] rounded-full bg-vivid-red/15 blur-[80px] sm:blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 sm:w-[450px] h-72 sm:h-[450px] rounded-full bg-purple/40 blur-[80px] sm:blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-[350px] h-64 sm:h-[350px] rounded-full bg-[#232754]/50 blur-[60px] sm:blur-[90px] pointer-events-none" />

            {/* Subtle Tech Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="gap-8 lg:gap-12 items-center">
                    {/* Left Column: Heading, Badges, Copy */}
                    <div className="space-y-4 sm:space-y-5 text-center lg:text-left">
                        {/* Title */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-[1.15]">
                            Auto Repair &{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vivid-red via-red-400 to-rose-300">
                                Maintenance
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                            Professional, Reliable and Convenient Vehicle
                            Service
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
