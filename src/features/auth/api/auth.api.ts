import { api } from "@/lib/axios";
import type { TokenResponse, UserPublicObject } from "@/types";

export const authApi = {
    register: (data: {
        username: string;
        email: string;
        password: string;
        password_confirm: string;
    }) => api.post<{ detail: string }>("/auth/register/", data),

    login: (data: { email: string; password: string }) =>
        api.post<TokenResponse>("/auth/login/", data),

    logout: (refresh: string) => api.post<{ detail: string }>("/auth/logout/", { refresh }),

    refresh: (refresh: string) =>
        api.post<{ access: string }>("/auth/token/refresh/", { refresh }),

    verifyEmail: (data: { email: string; code: string }) =>
        api.post<{ detail: string }>("/auth/verify-email/", data),

    resendVerification: (data: { email: string }) =>
        api.post<{ detail: string }>("/auth/resend-verification/", data),

    forgotPassword: (data: { email: string }) =>
        api.post<{ detail: string }>("/auth/forgot-password/", data),

    resetPassword: (data: {
        email: string;
        code: string;
        password: string;
        password_confirm: string;
    }) => api.post<{ detail: string }>("/auth/reset-password/", data),

    me: () => api.get<UserPublicObject>("/users/me/"),
};
