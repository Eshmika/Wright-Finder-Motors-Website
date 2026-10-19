import { useState, useEffect } from "react";

export default function ContactContentSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
    });

    const [inquiryVehicle, setInquiryVehicle] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const carId = params.get("carId");
            const carTitle = params.get("carTitle");
            const subjectParam = params.get("subject");
            const messageParam = params.get("message");

            if (carId || carTitle) {
                setInquiryVehicle({
                    id: carId || "",
                    title: carTitle || "Vehicle",
                });
            }

            setFormData((prev) => ({
                ...prev,
                subject: subjectParam || prev.subject,
                message: messageParam || prev.message,
            }));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate successful submission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "general",
                message: "",
            });
        }, 800);
    };

    return (
        <section
            id="contact-form"
            className="py-20 bg-bggray font-poppins relative"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Centered Header Section matching Buy Page VehicleCatalog Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-vivid-red/15 border border-vivid-red/30 text-vivid-red text-xs font-bold uppercase tracking-wider shadow-sm">
                        <span>Get In Touch</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Contact Wright Finder Motors
                    </h2>
                    <p className="text-sm lg:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Reach out for inquiries, scheduling a test drive,
                        requesting vehicle history, or general automotive
                        support.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Get In Touch Cards (Email, Contact, Address + Map) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Address Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center shrink-0 group-hover:bg-vivid-red group-hover:text-white transition-colors duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-dark-blue">
                                        Dealership Location
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Dayton, OH, United States
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Showroom &amp; Vehicle Pickup
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Numbers Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center shrink-0 group-hover:bg-vivid-red group-hover:text-white transition-colors duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-dark-blue">
                                        Phone Numbers
                                    </h4>
                                    <div className="flex flex-col space-y-1 pt-1 text-sm font-semibold text-gray-700">
                                        <a
                                            href="tel:+19378388616"
                                            className="hover:text-vivid-red transition"
                                        >
                                            +1937-838-8616
                                        </a>
                                        <a
                                            href="tel:+19374754737"
                                            className="hover:text-vivid-red transition"
                                        >
                                            +1937-475-4737
                                        </a>
                                        <a
                                            href="tel:+19372706688"
                                            className="hover:text-vivid-red transition"
                                        >
                                            +1937-270-6688
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-400 pt-1">
                                        Available 24/7 for support &amp;
                                        inquiries
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center shrink-0 group-hover:bg-vivid-red group-hover:text-white transition-colors duration-300">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-dark-blue">
                                        Email Support
                                    </h4>
                                    <a
                                        href="mailto:wrightfindermotors@gmail.com"
                                        className="text-sm font-semibold text-gray-700 hover:text-vivid-red transition block mt-1 break-all"
                                    >
                                        wrightfindermotors@gmail.com
                                    </a>
                                    <p className="text-xs text-gray-400 mt-1">
                                        We typically reply within a couple of
                                        hours
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Embedded Google Map */}
                        <div className="overflow-hidden rounded-2xl border border-white/20 shadow-md">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d24536.12128934873!2d-84.194032!3d39.761768!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884080d5aedd1403%3A0xa640e392f20e4ce4!2sDayton%2C%20OH!5e0!3m2!1sen!2sus!4v1791625785773!5m2!1sen!2sus"
                                width="100%"
                                height="220"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                title="Wright Finder Motors Location Map"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Right Column: Creative Contact Us Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-vivid-red/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="mb-8">
                                <span className="text-xs font-bold text-vivid-red uppercase tracking-wider block mb-1">
                                    Direct Message
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#170a3d]">
                                    Send Us A Message
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Fill out the form below and one of our
                                    dedicated automotive consultants will
                                    connect with you shortly.
                                </p>
                            </div>

                            {/* Creative Notice if redirected for vehicle inquiry */}
                            {inquiryVehicle && (
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 flex items-start gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-vivid-red text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-vivid-red uppercase tracking-wider">
                                                Vehicle Inquiry Attached
                                            </span>
                                            {inquiryVehicle.id && (
                                                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-red-100">
                                                    Stock #{inquiryVehicle.id}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                                            {inquiryVehicle.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            We've pre-filled your inquiry
                                            message below. Simply provide your
                                            contact details so our agent can get
                                            back to you immediately!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isSubmitted ? (
                                <div className="text-center py-12 px-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        ✓
                                    </div>
                                    <h4 className="text-xl font-bold text-emerald-900">
                                        Message Sent Successfully!
                                    </h4>
                                    <p className="text-sm text-emerald-700 mt-2 max-w-md mx-auto">
                                        Thank you for reaching out. We have
                                        received your message and will respond
                                        to you as soon as possible.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsSubmitted(false)}
                                        className="mt-6 px-6 py-2.5 rounded-full bg-vivid-red text-white text-xs font-bold hover:bg-red-600 transition shadow"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                                Your Full Name{" "}
                                                <span className="text-vivid-red">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red focus:bg-white transition"
                                            />
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                                Email Address{" "}
                                                <span className="text-vivid-red">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="e.g. john@example.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. +1 (937) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red focus:bg-white transition"
                                            />
                                        </div>

                                        {/* Inquiry Subject */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                                Subject / Inquiry Type
                                            </label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        subject: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red focus:bg-white transition cursor-pointer"
                                            >
                                                <option value="general">
                                                    General Inquiry
                                                </option>
                                                <option value="buy">
                                                    Buying a Vehicle
                                                </option>
                                                <option value="rent">
                                                    Vehicle Rentals
                                                </option>
                                                <option value="repair">
                                                    Maintenance &amp; Repair
                                                </option>
                                                <option value="finance">
                                                    Financing &amp; Trade-In
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Message Textarea */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                            Your Message{" "}
                                            <span className="text-vivid-red">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            placeholder="Tell us what you are looking for or how we can assist you..."
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    message: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vivid-red/20 focus:border-vivid-red focus:bg-white transition resize-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-10 py-4 rounded-full bg-vivid-red hover:bg-red-600 text-white font-bold text-sm transition-all duration-300 shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span>Sending Message...</span>
                                            ) : (
                                                <>
                                                    <span>
                                                        Send Message Now
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
                                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                        />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
