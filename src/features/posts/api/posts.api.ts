import { api } from "@/lib/axios";
import type { PostObject } from "@/types";

type CreatePostData = {
    body?: string;
    visibility?: "public" | "friends" | "private";
};

export const postsApi = {
    getAll: () => api.get<PostObject[]>("/posts/"),
    getByAuthor: (authorId: number) =>
        api.get<PostObject[]>(`/posts/?author=${authorId}`),
    getById: (id: number) => api.get<PostObject>(`/posts/${id}/`),
    create: (data: FormData) =>
        api.post<PostObject>("/posts/", data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    update: (id: number, data: FormData) =>
        api.patch<PostObject>(`/posts/${id}/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    delete: (id: number) => api.delete(`/posts/${id}/`),
    saveToggle: (id: number) => api.post<{ detail: string }>(`/posts/${id}/save/`),
};

export function buildPostFormData(data: CreatePostData): FormData {
    const fd = new FormData();
    if (data.body) fd.append("body", data.body);
    fd.append("visibility", data.visibility ?? "public");
    return fd;
}
