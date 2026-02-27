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

    refresh: (refresh: string) =>
        api.post<{ access: string }>("/auth/token/refresh/", { refresh }),

    me: () => api.get<UserPublicObject>("/users/me/"),
};
