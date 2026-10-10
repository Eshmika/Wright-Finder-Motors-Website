import { Link } from '@inertiajs/react';

export default function CallToActionSection() {
    return (
        <section id="contact" className="py-20 bg-gradient-to-r from-[#170a3d] via-[#232754] to-[#170a3d] text-white font-poppins relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-vivid-red/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-80 h-80 bg-purple/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                    Ready to hit the road?
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-3 max-w-3xl mx-auto leading-tight">
                    Start Your Automotive Journey With Wright Finder Motors Today
                </h2>
                <p className="text-sm sm:text-base text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">
                    Browse verified inventory, book high-performance rental vehicles in seconds, or get a top-dollar offer for your current car.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a
                        href="#vehicles"
                        className="px-8 py-3.5 rounded-full bg-vivid-red text-white text-sm font-semibold hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                    >
                        Browse Inventory
                    </a>
                    <Link
                        href={route('register')}
                        className="px-8 py-3.5 rounded-full bg-white text-[#170a3d] text-sm font-semibold hover:bg-gray-100 transition shadow"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>
        </section>
    );
}
