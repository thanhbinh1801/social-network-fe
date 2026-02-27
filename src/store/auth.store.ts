import { create } from "zustand";
import { authStorage } from "@/lib/auth";
import type { UserPublicObject } from "@/types";

interface AuthState {
    user: UserPublicObject | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: UserPublicObject) => void;
    setAccessToken: (access: string) => void;
    login: (access: string, refresh: string, user: UserPublicObject) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: authStorage.getAccess(),
    refreshToken: authStorage.getRefresh(),
    isAuthenticated: !!authStorage.getAccess(),

    setTokens: (access, refresh) => {
        authStorage.setTokens(access, refresh);
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
    },

    setUser: (user) => set({ user }),

    setAccessToken: (access) => {
        authStorage.setAccess(access);
        set({ accessToken: access });
    },

    login: (access, refresh, user) => {
        authStorage.setTokens(access, refresh);
        set({ accessToken: access, refreshToken: refresh, user, isAuthenticated: true });
    },

    logout: () => {
        authStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
}));
