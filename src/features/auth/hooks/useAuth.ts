import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { profileApi } from "@/features/profile/api/profile.api";
import type { AxiosError } from "axios";
import type { DetailResponse } from "@/types";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuthStore(); // 'login' is no longer directly used here, but setTokens/setUser are called via getState()

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data } = await authApi.login({ email, password });
            // Store tokens first, navigate immediately
            useAuthStore.getState().setTokens(data.access, data.refresh);
            navigate("/");
            // Fetch user profile in background (non-blocking)
            profileApi.getUser("me")
                .then(({ data: userData }) => useAuthStore.getState().setUser(userData))
                .catch(() => { }); // silently ignore if /me fails
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
            navigate("/login");
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

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return { loading, handleLogin, handleRegister, handleLogout };
}
