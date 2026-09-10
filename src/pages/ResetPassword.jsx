import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    verifyPasswordResetCode,
    confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../firebase";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oobCode = searchParams.get("oobCode");

    const [checking, setChecking] = useState(true);
    const [validCode, setValidCode] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkResetCode = async () => {
            if (!oobCode) {
                setError("Invalid password reset link.");
                setChecking(false);
                return;
            }

            try {
                await verifyPasswordResetCode(auth, oobCode);
                setValidCode(true);
            } catch (error) {
                console.error(error);
                setError("This password reset link is invalid or expired.");
            } finally {
                setChecking(false);
            }
        };

        checkResetCode();
    }, [oobCode]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await confirmPasswordReset(
                auth,
                oobCode,
                newPassword
            );

            setSuccess(true);
        } catch (error) {
            console.error(error);

            if (error.code === "auth/expired-action-code") {
                setError("This reset link has expired.");
            } else if (error.code === "auth/invalid-action-code") {
                setError("This reset link is invalid or already used.");
            } else if (error.code === "auth/weak-password") {
                setError("Password is too weak.");
            } else {
                setError("Unable to reset password.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                Checking reset link...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
            <div className="w-full max-w-md">
                <Link
                    to="/login"
                    className="mb-8 inline-block text-sm text-indigo-400 hover:text-indigo-300"
                >
                    ← Back to login
                </Link>

                {success ? (
                    <>
                        <h1 className="text-3xl font-bold">
                            Password reset successfully!
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Your password has been changed. You can now log in.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="mt-8 w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400"
                        >
                            Go to Login
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold">
                            Reset your password
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Enter your new password below.
                        </p>

                        {error && (
                            <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {validCode && (
                            <form onSubmit={handleReset} className="mt-8 space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;