import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStorage } from "@/lib/auth";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { profileApi } from "@/features/profile/api/profile.api";
import type { AxiosError } from "axios";
import type { DetailResponse } from "@/types";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data } = await authApi.login({ email, password });
            useAuthStore.getState().setTokens(data.access, data.refresh);
            navigate("/");
            profileApi.getMe()
                .then(({ data: userData }) => useAuthStore.getState().setUser(userData))
                .catch(() => { });
        } catch (err) {
            const error = err as AxiosError<DetailResponse>;
            const msg = error.response?.data?.detail ?? "Login failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data: {
        username: string;
        email: string;
        password: string;
        password_confirm: string;
    }) => {
        setLoading(true);
        try {
            await authApi.register(data);
            toast.success("Registration successful! Please verify your email.");
            navigate("/verify-email", { state: { email: data.email } });
        } catch (err) {
            const error = err as AxiosError<Record<string, string[]>>;
            const field = error.response?.data;
            const msg = field
                ? Object.values(field).flat().join(" ")
                : "Registration failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (data: { email: string; code: string }) => {
        setLoading(true);
        try {
            await authApi.verifyEmail(data);
            toast.success("Email verified successfully! You can now log in.");
            navigate("/login");
        } catch (err) {
            const error = err as AxiosError<DetailResponse>;
            const msg = error.response?.data?.detail ?? "Verification failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async (data: { email: string }) => {
        setLoading(true);
        try {
            await authApi.resendVerification(data);
            toast.success("Verification email resent!");
        } catch (err) {
            const error = err as AxiosError<DetailResponse>;
            const msg = error.response?.data?.detail ?? "Failed to resend verification.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const refresh = authStorage.getRefresh();
        if (refresh) {
            try {
                await authApi.logout(refresh);
            } catch {
                // Logout locally even if server-side token revocation fails.
            }
        }
        logout();
        navigate("/login");
    };

    return {
        loading,
        handleLogin,
        handleRegister,
        handleVerifyEmail,
        handleResendVerification,
        handleLogout
    };
}
