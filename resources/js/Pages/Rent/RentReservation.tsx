import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";
import { DetailedVehicle, fetchAllVehicles } from "@/Services/vehicleService";

interface RentReservationProps extends PageProps {
    id: string;
}

// Generate creative confirmation code e.g. WFM-2026-R8943K
function generateConfirmationNumber(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const currentYear = new Date().getFullYear();
    return `WFM-${currentYear}-R${randomPart}`;
}

export default function RentReservation({ auth, id }: RentReservationProps) {
    const [vehicle, setVehicle] = useState<DetailedVehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Multi-step form step: 1 = Your information, 2 = Location/Date & time, 3 = Payment option, 4 = Details
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Step 1: Your Information
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("25+");
    const [residency, setResidency] = useState("United States");

    // Step 2: Location/Date and time (EST)
    const [pickupLocationType, setPickupLocationType] = useState<
        "hub" | "other"
    >("hub");
    const [customPickupLocation, setCustomPickupLocation] = useState("");
    const defaultPickupHub = "Dayton,Ohio: Wright finder motors (primary hub)";
    const pickupLocation =
        pickupLocationType === "hub"
            ? defaultPickupHub
            : customPickupLocation.trim();

    const [pickupDate, setPickupDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    });
    const [pickupTime, setPickupTime] = useState("10:00 AM");

    const [returnLocationType, setReturnLocationType] = useState<
        "same" | "hub" | "other"
    >("same");
    const [customReturnLocation, setCustomReturnLocation] = useState("");
    const returnLocation =
        returnLocationType === "same"
            ? pickupLocation || defaultPickupHub
            : returnLocationType === "hub"
              ? defaultPickupHub
              : customReturnLocation.trim();

    const [returnDate, setReturnDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return d.toISOString().split("T")[0];
    });
    const [returnTime, setReturnTime] = useState("10:00 AM");

    // Step 3: Payment option
    const [paymentMethod, setPaymentMethod] = useState<
        "zelle" | "cashapp" | "in_person"
    >("zelle");

    // Step 4: Details & Terms Agreement
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [specialNotes, setSpecialNotes] = useState("");

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationResult, setReservationResult] = useState<{
        confirmationNumber: string;
        paymentStatus: string;
    } | null>(null);

    // Active image preview in car details
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Validation error messages
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    // Load vehicle details
    useEffect(() => {
        let isMounted = true;
        async function loadCar() {
            try {
                setIsLoading(true);
                setError(null);
                const all = await fetchAllVehicles();
                const decodedId = decodeURIComponent(id || "")
                    .trim()
                    .toLowerCase();
                const found = all.find(
                    (v) =>
                        v.id.trim().toLowerCase() === decodedId ||
                        encodeURIComponent(v.id.trim().toLowerCase()) ===
                            decodedId,
                );

                if (!found) {
                    if (isMounted) {
                        setError(
                            "Vehicle not found or no longer available for rent.",
                        );
                        setIsLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    setVehicle(found);
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Failed to load vehicle:", err);
                if (isMounted) {
                    setError("Failed to load vehicle information.");
                    setIsLoading(false);
                }
            }
        }

        loadCar();
        return () => {
            isMounted = false;
        };
    }, [id]);

    // Format phone number as user types: (XXX) XXX-XXXX
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        let formatted = raw;
        if (raw.length > 0) {
            if (raw.length <= 3) {
                formatted = `(${raw}`;
            } else if (raw.length <= 6) {
                formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
            } else {
                formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
            }
        }
        setPhone(formatted);
        if (validationErrors.phone) {
            setValidationErrors((prev) => ({ ...prev, phone: "" }));
        }
    };

    // Calculate Rental Days
    const calculateRentalDays = () => {
        try {
            const start = new Date(pickupDate);
            const end = new Date(returnDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 1;
        } catch {
            return 1;
        }
    };

    const rentalDays = calculateRentalDays();
    const baseDailyRate = vehicle ? vehicle.price : 0;
    const originalDailyRate =
        vehicle && vehicle.originalPrice > 0
            ? vehicle.originalPrice
            : baseDailyRate;
    const hasDiscount = vehicle && vehicle.discount > 0;
    const dailyDiscount =
        hasDiscount && vehicle
            ? vehicle.discount
            : originalDailyRate > baseDailyRate
              ? originalDailyRate - baseDailyRate
              : 0;
    const totalSavings = dailyDiscount * rentalDays;
    const totalBeforeDiscount = originalDailyRate * rentalDays;
    const totalEstimate = baseDailyRate * rentalDays;

    // Step Validation
    const validateStep = (step: number): boolean => {
        const errors: Record<string, string> = {};

        if (step === 1) {
            if (!firstName.trim()) errors.firstName = "First name is required.";
            if (!lastName.trim()) errors.lastName = "Last name is required.";
            if (!email.trim()) {
                errors.email = "Email is required.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = "Please enter a valid email address.";
            }
            const phoneDigits = phone.replace(/\D/g, "");
            if (phone.trim() && phoneDigits.length < 10) {
                errors.phone = "Please enter a valid 10-digit mobile number.";
            }
            if (!age.trim())
                errors.age = "Please select your age qualification.";
            if (!residency.trim())
                errors.residency = "Residency status is required.";
        }

        if (step === 2) {
            if (
                pickupLocationType === "other" &&
                !customPickupLocation.trim()
            ) {
                errors.pickupLocation = "Please specify your pickup location.";
            } else if (!pickupLocation.trim()) {
                errors.pickupLocation = "Pickup location is required.";
            }
            if (!pickupDate) errors.pickupDate = "Pickup date is required.";
            if (!pickupTime) errors.pickupTime = "Pickup time is required.";
            if (
                returnLocationType === "other" &&
                !customReturnLocation.trim()
            ) {
                errors.returnLocation = "Please specify your return location.";
            } else if (!returnLocation.trim()) {
                errors.returnLocation = "Return location is required.";
            }
            if (!returnDate) errors.returnDate = "Return date is required.";
            if (!returnTime) errors.returnTime = "Return time is required.";

            if (
                pickupDate &&
                returnDate &&
                new Date(returnDate) < new Date(pickupDate)
            ) {
                errors.returnDate =
                    "Return date must be on or after pickup date.";
            }
        }

        if (step === 3) {
            if (!paymentMethod)
                errors.paymentMethod = "Please select a payment option.";
        }

        if (step === 4) {
            if (!acceptedTerms)
                errors.acceptedTerms =
                    "You must agree to the policy and prepaid terms.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
            window.scrollTo({ top: 300, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setValidationErrors({});
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 300, behavior: "smooth" });
    };

    // Submit Reservation
    const handleSubmitReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(4)) return;

        setIsSubmitting(true);
        const confirmationNum = generateConfirmationNumber();

        const payload = {
            confirmationNumber: confirmationNum,
            carId: vehicle?.id || id,
            carTitle: vehicle
                ? `${vehicle.year ? vehicle.year + " " : ""}${vehicle.make} ${vehicle.model}`
                : "Vehicle Rental",
            carMake: vehicle?.make || "",
            carModel: vehicle?.model || "",
            carYear: vehicle?.year?.toString() || "",
            rentalRate: baseDailyRate,
            discount: totalSavings,
            totalEstimate: totalEstimate,
            firstName,
            lastName,
            email,
            phone,
            age,
            residency,
            pickupLocation,
            pickupDate,
            pickupTime,
            returnLocation,
            returnDate,
            returnTime,
            paymentOption:
                paymentMethod === "zelle"
                    ? "Zelle (contact@wrightfindermotors.com)"
                    : paymentMethod === "cashapp"
                      ? "Cash App (937 475 4737)"
                      : "In Person / Cash at Pickup",
            paymentStatus: "No payment received (Pending Reservation)",
            notes: specialNotes,
        };

        try {
            // Send reservation to Laravel backend API endpoint
            const res = await fetch("/rent/reserve", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || "",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            setReservationResult({
                confirmationNumber: confirmationNum,
                paymentStatus: "No payment received (Pending Reservation)",
            });
            window.scrollTo({ top: 150, behavior: "smooth" });
        } catch (err) {
            console.error("Reservation submission error:", err);
            // Even on network error, ensure user confirmation number is presented
            setReservationResult({
                confirmationNumber: confirmationNum,
                paymentStatus: "No payment received (Pending Reservation)",
            });
            window.scrollTo({ top: 150, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, name: "Your Information", subtitle: "Driver details" },
        { id: 2, name: "Location/Date and time", subtitle: "EST Schedule" },
        { id: 3, name: "Payment Option", subtitle: "Select method" },
        { id: 4, name: "Details & Confirm", subtitle: "Review & Policies" },
    ];

    // Progress bar percentage calculation
    const progressPercentage = Math.round((currentStep / 4) * 100);

    return (
        <div className="min-h-screen flex flex-col bg-gray-200 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white print:bg-white print:text-black">
            <Head
                title={
                    vehicle
                        ? `Book & Reserve: ${vehicle.make} ${vehicle.model} - Wright Finder Motors`
                        : "Vehicle Reservation - Wright Finder Motors"
                }
            />

            {/* Header */}
            <div className="print:hidden">
                <Header user={auth?.user} />
            </div>

            {/* Main Reservation Flow */}
            <main className="flex-1 py-6 sm:py-10 md:py-16 print:py-0 print:m-0">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 print:p-0 print:max-w-full">
                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs text-bggray font-medium mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap py-1 scrollbar-none print:hidden">
                        <Link
                            href="/"
                            className="hover:text-vivid-red transition shrink-0"
                        >
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/rent"
                            className="hover:text-vivid-red transition shrink-0"
                        >
                            Rent Catalog
                        </Link>
                        <span>/</span>
                        <span className="text-[#170a3d] font-bold shrink-0">
                            Booking &amp; Reservation
                        </span>
                    </div>

                    {/* Page Header */}
                    <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 print:hidden px-2">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-vivid-red/10 text-vivid-red border border-vivid-red/20 mb-2 sm:mb-3">
                            Direct Online Reservation
                        </span>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#170a3d] tracking-tight leading-tight">
                            Vehicle Reservation &amp; Booking
                        </h1>
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-bggray leading-relaxed">
                            Lock in your special discounted rate with immediate
                            priority reservation.
                        </p>
                    </div>

                    {/* SUCCESS CONFIRMATION MODAL / BANNER (Printable Receipt) */}
                    {reservationResult && (
                        <div className="mb-12 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white border-2 border-emerald-400 shadow-2xl animate-fade-in text-center max-w-3xl mx-auto print:m-0 print:p-6 print:border-2 print:border-slate-800 print:shadow-none print:rounded-2xl print:max-w-full">
                            {/* Receipt Company Header for Print */}
                            <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6 text-left">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        Wright Finder Motors
                                    </h1>
                                    <p className="text-xs text-slate-600">
                                        Quality Vehicle Sales &amp; Rentals |
                                        Official Rental Receipt
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        contact@wrightfindermotors.com
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-slate-900 bg-slate-100 text-slate-900">
                                        Rental Reservation
                                    </span>
                                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                                        {new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            },
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-inner print:w-12 print:h-12 print:mb-3">
                                <svg
                                    className="w-7 h-7 sm:w-10 sm:h-10 print:w-6 print:h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 mb-3 print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                                {reservationResult.paymentStatus}
                            </span>

                            <h2 className="text-xl sm:text-3xl font-extrabold text-[#170a3d] print:text-slate-900 print:text-2xl">
                                Reservation Successfully Placed!
                            </h2>

                            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto print:text-slate-700">
                                Thank you,{" "}
                                <span className="font-bold text-gray-800 print:text-black">
                                    {firstName} {lastName}
                                </span>
                                ! We have saved your reservation details to our
                                booking sheet.
                            </p>

                            <div className="my-4 sm:my-6 p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border border-gray-200 inline-block shadow-inner print:my-4 print:py-3 print:px-6 print:border-slate-400 print:bg-slate-50 w-full sm:w-auto">
                                <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-gray-500 print:text-slate-600 mb-1">
                                    Your Confirmation Number
                                </div>
                                <div className="text-xl sm:text-3xl font-mono font-black text-vivid-red print:text-slate-900 tracking-wider break-all">
                                    {reservationResult.confirmationNumber}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left max-w-xl mx-auto p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 mb-6 sm:mb-8 print:mb-4 print:border-slate-300 print:bg-white print:p-4 print:grid-cols-2">
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Vehicle:
                                    </span>
                                    <span>
                                        {vehicle
                                            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                                            : "Selected Vehicle"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Payment Status:
                                    </span>
                                    <span className="font-semibold text-amber-600 print:text-slate-900">
                                        {reservationResult.paymentStatus}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Pickup Date &amp; Time (EST):
                                    </span>
                                    <span>
                                        {pickupDate} at {pickupTime}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Return Date &amp; Time (EST):
                                    </span>
                                    <span>
                                        {returnDate} at {returnTime}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Pickup Location:
                                    </span>
                                    <span className="break-words">
                                        {pickupLocation}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Return Location:
                                    </span>
                                    <span className="break-words">
                                        {returnLocation}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Primary Driver:
                                    </span>
                                    <span>
                                        {firstName} {lastName} ({phone})
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Email:
                                    </span>
                                    <span className="break-all">{email}</span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Selected Payment Method:
                                    </span>
                                    <span className="capitalize break-words">
                                        {paymentMethod === "zelle"
                                            ? "Zelle (contact@wrightfindermotors.com)"
                                            : paymentMethod === "cashapp"
                                              ? "Cash App (937 475 4737)"
                                              : "In Person / Cash at Pickup"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold block text-slate-900">
                                        Total Rate ({rentalDays}{" "}
                                        {rentalDays === 1 ? "day" : "days"}):
                                    </span>
                                    <span className="font-bold text-emerald-600 print:text-black">
                                        ${totalEstimate.toLocaleString()} (Saved
                                        ${totalSavings.toLocaleString()})
                                    </span>
                                </div>
                            </div>

                            {/* Print Footer Notice */}
                            <div className="hidden print:block text-center text-[10px] text-slate-500 pt-3 border-t border-slate-300">
                                Please present this confirmation receipt upon
                                vehicle pickup along with your valid
                                Driver&apos;s License and Payment.
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 print:hidden">
                                <Link
                                    href="/rent"
                                    className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold shadow-md transition"
                                >
                                    Back to Rent Catalog
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
                                >
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    )}

                    {!reservationResult && (
                        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start print:hidden">
                            {/* LEFT SIDE: MULTI-STEP RESERVATION WIZARD (7 cols on lg, full on mobile/tablet) */}
                            <div className="w-full lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-4 sm:p-6 md:p-8">
                                {/* Top Step Navigator with 4 Sections */}
                                <div className="mb-6 sm:mb-8">
                                    {/* Section Steps Header (Responsive Grid: 2 cols on very small screens, 4 on sm+) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                        {steps.map((s) => {
                                            const isActive =
                                                currentStep === s.id;
                                            const isDone = currentStep > s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        // Allow jumping back to previously filled steps
                                                        if (
                                                            s.id < currentStep
                                                        ) {
                                                            setCurrentStep(
                                                                s.id,
                                                            );
                                                        }
                                                    }}
                                                    className={`text-left p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all ${
                                                        isActive
                                                            ? "bg-red-50 border border-vivid-red/30 shadow-xs ring-1 ring-vivid-red/20"
                                                            : isDone
                                                              ? "bg-emerald-50/70 border border-emerald-200 cursor-pointer"
                                                              : "bg-gray-50/80 border border-transparent opacity-60 cursor-not-allowed"
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-1.5 mb-1">
                                                        <div
                                                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0 ${
                                                                isActive
                                                                    ? "bg-vivid-red text-white"
                                                                    : isDone
                                                                      ? "bg-emerald-500 text-white"
                                                                      : "bg-gray-300 text-gray-600"
                                                            }`}
                                                        >
                                                            {isDone
                                                                ? "✓"
                                                                : s.id}
                                                        </div>
                                                        <span
                                                            className={`text-[9px] sm:text-[10px] uppercase font-black truncate ${
                                                                isActive
                                                                    ? "text-vivid-red"
                                                                    : isDone
                                                                      ? "text-emerald-700"
                                                                      : "text-gray-400"
                                                            }`}
                                                        >
                                                            Step {s.id}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 truncate leading-tight">
                                                        {s.name}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Filling Progress Bar */}
                                    <div className="w-full bg-gray-100 h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-vivid-red to-red-500 transition-all duration-500 rounded-full"
                                            style={{
                                                width: `${progressPercentage}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-semibold text-gray-400 mt-1.5">
                                        <span className="truncate pr-2">
                                            Step {currentStep} of 4:{" "}
                                            {steps[currentStep - 1].name}
                                        </span>
                                        <span className="text-vivid-red font-bold shrink-0">
                                            {progressPercentage}% Completed
                                        </span>
                                    </div>
                                </div>

                                {/* SECTION CONTENT */}
                                <form
                                    onSubmit={handleSubmitReservation}
                                    className="space-y-6"
                                >
                                    {/* ================= STEP 1: YOUR INFORMATION ================= */}
                                    {currentStep === 1 && (
                                        <div className="space-y-5 animate-fade-in">
                                            <div className="border-b border-gray-100 pb-3">
                                                <h2 className="text-xl font-black text-[#170a3d] flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-lg bg-vivid-red text-white flex items-center justify-center text-xs">
                                                        1
                                                    </span>
                                                    Your Information
                                                </h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Please provide the primary
                                                    driver's verified contact
                                                    information.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* First Name */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        First Name{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) =>
                                                            setFirstName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="John"
                                                        className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                                                            validationErrors.firstName
                                                                ? "border-red-500"
                                                                : "border-gray-200 focus:border-vivid-red"
                                                        }`}
                                                    />
                                                    {validationErrors.firstName && (
                                                        <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                            {
                                                                validationErrors.firstName
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Last Name */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Last Name{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) =>
                                                            setLastName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Doe"
                                                        className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                                                            validationErrors.lastName
                                                                ? "border-red-500"
                                                                : "border-gray-200 focus:border-vivid-red"
                                                        }`}
                                                    />
                                                    {validationErrors.lastName && (
                                                        <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                            {
                                                                validationErrors.lastName
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Email Address */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Email Address{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) =>
                                                            setEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="john.doe@example.com"
                                                        className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                                                            validationErrors.email
                                                                ? "border-red-500"
                                                                : "border-gray-200 focus:border-vivid-red"
                                                        }`}
                                                    />
                                                    {validationErrors.email && (
                                                        <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                            {
                                                                validationErrors.email
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Mobile Number (Phone format, Optional) */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Mobile Number{" "}
                                                        <span className="text-gray-400 font-normal lowercase text-[11px]">
                                                            (optional)
                                                        </span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="tel"
                                                            value={phone}
                                                            onChange={
                                                                handlePhoneChange
                                                            }
                                                            placeholder="(555) 123-4567"
                                                            maxLength={14}
                                                            className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono ${
                                                                validationErrors.phone
                                                                    ? "border-red-500"
                                                                    : "border-gray-200 focus:border-vivid-red"
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                                                        Format: (XXX) XXX-XXXX
                                                    </span>
                                                    {validationErrors.phone && (
                                                        <p className="text-red-500 text-[10px] mt-0.5 font-semibold">
                                                            {
                                                                validationErrors.phone
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Age (25+) */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Driver Age{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <select
                                                        value={age}
                                                        onChange={(e) =>
                                                            setAge(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                    >
                                                        <option value="25+">
                                                            25 years or older
                                                            (Standard Rental)
                                                        </option>
                                                        <option value="21-24">
                                                            21 - 24 years (Young
                                                            driver policy
                                                            applies)
                                                        </option>
                                                    </select>
                                                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                                                        Standard rental requires
                                                        minimum age 25+
                                                    </span>
                                                </div>

                                                {/* Residency */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Residency{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <select
                                                        value={residency}
                                                        onChange={(e) =>
                                                            setResidency(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                    >
                                                        <option value="United States">
                                                            United States
                                                            Resident (US
                                                            Driver's License)
                                                        </option>
                                                        <option value="Canada">
                                                            Canada Resident
                                                        </option>
                                                        <option value="International">
                                                            International
                                                            Resident (Passport
                                                            &amp; Int. Permit)
                                                        </option>
                                                        <option value="Other">
                                                            Other Country
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ================= STEP 2: LOCATION / DATE AND TIME (EST) ================= */}
                                    {currentStep === 2 && (
                                        <div className="space-y-5 animate-fade-in">
                                            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-xl font-black text-[#170a3d] flex items-center gap-2">
                                                        <span className="w-7 h-7 rounded-lg bg-vivid-red text-white flex items-center justify-center text-xs">
                                                            2
                                                        </span>
                                                        Location / Date and Time
                                                    </h2>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        All times are scheduled
                                                        in{" "}
                                                        <strong>
                                                            Eastern Standard
                                                            Time (EST)
                                                        </strong>
                                                        .
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border border-slate-200">
                                                    EST Timezone
                                                </span>
                                            </div>

                                            {/* Pickup Details */}
                                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                                                <div className="flex items-center space-x-2 text-dark-blue font-bold text-xs uppercase tracking-wider">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                    <span>Pickup Schedule</span>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Pickup Location{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <select
                                                        value={
                                                            pickupLocationType
                                                        }
                                                        onChange={(e) => {
                                                            const val = e.target
                                                                .value as
                                                                | "hub"
                                                                | "other";
                                                            setPickupLocationType(
                                                                val,
                                                            );
                                                        }}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                    >
                                                        <option value="hub">
                                                            Dayton,Ohio: Wright
                                                            finder motors
                                                            (primary hub)
                                                        </option>
                                                        <option value="other">
                                                            Other (type custom
                                                            location)
                                                        </option>
                                                    </select>

                                                    {pickupLocationType ===
                                                        "other" && (
                                                        <div className="mt-2.5">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    customPickupLocation
                                                                }
                                                                onChange={(e) =>
                                                                    setCustomPickupLocation(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Enter your custom pickup address / city..."
                                                                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium ${
                                                                    validationErrors.pickupLocation
                                                                        ? "border-red-500"
                                                                        : "border-gray-200 focus:border-vivid-red"
                                                                }`}
                                                            />
                                                            {validationErrors.pickupLocation && (
                                                                <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                                    {
                                                                        validationErrors.pickupLocation
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                            Pickup Date{" "}
                                                            <span className="text-vivid-red">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={pickupDate}
                                                            onChange={(e) =>
                                                                setPickupDate(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                            Pickup Time (EST){" "}
                                                            <span className="text-vivid-red">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            value={pickupTime}
                                                            onChange={(e) =>
                                                                setPickupTime(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                        >
                                                            {[
                                                                "08:00 AM",
                                                                "09:00 AM",
                                                                "10:00 AM",
                                                                "11:00 AM",
                                                                "12:00 PM",
                                                                "01:00 PM",
                                                                "02:00 PM",
                                                                "03:00 PM",
                                                                "04:00 PM",
                                                                "05:00 PM",
                                                                "06:00 PM",
                                                                "07:00 PM",
                                                            ].map((t) => (
                                                                <option
                                                                    key={t}
                                                                    value={t}
                                                                >
                                                                    {t} EST
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Return Details */}
                                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                                                <div className="flex items-center space-x-2 text-dark-blue font-bold text-xs uppercase tracking-wider">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-vivid-red" />
                                                    <span>Return Schedule</span>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                        Return Location{" "}
                                                        <span className="text-vivid-red">
                                                            *
                                                        </span>
                                                    </label>
                                                    <select
                                                        value={
                                                            returnLocationType
                                                        }
                                                        onChange={(e) => {
                                                            const val = e.target
                                                                .value as
                                                                | "same"
                                                                | "hub"
                                                                | "other";
                                                            setReturnLocationType(
                                                                val,
                                                            );
                                                        }}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                    >
                                                        <option value="same">
                                                            Same as Pickup
                                                            Location
                                                        </option>
                                                        <option value="hub">
                                                            Dayton,Ohio: Wright
                                                            finder motors
                                                            (primary hub)
                                                        </option>
                                                        <option value="other">
                                                            Other (type custom
                                                            location)
                                                        </option>
                                                    </select>

                                                    {returnLocationType ===
                                                        "other" && (
                                                        <div className="mt-2.5">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    customReturnLocation
                                                                }
                                                                onChange={(e) =>
                                                                    setCustomReturnLocation(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Enter your custom return address / city..."
                                                                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium ${
                                                                    validationErrors.returnLocation
                                                                        ? "border-red-500"
                                                                        : "border-gray-200 focus:border-vivid-red"
                                                                }`}
                                                            />
                                                            {validationErrors.returnLocation && (
                                                                <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                                    {
                                                                        validationErrors.returnLocation
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                            Return Date{" "}
                                                            <span className="text-vivid-red">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={returnDate}
                                                            onChange={(e) =>
                                                                setReturnDate(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                                                                validationErrors.returnDate
                                                                    ? "border-red-500"
                                                                    : "border-gray-200 focus:border-vivid-red"
                                                            }`}
                                                        />
                                                        {validationErrors.returnDate && (
                                                            <p className="text-red-500 text-[10px] mt-1 font-semibold">
                                                                {
                                                                    validationErrors.returnDate
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                            Return Time (EST){" "}
                                                            <span className="text-vivid-red">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            value={returnTime}
                                                            onChange={(e) =>
                                                                setReturnTime(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red font-medium"
                                                        >
                                                            {[
                                                                "08:00 AM",
                                                                "09:00 AM",
                                                                "10:00 AM",
                                                                "11:00 AM",
                                                                "12:00 PM",
                                                                "01:00 PM",
                                                                "02:00 PM",
                                                                "03:00 PM",
                                                                "04:00 PM",
                                                                "05:00 PM",
                                                                "06:00 PM",
                                                                "07:00 PM",
                                                            ].map((t) => (
                                                                <option
                                                                    key={t}
                                                                    value={t}
                                                                >
                                                                    {t} EST
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Days Summary Pill */}
                                            <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center justify-between text-xs text-slate-800">
                                                <span className="font-semibold">
                                                    Calculated Rental Duration:
                                                </span>
                                                <span className="font-extrabold text-vivid-red">
                                                    {rentalDays}{" "}
                                                    {rentalDays === 1
                                                        ? "Day"
                                                        : "Days"}{" "}
                                                    (EST Schedule)
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* ================= STEP 3: PAYMENT OPTION ================= */}
                                    {currentStep === 3 && (
                                        <div className="space-y-5 animate-fade-in">
                                            <div className="border-b border-gray-100 pb-3">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-black text-[#170a3d] flex items-center gap-2">
                                                        <span className="w-7 h-7 rounded-lg bg-vivid-red text-white flex items-center justify-center text-xs">
                                                            3
                                                        </span>
                                                        Payment Option
                                                    </h2>
                                                    {/* Payment Gateway Coming Soon Label */}
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                        Payment Gateway Coming
                                                        Soon
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Choose your preferred manual
                                                    payment method to reserve.
                                                    All reservation deposits and
                                                    pre-payments are verified by
                                                    our finance team.
                                                </p>
                                            </div>

                                            {/* Informational Alert */}
                                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                                                <svg
                                                    className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <div className="leading-relaxed">
                                                    <strong className="block font-bold mb-0.5">
                                                        Online Credit Card
                                                        Gateway Coming Soon
                                                    </strong>
                                                    Direct instant card
                                                    processing is currently
                                                    integrating. In the
                                                    meantime, you can easily pay
                                                    via <strong>Zelle</strong>,{" "}
                                                    <strong>Cash App</strong>,
                                                    or{" "}
                                                    <strong>
                                                        In-Person / Cash
                                                    </strong>{" "}
                                                    at vehicle pickup!
                                                </div>
                                            </div>

                                            {/* Payment Options Radio Cards */}
                                            <div className="space-y-3">
                                                {/* Option 1: Zelle */}
                                                <label
                                                    className={`block p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        paymentMethod ===
                                                        "zelle"
                                                            ? "border-vivid-red bg-red-50/40 shadow-sm ring-1 ring-vivid-red/20"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            name="paymentOption"
                                                            value="zelle"
                                                            checked={
                                                                paymentMethod ===
                                                                "zelle"
                                                            }
                                                            onChange={() =>
                                                                setPaymentMethod(
                                                                    "zelle",
                                                                )
                                                            }
                                                            className="mt-1 text-vivid-red focus:ring-vivid-red shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                                <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                                                                    Zelle
                                                                    Payment
                                                                </span>
                                                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-purple/10 text-purple uppercase shrink-0">
                                                                    Recommended
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                                                                Send payment
                                                                directly through
                                                                your banking app
                                                                with 0
                                                                transaction
                                                                fees.
                                                            </p>
                                                            <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-gray-50 sm:bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs">
                                                                <span className="text-gray-500 font-medium text-[11px] sm:text-xs">
                                                                    Zelle
                                                                    Recipient
                                                                    Email:
                                                                </span>
                                                                <span className="font-mono font-bold text-dark-blue select-all bg-white sm:bg-gray-100 px-2 py-1 rounded text-[11px] sm:text-xs break-all sm:break-normal inline-block">
                                                                    contact@wrightfindermotors.com
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>

                                                {/* Option 2: Cash App */}
                                                <label
                                                    className={`block p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        paymentMethod ===
                                                        "cashapp"
                                                            ? "border-vivid-red bg-red-50/40 shadow-sm ring-1 ring-vivid-red/20"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            name="paymentOption"
                                                            value="cashapp"
                                                            checked={
                                                                paymentMethod ===
                                                                "cashapp"
                                                            }
                                                            onChange={() =>
                                                                setPaymentMethod(
                                                                    "cashapp",
                                                                )
                                                            }
                                                            className="mt-1 text-vivid-red focus:ring-vivid-red shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                                <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                                                                    Cash App
                                                                </span>
                                                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase shrink-0">
                                                                    Fast Mobile
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                                                                Pay through Cash
                                                                App using our
                                                                verified
                                                                recipient phone
                                                                number.
                                                            </p>
                                                            <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-gray-50 sm:bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs">
                                                                <span className="text-gray-500 font-medium text-[11px] sm:text-xs">
                                                                    Cash App
                                                                    Recipient
                                                                    Phone:
                                                                </span>
                                                                <span className="font-mono font-bold text-dark-blue select-all bg-white sm:bg-gray-100 px-2 py-1 rounded text-[11px] sm:text-xs break-all sm:break-normal inline-block">
                                                                    (937)
                                                                    475-4737
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>

                                                {/* Option 3: In Person / Cash */}
                                                <label
                                                    className={`block p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        paymentMethod ===
                                                        "in_person"
                                                            ? "border-vivid-red bg-red-50/40 shadow-sm ring-1 ring-vivid-red/20"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            name="paymentOption"
                                                            value="in_person"
                                                            checked={
                                                                paymentMethod ===
                                                                "in_person"
                                                            }
                                                            onChange={() =>
                                                                setPaymentMethod(
                                                                    "in_person",
                                                                )
                                                            }
                                                            className="mt-1 text-vivid-red focus:ring-vivid-red shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                                <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                                                                    In Person /
                                                                    Cash
                                                                </span>
                                                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase shrink-0">
                                                                    Pay At
                                                                    Pickup
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                                                                Pay in person
                                                                with cash or
                                                                card upon
                                                                arrival at
                                                                vehicle pickup
                                                                inspection.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* ================= STEP 4: DETAILS, SUMMARY, POLICIES & RESERVE ================= */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="border-b border-gray-100 pb-3">
                                                <h2 className="text-xl font-black text-[#170a3d] flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-lg bg-vivid-red text-white flex items-center justify-center text-xs">
                                                        4
                                                    </span>
                                                    Review Details &amp;
                                                    Confirmation
                                                </h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Review complete reservation
                                                    summary, cancellation
                                                    policy, and rental hold
                                                    requirements before
                                                    reserving.
                                                </p>
                                            </div>

                                            {/* Summary Cards Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Person Details */}
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs space-y-1.5">
                                                    <div className="font-bold text-[#170a3d] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                                                        <span>👤</span> Person
                                                        Details
                                                    </div>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Name:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {firstName}{" "}
                                                            {lastName}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Email:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {email}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Mobile:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {phone}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Age:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {age}
                                                        </strong>{" "}
                                                        |{" "}
                                                        <span className="text-gray-500">
                                                            Residency:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {residency}
                                                        </strong>
                                                    </p>
                                                </div>

                                                {/* Car Details */}
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs space-y-1.5">
                                                    <div className="font-bold text-[#170a3d] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                                                        <span>🚗</span> Car
                                                        Details
                                                    </div>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Vehicle:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {vehicle
                                                                ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                                                                : "Selected Car"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Stock ID:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            #{vehicle?.id}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Transmission:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {vehicle?.transmission ||
                                                                "Automatic"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Fuel:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {vehicle?.fuelType ||
                                                                "Standard"}
                                                        </strong>
                                                    </p>
                                                </div>

                                                {/* Pickup Details */}
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs space-y-1.5">
                                                    <div className="font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-emerald-700">
                                                        <span>📍</span> Pickup
                                                        Details (EST)
                                                    </div>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Location:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {pickupLocation}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Date:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {pickupDate}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Time:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {pickupTime} (EST)
                                                        </strong>
                                                    </p>
                                                </div>

                                                {/* Return Details */}
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs space-y-1.5">
                                                    <div className="font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-vivid-red">
                                                        <span>🏁</span> Return
                                                        Details (EST)
                                                    </div>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Location:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {returnLocation}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Date:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {returnDate}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-gray-500">
                                                            Time:
                                                        </span>{" "}
                                                        <strong className="text-gray-800">
                                                            {returnTime} (EST)
                                                        </strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Pricing Breakdown Card: Base Rate, Rental Days & Savings Discount */}
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#170a3d] text-white shadow-lg space-y-3">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                                                        Rate Breakdown &amp;
                                                        Savings
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/30">
                                                        Pay Now Discount Applied
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between text-slate-300">
                                                        <span>
                                                            Daily Rental Rate:
                                                        </span>
                                                        <span className="font-bold text-white">
                                                            $
                                                            {baseDailyRate.toLocaleString()}{" "}
                                                            / day
                                                        </span>
                                                    </div>

                                                    {originalDailyRate >
                                                        baseDailyRate && (
                                                        <div className="flex justify-between text-slate-400 line-through">
                                                            <span>
                                                                Standard
                                                                Original Rate:
                                                            </span>
                                                            <span>
                                                                $
                                                                {originalDailyRate.toLocaleString()}{" "}
                                                                / day
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between text-slate-300">
                                                        <span>
                                                            Rental Duration:
                                                        </span>
                                                        <span className="font-bold text-white">
                                                            {rentalDays}{" "}
                                                            {rentalDays === 1
                                                                ? "Day"
                                                                : "Days"}
                                                        </span>
                                                    </div>

                                                    {totalSavings > 0 && (
                                                        <div className="flex justify-between text-emerald-400 font-extrabold text-sm pt-1">
                                                            <span>
                                                                Total Pay Now
                                                                Savings:
                                                            </span>
                                                            <span>
                                                                - $
                                                                {totalSavings.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-baseline pt-3 border-t border-white/15">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-extrabold text-white">
                                                                Estimated Total:
                                                            </span>
                                                            {totalBeforeDiscount >
                                                                totalEstimate && (
                                                                <span className="text-[11px] text-slate-400 font-medium">
                                                                    Total before
                                                                    discount:{" "}
                                                                    <span className="line-through decoration-vivid-red/70 decoration-1 text-slate-400">
                                                                        $
                                                                        {totalBeforeDiscount.toLocaleString()}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <div className="flex items-baseline gap-2">
                                                                {totalBeforeDiscount >
                                                                    totalEstimate && (
                                                                    <span className="text-sm font-bold text-slate-400 line-through decoration-vivid-red/80 decoration-2">
                                                                        $
                                                                        {totalBeforeDiscount.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                <div className="text-2xl font-black text-white tracking-tight">
                                                                    $
                                                                    {totalEstimate.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                                Taxes and
                                                                refundable hold
                                                                calculated at
                                                                pickup
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ================= ATTACHED PHOTO CONTENT: POLICY TABLE & BULLETS ================= */}
                                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                                                <div className="bg-slate-100/90 px-4 py-3 border-b border-gray-200 font-extrabold text-xs text-slate-900 tracking-wide uppercase">
                                                    Cancellation &amp; Rental
                                                    Policies
                                                </div>

                                                {/* Cancellation and No-Show Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                                                            <tr>
                                                                <th className="py-2.5 px-4 w-1/2">
                                                                    Cancellation
                                                                    Policy
                                                                </th>
                                                                <th className="py-2.5 px-4 w-1/2">
                                                                    Refund
                                                                    Amount
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                                            <tr className="hover:bg-gray-50/50">
                                                                <td className="py-2.5 px-4 font-medium">
                                                                    Cancellation
                                                                    more than 48
                                                                    hours before
                                                                    pickup
                                                                </td>
                                                                <td className="py-2.5 px-4">
                                                                    Full refund
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50/50">
                                                                <td className="py-2.5 px-4 font-medium">
                                                                    Cancellation
                                                                    24-48 hours
                                                                    before
                                                                    pickup
                                                                </td>
                                                                <td className="py-2.5 px-4">
                                                                    Refund minus
                                                                    a $35
                                                                    processing
                                                                    fee
                                                                </td>
                                                            </tr>{" "}
                                                            <tr className="hover:bg-gray-50/50">
                                                                <td className="py-2.5 px-4 font-medium">
                                                                    Cancellation
                                                                    less than 24
                                                                    hours before
                                                                    pickup
                                                                </td>
                                                                <td className="py-2.5 px-4">
                                                                    Refund minus
                                                                    a $ 65
                                                                    cancellation
                                                                    fee
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50/50">
                                                                <td className="py-2.5 px-4 font-medium">
                                                                    No-show or
                                                                    failure to
                                                                    pick up
                                                                    vehicle
                                                                </td>
                                                                <td className="py-2.5 px-4 font-semibold text-vivid-red">
                                                                    No refund
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50/50">
                                                                <td className="py-2.5 px-4 font-medium">
                                                                    Early return
                                                                    of vehicle
                                                                </td>
                                                                <td className="py-2.5 px-4 font-semibold text-vivid-red">
                                                                    No refund
                                                                    for unused
                                                                    rental days
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Rental Policies & Terms Bullet Points */}
                                                <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-gray-200 text-xs text-gray-700 space-y-4">
                                                    {/* Security Deposit */}
                                                    <div>
                                                        <h5 className="font-bold text-dark-blue text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-vivid-red" />
                                                            Security Deposit
                                                        </h5>
                                                        <ul className="list-disc pl-5 space-y-1 text-[11px] sm:text-xs leading-relaxed text-gray-600">
                                                            <li>
                                                                A refundable
                                                                security deposit
                                                                of $100-$250 may
                                                                be required
                                                                depending on the
                                                                vehicle.
                                                            </li>
                                                            <li>
                                                                Deposit must be
                                                                paid using our
                                                                valid payment
                                                                methods.
                                                            </li>
                                                            <li>
                                                                Deposits are
                                                                refunded within
                                                                3-7 business
                                                                days after
                                                                vehicle
                                                                inspection and
                                                                return.
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Payment Policy */}
                                                    <div>
                                                        <h5 className="font-bold text-dark-blue text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-vivid-red" />
                                                            Payment Policy
                                                        </h5>
                                                        <ul className="list-disc pl-5 space-y-1 text-[11px] sm:text-xs leading-relaxed text-gray-600">
                                                            <li>
                                                                Rental payment
                                                                is due before
                                                                vehicle pickup.
                                                            </li>
                                                            <li>
                                                                Valid driver's
                                                                license and
                                                                proof of
                                                                insurance may be
                                                                required.
                                                            </li>
                                                            <li>
                                                                Customers are
                                                                responsible for
                                                                traffic tickets,
                                                                tolls, fuel
                                                                charges, and any
                                                                damages not
                                                                covered by
                                                                insurance.
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Vehicle Return */}
                                                    <div>
                                                        <h5 className="font-bold text-dark-blue text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-vivid-red" />
                                                            Vehicle Return
                                                        </h5>
                                                        <ul className="list-disc pl-5 space-y-1 text-[11px] sm:text-xs leading-relaxed text-gray-600">
                                                            <li>
                                                                Vehicle must be
                                                                returned on the
                                                                agreed date and
                                                                time.
                                                            </li>
                                                            <li>
                                                                Late returns may
                                                                result in
                                                                additional
                                                                charges.
                                                            </li>
                                                            <li>
                                                                Vehicle should
                                                                be returned in
                                                                the same
                                                                condition it was
                                                                rented.
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Additional Notes */}
                                                    <div>
                                                        <h5 className="font-bold text-dark-blue text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-vivid-red" />
                                                            Additional Notes
                                                        </h5>
                                                        <ul className="list-disc pl-5 space-y-1 text-[11px] sm:text-xs leading-relaxed text-gray-600">
                                                            <li>
                                                                WF Motors
                                                                reserves the
                                                                right to refuse
                                                                service when
                                                                required
                                                                documentation
                                                                cannot be
                                                                verified.
                                                            </li>
                                                            <li>
                                                                Special
                                                                circumstances
                                                                may be reviewed
                                                                on a
                                                                case-by-case
                                                                basis.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Special Notes (Optional) */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Additional Notes / Requests
                                                    (Optional)
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={specialNotes}
                                                    onChange={(e) =>
                                                        setSpecialNotes(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Flight number, child seat request, or special instructions..."
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red"
                                                />
                                            </div>

                                            {/* Required Agreement Checkbox */}
                                            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={acceptedTerms}
                                                        onChange={(e) =>
                                                            setAcceptedTerms(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="mt-0.5 w-4 h-4 text-vivid-red rounded border-gray-300 focus:ring-vivid-red"
                                                    />
                                                    <span className="text-xs text-gray-800 font-semibold leading-relaxed">
                                                        I have read and agree to
                                                        the Reservation,
                                                        Cancellation, and Rental
                                                        Policies of WF Motors
                                                    </span>
                                                </label>
                                                {validationErrors.acceptedTerms && (
                                                    <p className="text-red-500 text-[10px] mt-1.5 font-bold pl-7">
                                                        {
                                                            validationErrors.acceptedTerms
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons: Next / Back / Reserve */}
                                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-gray-100">
                                        {currentStep > 1 ? (
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm active:scale-95"
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                                <span>Previous Step</span>
                                            </button>
                                        ) : (
                                            <Link
                                                href="/rent"
                                                className="w-full sm:w-auto text-center inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition font-medium"
                                            >
                                                Cancel
                                            </Link>
                                        )}

                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-7 py-3 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs font-bold transition shadow-md hover:shadow-red-500/25 active:scale-95"
                                            >
                                                <span>
                                                    Continue to{" "}
                                                    {steps[currentStep].name}
                                                </span>
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-9 py-3.5 rounded-xl bg-gradient-to-r from-vivid-red to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-extrabold shadow-xl shadow-red-500/30 transition transform active:scale-95 disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v8H4z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            Recording
                                                            Reservation...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            Reserve Vehicle
                                                        </span>
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
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT SIDE: VEHICLE OVERVIEW & SPECIFICATIONS (Full on mobile/tablet, 5 cols on lg) */}
                            <div className="w-full lg:col-span-5 space-y-6">
                                {/* Selected Car Card */}
                                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-5 sm:p-7">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {vehicle?.availabilities ||
                                                "Available for Rent"}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">
                                            ID: #{vehicle?.id || id}
                                        </span>
                                    </div>

                                    {/* Car Title */}
                                    <h3 className="text-xl sm:text-2xl font-black text-[#170a3d] tracking-tight">
                                        {vehicle
                                            ? `${vehicle.year ? vehicle.year + " " : ""}${vehicle.make} ${vehicle.model}`
                                            : "Loading Vehicle..."}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        {vehicle?.bodyStyle || "Sedan"} •{" "}
                                        {vehicle?.condition || "Pre-owned"}
                                    </p>

                                    {/* Image Carousel */}
                                    <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-gray-100 mb-4 group shadow-inner">
                                        {vehicle &&
                                        vehicle.images &&
                                        vehicle.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={
                                                        vehicle.images[
                                                            activeImageIndex
                                                        ] ||
                                                        vehicle.mainImageUrl
                                                    }
                                                    alt={vehicle.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {vehicle.images.length > 1 && (
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
                                                        {vehicle.images
                                                            .slice(0, 6)
                                                            .map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setActiveImageIndex(
                                                                            idx,
                                                                        )
                                                                    }
                                                                    className={`h-1.5 rounded-full transition-all ${
                                                                        activeImageIndex ===
                                                                        idx
                                                                            ? "w-4 bg-vivid-red"
                                                                            : "w-1.5 bg-white/70"
                                                                    }`}
                                                                />
                                                            ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                                No Vehicle Photos Available
                                            </div>
                                        )}
                                    </div>

                                    {/* Key Car Specs Matrix */}
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                Transmission
                                            </span>
                                            <span className="font-semibold text-gray-800 truncate">
                                                {vehicle?.transmission ||
                                                    "Automatic"}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                Fuel Type
                                            </span>
                                            <span className="font-semibold text-gray-800 truncate">
                                                {vehicle?.fuelType ||
                                                    "Gasoline"}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                Driveline
                                            </span>
                                            <span className="font-semibold text-gray-800 truncate">
                                                {vehicle?.driveline || "FWD"}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                Engine
                                            </span>
                                            <span className="font-semibold text-gray-800 truncate">
                                                {vehicle?.engineTypeSize ||
                                                    vehicle?.engine ||
                                                    "Standard"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Daily Price & Savings Highlight */}
                                    <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50/70 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-500 block">
                                                Pay Now Daily Rate
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl sm:text-2xl font-black text-[#170a3d]">
                                                    $
                                                    {baseDailyRate.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-500 font-semibold">
                                                    / day
                                                </span>
                                                {originalDailyRate >
                                                    baseDailyRate && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        $
                                                        {originalDailyRate.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {dailyDiscount > 0 && (
                                            <div className="text-left sm:text-right">
                                                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                                                    Save $
                                                    {dailyDiscount.toLocaleString()}{" "}
                                                    / day
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Total Estimated Price Breakdown Based on Selected Dates */}
                                    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#170a3d] text-white shadow-md">
                                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                                            <div className="flex items-center space-x-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                                    Estimated Rental Total
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                                                {rentalDays}{" "}
                                                {rentalDays === 1
                                                    ? "day"
                                                    : "days"}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-slate-300">
                                            <div className="flex justify-between items-center">
                                                <span>
                                                    $
                                                    {baseDailyRate.toLocaleString()}{" "}
                                                    × {rentalDays}{" "}
                                                    {rentalDays === 1
                                                        ? "day"
                                                        : "days"}
                                                </span>
                                                <span className="font-semibold text-white">
                                                    $
                                                    {totalEstimate.toLocaleString()}
                                                </span>
                                            </div>

                                            {totalSavings > 0 && (
                                                <div className="flex justify-between items-center text-emerald-400 text-[11px]">
                                                    <span>Total Savings</span>
                                                    <span className="font-bold">
                                                        - $
                                                        {totalSavings.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                        Estimated Total
                                                    </span>
                                                    {totalBeforeDiscount >
                                                        totalEstimate && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            Was:{" "}
                                                            <span className="line-through decoration-vivid-red/70 decoration-1">
                                                                $
                                                                {totalBeforeDiscount.toLocaleString()}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right flex items-baseline gap-2">
                                                    {totalBeforeDiscount >
                                                        totalEstimate && (
                                                        <span className="text-xs font-bold text-slate-400 line-through decoration-vivid-red/80 decoration-1">
                                                            $
                                                            {totalBeforeDiscount.toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className="text-2xl font-black text-white tracking-tight">
                                                        $
                                                        {totalEstimate.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support & Need Help Widget */}
                                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm text-xs text-gray-600 flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-vivid-red flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="leading-tight">
                                        <strong className="block text-gray-900 font-bold mb-0.5">
                                            Need Booking Assistance?
                                        </strong>
                                        Speak directly with a rental
                                        coordinator:{" "}
                                        <a
                                            href="tel:+13134606775"
                                            className="text-vivid-red font-bold hover:underline break-all"
                                        >
                                            contact@wrightfindermotors.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <div className="print:hidden">
                <Footer />
            </div>
        </div>
    );
}
