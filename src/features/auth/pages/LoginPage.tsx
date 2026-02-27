import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, handleLogin } = useAuth();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left brand panel */}
            <div className="hidden lg:flex flex-col justify-center flex-1 bg-black text-white px-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold leading-tight mb-6">
                    Happening now
                </h1>
                <p className="text-xl text-gray-300">Join the conversation.</p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-8">Sign in to SocialNet</h2>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in…" : "Sign in"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold text-black hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
