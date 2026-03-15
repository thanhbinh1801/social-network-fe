import { api } from "@/lib/axios";
import { unwrapList } from "@/lib/api";
import type { PaginatedResponse, PostObject } from "@/types";

type CreatePostData = {
    body?: string;
    visibility?: "public" | "friends" | "private";
};

export const postsApi = {
    getAll: async () => {
        const res = await api.get<PostObject[] | PaginatedResponse<PostObject>>("/posts/");
        return unwrapList(res.data);
    },

    getByAuthor: async (authorId: number) => {
        const res = await api.get<PostObject[] | PaginatedResponse<PostObject>>(
            `/posts/?author=${authorId}`
        );
        return unwrapList(res.data);
    },

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

    getSaved: async () => {
        const res = await api.get<PostObject[] | PaginatedResponse<PostObject>>("/posts/saved/");
        return unwrapList(res.data);
    },

    getByHashtag: async (name: string) => {
        const res = await api.get<PostObject[] | PaginatedResponse<PostObject>>(
            `/posts/hashtags/${name}/`
        );
        return unwrapList(res.data);
    },
};

export function buildPostFormData(data: CreatePostData): FormData {
    const fd = new FormData();
    if (data.body) fd.append("body", data.body);
    fd.append("visibility", data.visibility ?? "public");
    return fd;
}
