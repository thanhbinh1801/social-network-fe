import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
    });
    const { loading, handleRegister } = useAuth();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRegister(form);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">Create your account</h2>
                <p className="text-gray-500 text-sm mb-8">It's quick and easy.</p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            placeholder="john_doe"
                            value={form.username}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={onChange}
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirm">Confirm password</Label>
                        <Input
                            id="password_confirm"
                            name="password_confirm"
                            type="password"
                            placeholder="••••••••"
                            value={form.password_confirm}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account…" : "Sign up"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-black hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
