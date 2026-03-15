import { api } from "@/lib/axios";
import { unwrapList } from "@/lib/api";
import type {
    FollowRelation,
    PaginatedResponse,
    PostObject,
    PrivacySettings,
    UserPublicObject,
} from "@/types";

export const profileApi = {
    getUser: (id: number | string) => api.get<UserPublicObject>(`/users/${id}/`),

    getMe: () => api.get<UserPublicObject>("/users/me/"),

    updateUser: (id: number, data: FormData) =>
        api.patch<UserPublicObject>(`/users/${id}/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    updateMe: (data: FormData) =>
        api.patch<UserPublicObject>("/users/me/", data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    followToggle: (id: number) => api.post<{ detail: string }>(`/users/${id}/follow/`, {}),

    getFollowers: async (id: number) => {
        const res = await api.get<FollowRelation[] | PaginatedResponse<FollowRelation>>(
            `/users/${id}/followers/`
        );
        return unwrapList(res.data);
    },

    getFollowing: async (id: number) => {
        const res = await api.get<FollowRelation[] | PaginatedResponse<FollowRelation>>(
            `/users/${id}/following/`
        );
        return unwrapList(res.data);
    },

    getUserPosts: async (id: number) => {
        const res = await api.get<PostObject[] | PaginatedResponse<PostObject>>(
            `/posts/?author=${id}`
        );
        return unwrapList(res.data);
    },

    getSuggestions: async () => {
        const res = await api.get<UserPublicObject[] | PaginatedResponse<UserPublicObject>>(
            "/users/suggestions/"
        );
        return unwrapList(res.data);
    },

    getPrivacy: () => api.get<PrivacySettings>("/users/me/privacy/"),

    updatePrivacy: (data: Partial<PrivacySettings>) =>
        api.patch<PrivacySettings>("/users/me/privacy/", data),
};
