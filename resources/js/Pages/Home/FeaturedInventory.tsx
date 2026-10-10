import { useState } from 'react';

interface Vehicle {
    id: number;
    title: string;
    type: 'sale' | 'rent';
    price: string;
    period?: string;
    mileage: string;
    fuel: string;
    transmission: string;
    year: number;
    badge: string;
    imageUrl: string;
}

const vehicles: Vehicle[] = [
    {
        id: 1,
        title: 'Mercedes-Benz C-Class AMG Line',
        type: 'sale',
        price: '$42,500',
        mileage: '18,500 mi',
        fuel: 'Petrol',
        transmission: 'Automatic',
        year: 2023,
        badge: 'Certified Pre-Owned',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 2,
        title: 'BMW X5 xDrive40i M Sport',
        type: 'rent',
        price: '$120',
        period: '/ day',
        mileage: '12,000 mi',
        fuel: 'Hybrid',
        transmission: 'Automatic',
        year: 2024,
        badge: 'Instant Booking',
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 3,
        title: 'Audi RS6 Avant Quattro',
        type: 'sale',
        price: '$89,900',
        mileage: '9,200 mi',
        fuel: 'Twin-Turbo',
        transmission: 'Automatic',
        year: 2023,
        badge: 'Hot Deal',
        imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 4,
        title: 'Porsche Taycan 4S Electric',
        type: 'rent',
        price: '$190',
        period: '/ day',
        mileage: '6,400 mi',
        fuel: '100% Electric',
        transmission: 'Automatic',
        year: 2024,
        badge: 'Luxury Rental',
        imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 5,
        title: 'Range Rover Sport Dynamic',
        type: 'sale',
        price: '$74,500',
        mileage: '15,000 mi',
        fuel: 'Diesel',
        transmission: 'Automatic',
        year: 2022,
        badge: 'Fully Inspected',
        imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 6,
        title: 'Tesla Model 3 Long Range',
        type: 'rent',
        price: '$75',
        period: '/ day',
        mileage: '11,000 mi',
        fuel: 'EV',
        transmission: 'Automatic',
        year: 2023,
        badge: 'Eco Friendly',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    },
];

export default function FeaturedInventory() {
    const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all');

    const filteredVehicles = filter === 'all' 
        ? vehicles 
        : vehicles.filter((v) => v.type === filter);

    return (
        <section id="vehicles" className="py-20 bg-white font-poppins">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                            Featured Inventory
                        </span>
                        <h2 className="text-3xl font-extrabold text-[#170a3d] mt-2">
                            Top Deals For Sale &amp; Rent
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Handpicked quality vehicles ready for immediate driving or booking.
                        </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex space-x-2 mt-6 md:mt-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
                                filter === 'all'
                                    ? 'bg-[#170a3d] text-white shadow'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Vehicles
                        </button>
                        <button
                            onClick={() => setFilter('sale')}
                            className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
                                filter === 'sale'
                                    ? 'bg-vivid-red text-white shadow'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            For Sale
                        </button>
                        <button
                            onClick={() => setFilter('rent')}
                            className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
                                filter === 'rent'
                                    ? 'bg-[#232754] text-white shadow'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            For Rent
                        </button>
                    </div>
                </div>

                {/* Vehicle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVehicles.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                            {/* Card Image */}
                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                <img
                                    src={car.imageUrl}
                                    alt={car.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                                            car.type === 'sale' ? 'bg-vivid-red' : 'bg-[#232754]'
                                        }`}
                                    >
                                        {car.type === 'sale' ? 'For Sale' : 'For Rent'}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-800 shadow-sm">
                                    {car.badge}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                        <span>Model Year {car.year}</span>
                                        <span>{car.mileage}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-vivid-red transition">
                                        {car.title}
                                    </h3>

                                    {/* Specs Pills */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-4 py-3 border-y border-gray-100">
                                        <span className="flex items-center gap-1">
                                            ⛽ {car.fuel}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            ⚙️ {car.transmission}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🛣️ {car.mileage}
                                        </span>
                                    </div>
                                </div>

                                {/* Price and Action */}
                                <div className="flex items-center justify-between mt-6 pt-2">
                                    <div>
                                        <span className="text-xl font-extrabold text-[#170a3d]">
                                            {car.price}
                                        </span>
                                        {car.period && (
                                            <span className="text-xs font-medium text-gray-400">
                                                {car.period}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                                            car.type === 'sale'
                                                ? 'bg-vivid-red text-white hover:bg-red-600'
                                                : 'bg-[#232754] text-white hover:bg-[#170a3d]'
                                        }`}
                                    >
                                        {car.type === 'sale' ? 'View Details' : 'Book Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
