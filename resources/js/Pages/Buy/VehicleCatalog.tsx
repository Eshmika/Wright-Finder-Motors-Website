import { useState, useMemo } from "react";

interface Vehicle {
    id: number;
    title: string;
    make: string;
    category: string;
    price: number;
    year: number;
    mileage: string;
    fuel: string;
    transmission: string;
    badge: string;
    imageUrl: string;
}

const vehiclesData: Vehicle[] = [
    {
        id: 1,
        title: "2024 Mercedes-Benz C300 4MATIC",
        make: "Mercedes-Benz",
        category: "Sedan",
        price: 48500,
        year: 2024,
        mileage: "4,200 mi",
        fuel: "Hybrid/Gas",
        transmission: "9-Spd Auto",
        badge: "Certified Pre-Owned",
        imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        title: "2023 BMW M4 Competition Coupe",
        make: "BMW",
        category: "Coupe",
        price: 76900,
        year: 2023,
        mileage: "8,900 mi",
        fuel: "Twin-Turbo 3.0L",
        transmission: "8-Spd M Steptronic",
        badge: "Clean Title",
        imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        title: "2024 Porsche 911 Carrera S",
        make: "Porsche",
        category: "Sports",
        price: 128500,
        year: 2024,
        mileage: "2,100 mi",
        fuel: "Gasoline",
        transmission: "PDK Automatic",
        badge: "Low Mileage",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 4,
        title: "2023 Audi RS6 Avant",
        make: "Audi",
        category: "Wagon",
        price: 114000,
        year: 2023,
        mileage: "11,500 mi",
        fuel: "4.0L V8 Twin-Turbo",
        transmission: "Tiptronic Auto",
        badge: "1-Owner",
        imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 5,
        title: "2024 Range Rover Sport HSE Dynamic",
        make: "Land Rover",
        category: "SUV",
        price: 93500,
        year: 2024,
        mileage: "6,400 mi",
        fuel: "Mild Hybrid 3.0L",
        transmission: "8-Spd Automatic",
        badge: "Certified Pre-Owned",
        imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 6,
        title: "2024 Tesla Model S Plaid",
        make: "Tesla",
        category: "Electric",
        price: 88900,
        year: 2024,
        mileage: "5,100 mi",
        fuel: "Tri-Motor Electric",
        transmission: "1-Spd Direct Drive",
        badge: "Zero Emissions",
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 7,
        title: "2023 Ford Mustang Mach 1",
        make: "Ford",
        category: "Coupe",
        price: 54900,
        year: 2023,
        mileage: "12,200 mi",
        fuel: "5.0L Coyote V8",
        transmission: "6-Spd Manual",
        badge: "Clean Carfax",
        imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 8,
        title: "2024 Lexus RX 500h F SPORT Performance",
        make: "Lexus",
        category: "SUV",
        price: 66500,
        year: 2024,
        mileage: "3,800 mi",
        fuel: "2.4L Turbo Hybrid",
        transmission: "6-Spd Direct Shift",
        badge: "Factory Warranty",
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 9,
        title: "2023 Chevrolet Corvette Stingray 3LT",
        make: "Chevrolet",
        category: "Sports",
        price: 79900,
        year: 2023,
        mileage: "7,300 mi",
        fuel: "6.2L LT2 V8",
        transmission: "8-Spd Dual-Clutch",
        badge: "Top Tier Spec",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    },
];

const categories = ["All", "SUV", "Sedan", "Coupe", "Sports", "Electric"];

export default function VehicleCatalog() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "year-desc">("featured");

    const filteredVehicles = useMemo(() => {
        return vehiclesData
            .filter((car) => {
                const matchesCategory =
                    selectedCategory === "All" || car.category === selectedCategory;
                const matchesSearch =
                    car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    car.make.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "price-asc") return a.price - b.price;
                if (sortBy === "price-desc") return b.price - a.price;
                if (sortBy === "year-desc") return b.year - a.year;
                return 0;
            });
    }, [selectedCategory, searchQuery, sortBy]);

    return (
        <section id="catalog" className="py-20 lg:py-24 bg-gray-50 font-poppins relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-vivid-red/10 text-vivid-red text-xs font-bold uppercase tracking-wider mb-2">
                            <span>Inventory Catalog</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#170a3d] tracking-tight">
                            Explore Vehicles For Sale
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            Filter through premium pre-owned and brand-new models available for immediate purchase or delivery.
                        </p>
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Search make, model..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red transition shadow-sm"
                            />
                            <svg
                                className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            aria-label="Sort vehicles"
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red transition shadow-sm cursor-pointer"
                        >
                            <option value="featured">Featured First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="year-desc">Newest Year</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills Filter */}
                <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm ${
                                selectedCategory === cat
                                    ? "bg-[#170a3d] text-white shadow-md scale-105"
                                    : "bg-white text-gray-600 hover:text-dark-blue hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Vehicle Grid */}
                {filteredVehicles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-red-50 text-vivid-red mx-auto flex items-center justify-center text-2xl mb-4">
                            🔍
                        </div>
                        <h3 className="text-lg font-bold text-dark-blue">No Vehicles Found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your search criteria or category filter.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                            }}
                            className="mt-4 px-5 py-2 rounded-full bg-vivid-red text-white text-xs font-semibold hover:bg-red-600 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVehicles.map((car) => (
                            <div
                                key={car.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1"
                            >
                                {/* Card Image */}
                                <div className="relative h-60 overflow-hidden bg-gray-100">
                                    <img
                                        src={car.imageUrl}
                                        alt={car.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm bg-vivid-red">
                                            For Sale
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-800 shadow-sm border border-gray-100">
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
                                        <h3 className="text-lg font-bold text-[#170a3d] line-clamp-1 group-hover:text-vivid-red transition">
                                            {car.title}
                                        </h3>

                                        {/* Specs Pills */}
                                        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 mt-4 py-3 border-y border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <span className="text-vivid-red">⛽</span>
                                                <span className="truncate">{car.fuel}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-vivid-red">⚙️</span>
                                                <span className="truncate">{car.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-vivid-red">🛣️</span>
                                                <span className="truncate">{car.mileage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price and Action */}
                                    <div className="flex items-center justify-between mt-6 pt-2">
                                        <div>
                                            <span className="text-xs uppercase text-gray-400 font-semibold block">
                                                Price
                                            </span>
                                            <span className="text-2xl font-extrabold text-[#170a3d]">
                                                ${car.price.toLocaleString()}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-vivid-red hover:bg-red-600 transition shadow-md hover:shadow-red-500/25 active:scale-95"
                                        >
                                            View Vehicle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
