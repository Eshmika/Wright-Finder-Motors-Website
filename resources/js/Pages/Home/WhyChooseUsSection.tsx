export default function WhyChooseUsSection() {
    const reasons = [
        {
            title: 'Transparent Pricing',
            description: 'No hidden fees or surprise dealership charges. The price you see is what you pay.',
            icon: '💎',
        },
        {
            title: 'Verified Ownership & CarFax',
            description: 'Free comprehensive background and maintenance history reports for every vehicle.',
            icon: '📜',
        },
        {
            title: '7-Day Money Back Guarantee',
            description: 'Test drive your purchase in real life. If you do not love it, return it with 100% refund.',
            icon: '🔄',
        },
        {
            title: 'Flexible Financing & Insurance',
            description: 'Instant competitive financing rates and flexible lease-to-own programs with quick approval.',
            icon: '💳',
        },
    ];

    return (
        <section id="about" className="py-20 bg-white font-poppins">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column Graphic & Image */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
                                alt="Luxury Sports Car"
                                className="w-full h-[450px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#170a3d]/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <span className="text-xs uppercase tracking-widest text-vivid-red font-bold">
                                    Quality Assured
                                </span>
                                <h4 className="text-xl font-bold mt-1">
                                    Top Rated by 10,000+ Drivers
                                </h4>
                            </div>
                        </div>

                        {/* Floating Experience Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-[#232754] text-white p-5 rounded-2xl shadow-xl hidden sm:block border-2 border-white">
                            <p className="text-3xl font-extrabold text-vivid-red">15+</p>
                            <p className="text-xs font-medium text-gray-300">Years of Automotive<br />Excellence</p>
                        </div>
                    </div>

                    {/* Right Column Content */}
                    <div className="lg:col-span-7 space-y-6">
                        <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                            Why Wright Finder Motors
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#170a3d] leading-tight">
                            We Simplify How You Buy, Sell, and Rent Cars
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Wright Finder Motors was built to eliminate the stress of automotive transactions. We combine state-of-the-art vehicle verification with white-glove customer care to deliver a seamless experience.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            {reasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start space-x-3.5">
                                    <div className="text-2xl p-2 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                                        {reason.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#170a3d]">
                                            {reason.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {reason.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
