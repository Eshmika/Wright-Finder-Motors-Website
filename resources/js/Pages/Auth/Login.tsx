import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bggray font-poppins relative px-4 py-8 overflow-hidden selection:bg-vivid-red selection:text-white">
            <Head title="Sign In - Wright Finder Motors" />

            {/* Ambient Background Lighting */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-vivid-red/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#170a3d]/35 rounded-full blur-3xl pointer-events-none" />

            {/* Back to Home Button on Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 transition shadow-sm backdrop-blur-md"
                >
                    <svg
                        className="w-4 h-4 text-vivid-red"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    <span>Back to Showroom</span>
                </Link>
            </div>

            {/* Centered Creative Minimalist Login Card */}
            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    {/* Top Subtle Red Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-vivid-red to-transparent opacity-80" />

                    {/* Logo & Header */}
                    <div className="text-center space-y-3 mb-8">
                        <Link href="/" className="inline-block group">
                            <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-md group-hover:scale-105 transition-transform duration-300">
                                <img
                                    src="/storage/images/logo.webp"
                                    alt="Wright Finder Motors Logo"
                                    className="h-10 w-auto object-contain"
                                    onError={(e) => {
                                        (
                                            e.target as HTMLElement
                                        ).style.display = "none";
                                    }}
                                />
                            </div>
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                Portal Sign In
                            </h1>
                            <p className="text-xs text-slate-400">
                                Enter your credentials to access your account
                            </p>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 text-center">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="text-slate-300 font-semibold text-xs"
                            />
                            <div className="relative">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="agent@wrightfindermotors.com"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-1 text-xs text-rose-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="text-slate-300 font-semibold text-xs"
                                />
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-xs font-medium text-vivid-red hover:text-red-400 transition"
                                    >
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-1 text-xs text-rose-400"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    className="rounded bg-slate-800 border-slate-700 text-vivid-red focus:ring-vivid-red"
                                    onChange={(e) =>
                                        setData(
                                            "remember",
                                            (e.target.checked ||
                                                false) as false,
                                        )
                                    }
                                />
                                <span className="ms-2.5 text-xs font-medium text-slate-300">
                                    Remember this device
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-6 rounded-xl bg-vivid-red hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                            >
                                <span>
                                    {processing ? "Signing In..." : "Sign In"}
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
                            </button>
                        </div>
                    </form>

                    {/* Footer text note */}
                    <div className="mt-8 pt-5 border-t border-slate-800 text-center">
                        <p className="text-[11px] text-slate-500">
                            Wright Finder Motors Authorized Portal • Protected &
                            Encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
