export default function ContactHeroSection() {
    return (
        <section className="relative text-white py-20 overflow-hidden font-poppins h-auto lg:h-[60vh] flex items-center bg-[#0d0524]">
            {/* Background Gradient & Geometric Glows matching Buy page */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#170a3d] via-[#1a1145] to-[#0a0319]" />

            {/* Glowing Accent Orbs */}
            <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-vivid-red/15 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full bg-purple/40 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#232754]/50 blur-[90px] pointer-events-none" />

            {/* Subtle Tech Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8 lg:py-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    {/* Left Column: Heading, Badges, Copy & Quick Highlights */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        {/* Pill Tag */}
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span className="text-gray-200">
                                Dedicated Customer Support &amp; Concierge
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
                            We Are Here To{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vivid-red via-red-400 to-rose-300">
                                Assist You
                            </span>{" "}
                            Every Mile.
                        </h1>

                        {/* Description */}
                        <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
                            Have questions about vehicle purchasing, flexible
                            rentals, or maintenance? Connect directly with our
                            automotive specialists via phone, email, or send us
                            a message below.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
