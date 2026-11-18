import { useState, useEffect } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

interface CookiePreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
};

const STORAGE_KEY = "wfm_cookie_preferences";

export default function CookieSettings({ auth }: PageProps) {
    const [preferences, setPreferences] =
        useState<CookiePreferences>(DEFAULT_PREFERENCES);
    const [savedMessage, setSavedMessage] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPreferences({
                    necessary: true,
                    functional: Boolean(parsed.functional),
                    analytics: Boolean(parsed.analytics),
                    marketing: Boolean(parsed.marketing),
                });
            }
        } catch {
            // fallback to defaults if localStorage is unavailable
        }
    }, []);

    const handleToggle = (category: keyof CookiePreferences) => {
        if (category === "necessary") return;
        setPreferences((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleSave = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
            setSavedMessage(true);
            setTimeout(() => setSavedMessage(false), 3500);
        } catch {
            // Ignore error
        }
    };

    const handleAcceptAll = () => {
        const allOn: CookiePreferences = {
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true,
        };
        setPreferences(allOn);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allOn));
            setSavedMessage(true);
            setTimeout(() => setSavedMessage(false), 3500);
        } catch {
            // Ignore error
        }
    };

    const handleRejectNonEssential = () => {
        const minimal: CookiePreferences = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
        };
        setPreferences(minimal);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
            setSavedMessage(true);
            setTimeout(() => setSavedMessage(false), 3500);
        } catch {
            // Ignore error
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-poppins selection:bg-vivid-red selection:text-white">
            <Head title="Cookie Settings - Wright Finder Motors" />

            {/* Header */}
            <Header user={auth?.user} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative text-white py-16 lg:py-24 overflow-hidden bg-[#0d0524]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#170a3d] via-[#1a1145] to-[#0a0319]" />
                    <div className="absolute top-10 right-10 w-[450px] h-[450px] rounded-full bg-vivid-red/15 blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-purple/40 blur-[120px] pointer-events-none" />

                    <div
                        className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                            backgroundSize: "64px 64px",
                        }}
                    />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold tracking-wide shadow-sm mb-6">
                            <span className="w-2 h-2 rounded-full bg-vivid-red animate-pulse" />
                            <span className="text-gray-200">
                                Your Privacy Preferences
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Cookie{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vivid-red via-red-400 to-rose-300">
                                Settings
                            </span>
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                            Manage your cookie preferences and control how your
                            data is used to personalize and improve your
                            browsing experience on Wright Finder Motors.
                        </p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-12 lg:py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {savedMessage && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-500 text-white flex items-center justify-between shadow-lg transition duration-300">
                                <div className="flex items-center space-x-3">
                                    <svg
                                        className="w-5 h-5 fill-current shrink-0"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-semibold">
                                        Your cookie preferences have been saved
                                        successfully!
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSavedMessage(false)}
                                    className="text-white hover:text-emerald-100 text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 lg:p-12 space-y-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-vivid-red pl-3 mb-2">
                                    Cookie Consent &amp; Preferences
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                    Cookies are small text files stored on your
                                    device that help our website run smoothly,
                                    remember your preferences, and assist us in
                                    analyzing platform usage. You can adjust
                                    your consent settings for different
                                    categories below at any time.
                                </p>
                            </div>

                            {/* Preference Toggles */}
                            <div className="space-y-5">
                                {/* Necessary Cookies */}
                                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1 pr-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-semibold text-gray-900 text-base">
                                                Essential &amp; Strictly
                                                Necessary
                                            </h3>
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-200 text-slate-700">
                                                Always Active
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Required for the website to function
                                            securely, authenticate user
                                            sessions, maintain reservation
                                            checkout state, and uphold basic
                                            security safeguards.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled
                                        aria-label="Always active"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-vivid-red opacity-60"
                                    >
                                        <span className="inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow" />
                                    </button>
                                </div>

                                {/* Functional Cookies */}
                                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1 pr-4">
                                        <h3 className="font-semibold text-gray-900 text-base">
                                            Functional Cookies
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Enable personalized features such as
                                            remembering your vehicle search
                                            filters, location selections, and
                                            interface preferences.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={preferences.functional}
                                        onClick={() =>
                                            handleToggle("functional")
                                        }
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            preferences.functional
                                                ? "bg-vivid-red"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                preferences.functional
                                                    ? "translate-x-5"
                                                    : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1 pr-4">
                                        <h3 className="font-semibold text-gray-900 text-base">
                                            Performance &amp; Analytics Cookies
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Collect anonymous information about
                                            how visitors navigate and use our
                                            car catalog and rental booking
                                            flows, helping us optimize website
                                            speed and usability.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={preferences.analytics}
                                        onClick={() =>
                                            handleToggle("analytics")
                                        }
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            preferences.analytics
                                                ? "bg-vivid-red"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                preferences.analytics
                                                    ? "translate-x-5"
                                                    : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1 pr-4">
                                        <h3 className="font-semibold text-gray-900 text-base">
                                            Targeting &amp; Marketing Cookies
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Used to deliver tailored vehicle
                                            recommendations and promotions
                                            relevant to your interests across
                                            social media and digital channels.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={preferences.marketing}
                                        onClick={() =>
                                            handleToggle("marketing")
                                        }
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            preferences.marketing
                                                ? "bg-vivid-red"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                preferences.marketing
                                                    ? "translate-x-5"
                                                    : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleRejectNonEssential}
                                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm font-semibold transition"
                                >
                                    Reject Non-Essential
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAcceptAll}
                                    className="px-5 py-2.5 rounded-xl bg-dark-blue hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition shadow"
                                >
                                    Accept All Cookies
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="px-6 py-2.5 rounded-xl bg-vivid-red hover:bg-red-600 text-white text-xs sm:text-sm font-semibold transition shadow"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
