import { api } from "@/lib/axios";
import type { CommentObject, FollowRelation } from "@/types";

// DRF PageNumberPagination wrapper
interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Unwrap paginated or plain-array response → always returns an array */
export function unwrapList<T>(data: T[] | Paginated<T>): T[] {
    return Array.isArray(data) ? data : data.results;
}

export const engagementApi = {
    react: (postId: number, type: string) =>
        api.post<{ detail: string }>(`/posts/${postId}/react/`, { type }),

    getComments: async (postId: number): Promise<CommentObject[]> => {
        const res = await api.get<CommentObject[] | Paginated<CommentObject>>(
            `/posts/${postId}/comments/`
        );
        return unwrapList(res.data);
    },

    createComment: (postId: number, body: string) =>
        api.post<CommentObject>(`/posts/${postId}/comments/`, { body }),
};

export const followApi = {
    getFollowers: async (userId: number): Promise<FollowRelation[]> => {
        const res = await api.get<FollowRelation[] | Paginated<FollowRelation>>(
            `/users/${userId}/followers/`
        );
        return unwrapList(res.data);
    },

    getFollowing: async (userId: number): Promise<FollowRelation[]> => {
        const res = await api.get<FollowRelation[] | Paginated<FollowRelation>>(
            `/users/${userId}/following/`
        );
        return unwrapList(res.data);
    },
};
