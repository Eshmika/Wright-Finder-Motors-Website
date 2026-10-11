import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Create Your Account"
            subtitle="Join Wright Finder Motors to browse inventory, save cars, and contact agents"
            badge="New Registration"
        >
            <Head title="Register - Wright Finder Motors" />

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value="Full Name" className="text-slate-300 font-semibold text-xs" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1 text-xs text-rose-400" />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-300 font-semibold text-xs" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1 text-xs text-rose-400" />
                </div>

                {/* Password Grid (Password & Confirm Password) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-300 font-semibold text-xs" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        <InputError message={errors.password} className="mt-1 text-xs text-rose-400" />
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                            className="text-slate-300 font-semibold text-xs"
                        />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vivid-red focus:ring-1 focus:ring-vivid-red transition"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1 text-xs text-rose-400"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 px-6 rounded-xl bg-vivid-red hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                    >
                        <span>{processing ? 'Creating Account...' : 'Complete Registration'}</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>

                {/* Switch to Login link */}
                <div className="pt-4 text-center border-t border-slate-800 text-xs text-slate-400">
                    <span>Already have an account? </span>
                    <Link
                        href={route('login')}
                        className="font-bold text-vivid-red hover:text-red-400 transition ml-1"
                    >
                        Sign In Instead
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
