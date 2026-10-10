const categories = [
    { name: 'SUV & Crossover', count: '1,420+ available', icon: '🚙' },
    { name: 'Luxury Sedans', count: '890+ available', icon: '🚗' },
    { name: 'Sports Cars', count: '310+ available', icon: '🏎️' },
    { name: 'Electric & Hybrid', count: '640+ available', icon: '⚡' },
    { name: 'Pickups & Trucks', count: '520+ available', icon: '🛻' },
    { name: 'Convertible', count: '180+ available', icon: '🚘' },
];

export default function FeaturedCategories() {
    return (
        <section className="py-16 bg-gray-50 font-poppins">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                        Explore By Category
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#170a3d] mt-2">
                        Browse Vehicles by Body Style
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Whether you are looking for comfortable daily commute or rugged weekend adventures.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:border-vivid-red/40 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        >
                            <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                                {cat.icon}
                            </div>
                            <h3 className="font-semibold text-sm text-gray-800 group-hover:text-vivid-red transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
