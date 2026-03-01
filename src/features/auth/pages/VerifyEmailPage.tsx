import { useState, useRef } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail } from "lucide-react";

export default function VerifyEmailPage() {
    const location = useLocation();
    const email = location.state?.email;

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { loading, handleVerifyEmail, handleResendVerification } = useAuth();

    if (!email) {
        return <Navigate to="/register" replace />;
    }

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];

        // Handle paste of multiple characters
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < pastedCode.length; i++) {
                if (index + i < 6) newCode[index + i] = pastedCode[i];
            }
            setCode(newCode);

            // Focus on next empty input or last input
            const nextEmptyIndex = newCode.findIndex(val => val === "");
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
            return;
        }

        newCode[index] = value;
        setCode(newCode);

        // Move to next input if value is entered
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && code[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;

        handleVerifyEmail({ email, code: fullCode });
    };

    const onResend = () => {
        handleResendVerification({ email });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-gray-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Check your email</h2>
                    <p className="text-gray-500 text-sm">
                        We sent a verification code to <br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-lg font-bold"
                                required
                            />
                        ))}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || code.join("").length !== 6}
                    >
                        {loading ? "Verifying…" : "Verify email"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Didn't receive the email?{" "}
                    <button
                        onClick={onResend}
                        disabled={loading}
                        className="font-semibold text-black hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Click to resend
                    </button>
                </p>
            </div>
        </div>
    );
}
