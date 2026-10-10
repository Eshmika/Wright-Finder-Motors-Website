import { useState } from "react";

interface Vehicle {
    id: number;
    title: string;
    make: string;
    category: string;
    price: number;
    originalPrice?: number;
    fuel: string;
    powerOptions: string;
    driveline: string;
    mileage: string;
    transmission: string;
    condition: string;
    badge: string;
    images: string[];
}

const vehiclesData: Vehicle[] = [
    {
        id: 1,
        title: "2024 Mercedes-Benz C300 4MATIC",
        make: "Mercedes-Benz",
        category: "Sedan",
        price: 48500,
        originalPrice: 52900,
        fuel: "Mild Hybrid / Gas",
        powerOptions: "255 HP Turbo",
        driveline: "AWD (4MATIC)",
        mileage: "4,200 mi",
        transmission: "9-Speed Auto",
        condition: "Certified Pre-Owned",
        badge: "Special Offer",
        images: [
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 2,
        title: "2023 BMW M4 Competition Coupe",
        make: "BMW",
        category: "Coupe",
        price: 76900,
        originalPrice: 81500,
        fuel: "Twin-Turbo 3.0L",
        powerOptions: "503 HP S58",
        driveline: "RWD (M Differential)",
        mileage: "8,900 mi",
        transmission: "8-Speed M Steptronic",
        condition: "Clean Title",
        badge: "Hot Deal",
        images: [
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 3,
        title: "2024 Porsche 911 Carrera S",
        make: "Porsche",
        category: "Sports",
        price: 128500,
        originalPrice: 134000,
        fuel: "Twin-Turbo Boxer-6",
        powerOptions: "443 HP @ 6500",
        driveline: "Rear-Wheel Drive",
        mileage: "2,100 mi",
        transmission: "8-Speed PDK",
        condition: "Pristine / 1-Owner",
        badge: "Low Mileage",
        images: [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 4,
        title: "2023 Audi RS6 Avant Quattro",
        make: "Audi",
        category: "Wagon",
        price: 114000,
        fuel: "4.0L Twin-Turbo V8",
        powerOptions: "591 HP / 590 lb-ft",
        driveline: "Quattro All-Wheel",
        mileage: "11,500 mi",
        transmission: "8-Speed Tiptronic",
        condition: "Clean Carfax",
        badge: "1-Owner",
        images: [
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541348263662-e0c86666cb66?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 5,
        title: "2024 Range Rover Sport HSE Dynamic",
        make: "Land Rover",
        category: "SUV",
        price: 93500,
        originalPrice: 98000,
        fuel: "Mild Hybrid 3.0L",
        powerOptions: "395 HP Turbo i6",
        driveline: "Intelligent AWD",
        mileage: "6,400 mi",
        transmission: "8-Speed Automatic",
        condition: "Certified Pre-Owned",
        badge: "Price Drop",
        images: [
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 6,
        title: "2024 Tesla Model S Plaid",
        make: "Tesla",
        category: "Electric",
        price: 88900,
        fuel: "Tri-Motor Electric",
        powerOptions: "1,020 HP Peak",
        driveline: "All-Wheel Drive",
        mileage: "5,100 mi",
        transmission: "Direct Drive 1-Speed",
        condition: "Like Brand New",
        badge: "Zero Emissions",
        images: [
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1571127236794-81c1c2105151?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 7,
        title: "2023 Ford Mustang Mach 1",
        make: "Ford",
        category: "Coupe",
        price: 54900,
        originalPrice: 58500,
        fuel: "5.0L Coyote V8",
        powerOptions: "470 HP Naturally Asp.",
        driveline: "Rear-Wheel Drive",
        mileage: "12,200 mi",
        transmission: "TREMEC 6-Spd Manual",
        condition: "Certified Inspected",
        badge: "Performance Spec",
        images: [
            "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 8,
        title: "2024 Lexus RX 500h F SPORT Performance",
        make: "Lexus",
        category: "SUV",
        price: 66500,
        fuel: "2.4L Turbo Hybrid",
        powerOptions: "366 HP DIRECT4",
        driveline: "DIRECT4 AWD",
        mileage: "3,800 mi",
        transmission: "6-Speed Direct Shift",
        condition: "Factory Warranty",
        badge: "Verified History",
        images: [
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 9,
        title: "2023 Chevrolet Corvette Stingray 3LT",
        make: "Chevrolet",
        category: "Sports",
        price: 79900,
        originalPrice: 84900,
        fuel: "6.2L LT2 V8",
        powerOptions: "495 HP Z51 Pack",
        driveline: "Mid-Engine RWD",
        mileage: "7,300 mi",
        transmission: "8-Speed Dual-Clutch",
        condition: "100% Inspected",
        badge: "Special Deal",
        images: [
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 10,
        title: "2024 BMW X5 M60i xDrive",
        make: "BMW",
        category: "SUV",
        price: 89900,
        originalPrice: 94500,
        fuel: "4.4L TwinPower Turbo V8",
        powerOptions: "523 HP Mild-Hybrid",
        driveline: "xDrive Intelligent AWD",
        mileage: "4,600 mi",
        transmission: "8-Speed Sport Auto",
        condition: "Executive Demo",
        badge: "Pre-Owned",
        images: [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 11,
        title: "2023 Mercedes-AMG GT 53 4-Door",
        make: "Mercedes-Benz",
        category: "Sedan",
        price: 99800,
        fuel: "3.0L Turbo Inline-6",
        powerOptions: "429 HP EQ Boost",
        driveline: "AMG Performance 4MATIC+",
        mileage: "9,200 mi",
        transmission: "AMG SPEEDSHIFT 9-Spd",
        condition: "Certified Pre-Owned",
        badge: "Rare Find",
        images: [
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        ],
    },
    {
        id: 12,
        title: "2024 Jaguar F-Type R 75 Coupe",
        make: "Jaguar",
        category: "Sports",
        price: 104500,
        originalPrice: 112000,
        fuel: "5.0L Supercharged V8",
        powerOptions: "575 HP AWD",
        driveline: "All-Wheel Drive",
        mileage: "1,800 mi",
        transmission: "Quickshift 8-Speed",
        condition: "Collector Spec",
        badge: "Special Edition",
        images: [
            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80",
        ],
    },
];

const CARDS_PER_PAGE = 9;

function VehicleCard({ car }: { car: Vehicle }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? car.images.length - 1 : prev - 1,
        );
    };

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === car.images.length - 1 ? 0 : prev + 1,
        );
    };

    const discountAmount = car.originalPrice
        ? car.originalPrice - car.price
        : 0;
    const discountPercentage = car.originalPrice
        ? Math.round((discountAmount / car.originalPrice) * 100)
        : 0;

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1">
            {/* Vehicle Image Slider */}
            <div className="relative h-64 overflow-hidden bg-gray-900 select-none">
                <img
                    src={car.images[currentImageIndex]}
                    alt={`${car.title} - photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Subtle top/bottom image gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />

                {/* Badge Tag (top-right) */}
                {car.badge && (
                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-dark-blue shadow-md border border-white/60">
                        {car.badge}
                    </div>
                )}

                {/* Prev & Next Slider Arrows */}
                {car.images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prevImage}
                            aria-label="Previous vehicle photo"
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-vivid-red text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm opacity-80 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={nextImage}
                            aria-label="Next vehicle photo"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-vivid-red text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm opacity-80 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>

                        {/* Slider Dots Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                            {car.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    aria-label={`Go to image ${idx + 1}`}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${
                                        currentImageIndex === idx
                                            ? "w-4 bg-vivid-red"
                                            : "w-1.5 bg-white/70 hover:bg-white"
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-[#170a3d] line-clamp-1 group-hover:text-vivid-red transition-colors duration-200">
                        {car.title}
                    </h3>

                    {/* 3 Columns & 2 Rows Specs Grid with SVG Icons */}
                    <div className="grid grid-cols-3 gap-2.5 text-xs mt-4 pt-4 pb-4 border-y border-gray-100">
                        {/* 1. Fuel Type */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 14V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-4m0 0h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-8 2h4"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Fuel
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.fuel}
                            >
                                {car.fuel}
                            </span>
                        </div>

                        {/* 2. Power Options */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Power
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.powerOptions}
                            >
                                {car.powerOptions}
                            </span>
                        </div>

                        {/* 3. Driveline */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="12" r="3" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6M12 9v6"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Driveline
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.driveline}
                            >
                                {car.driveline}
                            </span>
                        </div>

                        {/* 4. Mileage */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Mileage
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.mileage}
                            >
                                {car.mileage} km
                            </span>
                        </div>

                        {/* 5. Transmission */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Gearbox
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.transmission}
                            >
                                {car.transmission}
                            </span>
                        </div>

                        {/* 6. Condition */}
                        <div className="flex flex-col bg-gray-50/90 rounded-xl p-2.5 hover:bg-red-50/50 transition-colors">
                            <div className="flex items-center space-x-1.5 text-vivid-red mb-1">
                                <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    State
                                </span>
                            </div>
                            <span
                                className="font-semibold text-gray-800 text-[11px] truncate"
                                title={car.condition}
                            >
                                {car.condition}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Display Section */}
                <div className="pt-4 mt-2">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                                Final Price
                            </span>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-xl font-black text-[#170a3d] tracking-tight">
                                    ${car.price.toLocaleString()}
                                </span>
                                {car.originalPrice && (
                                    <span className="text-sm font-semibold text-gray-400 line-through decoration-vivid-red/70 decoration-2">
                                        ${car.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Creative Discount Badge if discounted */}
                        {discountPercentage > 0 && (
                            <div className="flex flex-col items-end">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-vivid-red text-[11px] font-extrabold shadow-sm">
                                    <span>
                                        Save ${discountAmount.toLocaleString()}
                                    </span>
                                    <span className="bg-vivid-red text-white text-[9px] px-1 rounded-full">
                                        -{discountPercentage}%
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons: 1 Row with "Contact agent" & "Explore more" */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <a
                            href="#contact"
                            onClick={(e) => {
                                e.preventDefault();
                                const contactSection =
                                    document.getElementById("contact");
                                if (contactSection) {
                                    contactSection.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white text-xs font-bold transition-all duration-200 shadow-sm active:scale-95"
                        >
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            <span className="truncate">Contact Agent</span>
                        </a>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold transition-all duration-200 shadow-md hover:shadow-red-500/30 active:scale-95"
                        >
                            <span>Explore More</span>
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VehicleCatalog() {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(vehiclesData.length / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const currentVehicles = vehiclesData.slice(
        startIndex,
        startIndex + CARDS_PER_PAGE,
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const section = document.getElementById("catalog");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="catalog"
            className="py-20 bg-bggray font-poppins relative"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Centered Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Explore Vehicles For Sale
                    </h2>
                    <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Handpicked quality vehicles ready for immediate driving
                        or booking. Comprehensive specifications, certified
                        multi-point inspections, and transparent market pricing.
                    </p>
                </div>

                {/* Vehicle Grid (Max 9 cards shown per page) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentVehicles.map((car) => (
                        <VehicleCard key={car.id} car={car} />
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-white">
                        <p className="text-xs text-gray-300">
                            Showing{" "}
                            <span className="font-bold text-white">
                                {startIndex + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-white">
                                {Math.min(
                                    startIndex + CARDS_PER_PAGE,
                                    vehiclesData.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-white">
                                {vehiclesData.length}
                            </span>{" "}
                            vehicles
                        </p>

                        <div className="flex items-center space-x-2">
                            {/* Prev Page Button */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                aria-label="Previous page"
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                    currentPage === 1
                                        ? "bg-white/10 text-gray-400 cursor-not-allowed"
                                        : "bg-white/20 hover:bg-vivid-red text-white shadow"
                                }`}
                            >
                                <span>&larr;</span>
                                <span>Prev</span>
                            </button>

                            {/* Page Numbers */}
                            {Array.from(
                                { length: totalPages },
                                (_, idx) => idx + 1,
                            ).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                        currentPage === pageNum
                                            ? "bg-vivid-red text-white scale-105 shadow-red-500/30"
                                            : "bg-white/15 hover:bg-white/30 text-white"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Page Button */}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                aria-label="Next page"
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                                    currentPage === totalPages
                                        ? "bg-white/10 text-gray-400 cursor-not-allowed"
                                        : "bg-white/20 hover:bg-vivid-red text-white shadow"
                                }`}
                            >
                                <span>Next</span>
                                <span>&rarr;</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
