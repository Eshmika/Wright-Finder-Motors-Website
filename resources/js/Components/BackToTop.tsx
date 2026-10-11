import { useState, useEffect } from "react";

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const toggleVisibility = () => {
            const currentScroll =
                window.scrollY || document.documentElement.scrollTop;
            const scrollHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;

            // Show button after scrolling past 300px
            if (currentScroll > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            // Calculate percentage scrolled
            if (scrollHeight > 0) {
                const progress = Math.min(
                    100,
                    Math.max(0, (currentScroll / scrollHeight) * 100),
                );
                setScrollProgress(progress);
            }
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        toggleVisibility();

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Calculate circular stroke offset for SVG circle progress (radius = 18, circumference = 2 * PI * 18 ≈ 113.1)
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference - (scrollProgress / 100) * circumference;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
                isVisible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 pointer-events-none"
            }`}
        >
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/90 hover:bg-slate-950 backdrop-blur-md text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-vivid-red focus:ring-offset-2 focus:ring-offset-slate-900 border border-white/10"
            >
                {/* Circular Progress Ring */}
                <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
                    viewBox="0 0 44 44"
                >
                    {/* Background Track */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        className="stroke-white/10"
                        strokeWidth="2.5"
                        fill="transparent"
                    />
                    {/* Progress Indicator */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        className="stroke-vivid-red transition-all duration-150"
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>

                {/* Animated Arrow Icon */}
                <span className="relative z-10 flex flex-col items-center justify-center">
                    <svg
                        className="w-5 h-5 text-gray-200 group-hover:text-vivid-red transition-transform duration-300 group-hover:-translate-y-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </span>

                {/* Hover Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md border border-white/10">
                    Back to Top
                </span>
            </button>
        </div>
    );
}
