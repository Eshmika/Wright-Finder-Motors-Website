export default function ServicesSection() {
    return (
        <section id="services" className="py-20 bg-bggray font-poppins">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                        Everything You Need
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#170a3d] mt-2">
                        Comprehensive Automotive Solutions
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        From instant car valuation to flexible rentals and verified certified inspections.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sell Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                        <div className="w-14 h-14 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center text-2xl mb-6 group-hover:bg-vivid-red group-hover:text-white transition-colors duration-300">
                            🏷️
                        </div>
                        <h3 className="text-xl font-bold text-[#170a3d] mb-3">
                            Sell Your Vehicle
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Get an instant competitive cash offer or list directly on our marketplace for maximum reach. Free evaluation in under 24 hours.
                        </p>
                        <a
                            href="#contact"
                            className="inline-flex items-center text-sm font-bold text-vivid-red hover:text-red-700 transition"
                        >
                            Get Instant Valuation &rarr;
                        </a>
                    </div>

                    {/* Rent Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                        <div className="w-14 h-14 rounded-xl bg-[#232754]/10 text-[#232754] flex items-center justify-center text-2xl mb-6 group-hover:bg-[#232754] group-hover:text-white transition-colors duration-300">
                            🔑
                        </div>
                        <h3 className="text-xl font-bold text-[#170a3d] mb-3">
                            Car Rental &amp; Fleets
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Daily, weekly, or monthly flexible rental terms. Fully insured vehicles with doorstep delivery and 24/7 roadside assistance.
                        </p>
                        <a
                            href="#rent"
                            className="inline-flex items-center text-sm font-bold text-[#232754] hover:text-[#170a3d] transition"
                        >
                            Reserve a Ride &rarr;
                        </a>
                    </div>

                    {/* Certified Inspection */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                        <div className="w-14 h-14 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-2xl mb-6 group-hover:bg-purple group-hover:text-white transition-colors duration-300">
                            🛡️
                        </div>
                        <h3 className="text-xl font-bold text-[#170a3d] mb-3">
                            200-Point Inspection
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Every vehicle on Wright Finder Motors passes a rigorous mechanical and history inspection before being certified.
                        </p>
                        <a
                            href="#about"
                            className="inline-flex items-center text-sm font-bold text-purple hover:text-[#170a3d] transition"
                        >
                            Learn Inspection Standards &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
