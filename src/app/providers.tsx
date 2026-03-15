import { useEffect } from "react";
import { Toaster } from "sonner";
import { profileApi } from "@/features/profile/api/profile.api";
import { useAuthStore } from "@/store/auth.store";

function AuthBootstrap() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const setUser = useAuthStore((state) => state.setUser);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        if (!isAuthenticated) return;

        profileApi
            .getMe()
            .then(({ data }) => setUser(data))
            .catch(() => logout());
    }, [isAuthenticated, setUser, logout]);

    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AuthBootstrap />
            {children}
            <Toaster position="top-right" richColors closeButton />
        </>
    );
}
