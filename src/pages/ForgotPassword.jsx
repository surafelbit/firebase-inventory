import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

// Firebase project ID for emulator OOB lookup
const PROJECT_ID = "inventory-app-19292";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setResetLink("");

        try {
            setLoading(true);

            await sendPasswordResetEmail(auth, email, {
                url: "http://localhost:5173/reset-password",
                handleCodeInApp: true,
            });

            // In emulator mode, fetch the OOB link from the emulator REST API
            // so the user can click it directly instead of copying from terminal.
            if (window.location.hostname === "localhost") {
                try {
                    const res = await fetch(
                        `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`
                    );
                    const data = await res.json();
                    const codes = data.oobCodes || [];

                    // Get the most recent OOB code for this email
                    const match = [...codes]
                        .reverse()
                        .find(
                            (c) =>
                                c.email === email &&
                                c.requestType === "PASSWORD_RESET"
                        );

                    if (match?.oobLink) {
                        // Convert the emulator OOB link to our frontend reset-password route
                        const url = new URL(match.oobLink);
                        const oobCode = url.searchParams.get("oobCode");
                        if (oobCode) {
                            setResetLink(
                                `http://localhost:5173/reset-password?oobCode=${oobCode}`
                            );
                        }
                    }
                } catch (fetchErr) {
                    console.warn("Could not fetch OOB code from emulator:", fetchErr);
                }
            }

            setMessage(
                "Password reset instructions have been sent to your email."
            );
        } catch (error) {
            console.error("Password reset error:", error);

            if (error.code === "auth/user-not-found") {
                setError("No account was found with this email.");
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else {
                setError("Unable to send reset instructions. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
            <div className="w-full max-w-md">
                <Link
                    to="/login"
                    className="mb-8 inline-block text-sm text-indigo-400 hover:text-indigo-300"
                >
                    ← Back to login
                </Link>

                <h1 className="text-3xl font-bold">
                    Forgot your password?
                </h1>

                <p className="mt-2 text-slate-400">
                    Enter your email and we'll send you a password reset link.
                </p>

                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        {message}
                    </div>
                )}

                {resetLink && (
                    <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-4 text-sm">
                        <p className="mb-2 font-semibold text-indigo-300">
                            🔗 Dev mode — click your reset link:
                        </p>
                        <a
                            href={resetLink}
                            className="break-all text-indigo-400 underline hover:text-indigo-300"
                        >
                            Click here to reset your password →
                        </a>
                    </div>
                )}

                <form onSubmit={handleReset} className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;