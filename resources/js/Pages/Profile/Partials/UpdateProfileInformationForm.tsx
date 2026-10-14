import InputError from "@/Components/InputError";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                        >
                            Full Name <span className="text-vivid-red">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            autoComplete="name"
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple transition font-medium shadow-sm"
                            placeholder="e.g. John Doe"
                        />
                        <InputError className="mt-1.5" message={errors.name} />
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                        >
                            Email Address{" "}
                            <span className="text-vivid-red">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple transition font-medium shadow-sm"
                            placeholder="admin@wrightfindermotors.com"
                        />
                        <InputError className="mt-1.5" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="ml-1.5 font-bold underline hover:text-amber-900 focus:outline-none"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-xs font-semibold text-emerald-700">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark-purple hover:bg-purple text-white text-xs font-bold transition shadow-sm disabled:opacity-50 active:scale-95"
                    >
                        {processing && (
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        )}
                        <span>Save Profile</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
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
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Saved successfully.
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
