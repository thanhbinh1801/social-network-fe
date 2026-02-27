import { api } from "@/lib/axios";
import type { UserPublicObject, FollowRelation, PostObject } from "@/types";

export const profileApi = {
    getUser: (id: number | string) =>
        api.get<UserPublicObject>(`/users/${id}/`),

    updateUser: (id: number, data: FormData) =>
        api.patch<UserPublicObject>(`/users/${id}/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    followToggle: (id: number) =>
        api.post<{ detail: string }>(`/users/${id}/follow/`),

    getFollowers: (id: number) =>
        api.get<FollowRelation[]>(`/users/${id}/followers/`),

    getFollowing: (id: number) =>
        api.get<FollowRelation[]>(`/users/${id}/following/`),

    getUserPosts: (id: number) =>
        api.get<PostObject[]>(`/posts/?author=${id}`),
};
