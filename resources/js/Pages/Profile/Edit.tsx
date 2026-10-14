import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span>Profile & Security Settings</span>
                            <span className="text-xs bg-dark-purple/10 text-dark-purple font-semibold px-2.5 py-0.5 rounded-full border border-dark-purple/20">
                                Administrator
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage your administrative account credentials,
                            passwords, and security preferences.
                        </p>
                    </div>

                    {/* Admin Status Pill / Badge */}
                    <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Signed in as:
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                            {user.name}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Profile & Security Settings - Wright Finder Motors" />

            <div className="space-y-6 max-w-5xl">
                {/* SECTION 1: PROFILE INFORMATION */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Profile Information
                            </h3>
                            <p className="text-xs text-slate-500">
                                Update your administrative name and primary
                                contact email address.
                            </p>
                        </div>
                    </div>

                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-2xl"
                    />
                </div>

                {/* SECTION 2: UPDATE PASSWORD */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-dark-blue flex items-center justify-center shrink-0">
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
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Update Password
                            </h3>
                            <p className="text-xs text-slate-500">
                                Ensure your account uses a strong, random
                                password to maintain dealership security.
                            </p>
                        </div>
                    </div>

                    <UpdatePasswordForm className="max-w-2xl" />
                </div>

                {/* SECTION 3: DELETE ACCOUNT / DANGER ZONE */}
                <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-rose-100">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-vivid-red flex items-center justify-center shrink-0">
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Danger Zone
                            </h3>
                            <p className="text-xs text-slate-500">
                                Permanent deletion of this administrator profile
                                and credentials.
                            </p>
                        </div>
                    </div>

                    <DeleteUserForm className="max-w-2xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
