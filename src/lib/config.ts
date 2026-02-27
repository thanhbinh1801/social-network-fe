export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string ?? "http://127.0.0.1:8000";

export const API_BASE_URL = `${BACKEND_URL}/api`;

export function resolveMedia(url: string | null | undefined): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
}
