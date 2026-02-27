import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./auth";
import { useAuthStore } from "@/store/auth.store";
import { API_BASE_URL } from "./config";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccess();
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token as string);
    });
    failedQueue = [];
};

// Auto refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refresh = authStorage.getRefresh();
            if (!refresh) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post<{ access: string }>(
                    `${API_BASE_URL}/auth/token/refresh/`,
                    { refresh }
                );
                authStorage.setAccess(data.access);
                useAuthStore.getState().setAccessToken(data.access);
                processQueue(null, data.access);

                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
                }
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                useAuthStore.getState().logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
