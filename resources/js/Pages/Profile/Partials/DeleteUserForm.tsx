import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";

export default function DeleteUserForm({
    className = "",
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                        Permanently Delete This Administrator Account
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        Once deleted, all administrative access and associated
                        data will be removed forever. Please ensure you have
                        backup credentials before proceeding.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-vivid-red hover:bg-red-700 text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
                >
                    <svg
                        className="w-4 h-4"
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
                    <span>Delete Account</span>
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form
                    onSubmit={deleteUser}
                    className="p-6 sm:p-8 bg-white rounded-3xl relative overflow-hidden"
                >
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-vivid-red flex items-center justify-center mb-4 shadow-inner">
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                        Confirm Account Deletion
                    </h2>

                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Are you completely sure you want to delete this
                        administrator account? All access privileges will be
                        revoked immediately. Please enter your password to
                        confirm.
                    </p>

                    <div className="mt-5">
                        <label
                            htmlFor="password"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                        >
                            Your Password{" "}
                            <span className="text-vivid-red">*</span>
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-vivid-red transition font-medium shadow-sm"
                            placeholder="Enter password to confirm"
                            autoFocus
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-vivid-red hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 active:scale-95"
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
                            <span>Confirm & Delete</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
