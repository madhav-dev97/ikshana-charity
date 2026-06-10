import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
    const [, navigate] = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        navigate("/admin");
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center items-center bg-green-700 text-white p-12">
                <img
                    src="/logo.png"
                    alt="IKSHANA"
                    className="h-28 mb-8"
                />

                <h1 className="text-4xl font-bold">
                    IKSHANA CHARITABLE TRUST
                </h1>

                <p className="mt-4 text-lg text-center max-w-md">
                    Every Contribution Creates Impact
                </p>

                <div className="mt-10 space-y-2 text-center">
                    <p>561+ Historical Donations</p>
                    <p>41 Campaigns Supported</p>
                    <p>Serving Since 2022</p>
                </div>
            </div>

            <div className="flex items-center justify-center p-6">
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-md bg-white shadow rounded-xl p-8"
                >
                    <h2 className="text-3xl font-bold">
                        Welcome Back
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Sign in to manage campaigns and donations
                    </p>

                    <div className="mt-6">
                        <label>Email</label>

                        <input
                            className="w-full border rounded p-3 mt-1"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <label>Password</label>

                        <input
                            className="w-full border rounded p-3 mt-1"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 mt-3">
                            {error}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full mt-6 bg-green-700 text-white py-3 rounded"
                    >
                        {loading
                            ? "Signing In..."
                            : "Secure Sign In"}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        Authorized IKSHANA administrators only
                    </p>
                </form>
            </div>
        </div>
    );
}