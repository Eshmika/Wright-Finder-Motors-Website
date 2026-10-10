import { useState } from 'react';

export default function HeroSection() {
    const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');

    return (
        <section className="relative bg-gradient-to-br from-[#170a3d] via-[#232754] to-[#3a1f62] text-white py-20 lg:py-28 overflow-hidden font-poppins">
            {/* Background Decorative Rings */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-vivid-red/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple/30 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Heading & Content */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm font-medium tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span>Premier Automotive Marketplace</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Find Your <span className="text-vivid-red">Dream Car</span> To Buy Or Rent.
                        </h1>

                        <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                            Discover thousands of certified pre-owned &amp; brand new vehicles to purchase, or choose from our flexible rental fleet for your next trip.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                            <a
                                href="#search"
                                className="px-8 py-3.5 rounded-full bg-vivid-red text-white font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/25 transform hover:-translate-y-0.5"
                            >
                                Explore Inventory
                            </a>
                            <a
                                href="#rent"
                                className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition"
                            >
                                Rent a Vehicle
                            </a>
                        </div>

                        {/* Quick Highlights */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
                            <div>
                                <p className="text-2xl font-bold text-white">5,000+</p>
                                <p className="text-xs text-gray-400">Cars Listed</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">100%</p>
                                <p className="text-xs text-gray-400">Inspected</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">24/7</p>
                                <p className="text-xs text-gray-400">Roadside Assist</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Search Card with Sell/Rent Tabs */}
                    <div id="search" className="lg:col-span-5">
                        <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                            {/* Toggle Tabs */}
                            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('buy')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                                        activeTab === 'buy'
                                            ? 'bg-vivid-red text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    🚗 Buy a Vehicle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('rent')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                                        activeTab === 'rent'
                                            ? 'bg-[#232754] text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    🔑 Rent a Vehicle
                                </button>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Vehicle Make &amp; Model
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Toyota RAV4, BMW 3 Series"
                                        className="w-full rounded-lg border-gray-300 text-sm focus:border-vivid-red focus:ring-vivid-red"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                            Body Type
                                        </label>
                                        <select className="w-full rounded-lg border-gray-300 text-sm focus:border-vivid-red focus:ring-vivid-red">
                                            <option>All Types</option>
                                            <option>SUV</option>
                                            <option>Sedan</option>
                                            <option>Truck</option>
                                            <option>Coupe</option>
                                            <option>Hatchback</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                            {activeTab === 'buy' ? 'Max Price' : 'Price / Day'}
                                        </label>
                                        <select className="w-full rounded-lg border-gray-300 text-sm focus:border-vivid-red focus:ring-vivid-red">
                                            {activeTab === 'buy' ? (
                                                <>
                                                    <option>Any Price</option>
                                                    <option>Under $15,000</option>
                                                    <option>Under $30,000</option>
                                                    <option>Under $50,000</option>
                                                    <option>$50,000+</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option>Any Price</option>
                                                    <option>Under $50/day</option>
                                                    <option>Under $100/day</option>
                                                    <option>Under $200/day</option>
                                                    <option>$200+/day</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Location / City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your city or zip code"
                                        className="w-full rounded-lg border-gray-300 text-sm focus:border-vivid-red focus:ring-vivid-red"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3.5 rounded-lg text-white font-semibold text-sm transition shadow-md ${
                                        activeTab === 'buy'
                                            ? 'bg-vivid-red hover:bg-red-600'
                                            : 'bg-[#232754] hover:bg-[#170a3d]'
                                    }`}
                                >
                                    {activeTab === 'buy' ? 'Search Vehicles For Sale' : 'Find Available Rentals'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
