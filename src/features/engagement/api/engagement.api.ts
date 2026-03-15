import { api } from "@/lib/axios";
import { unwrapList } from "@/lib/api";
import type { CommentObject, FollowRelation, PaginatedResponse } from "@/types";

export const engagementApi = {
    react: (postId: number, type: string) =>
        api.post<{ detail: string }>(`/posts/${postId}/react/`, { type }),

    getComments: async (postId: number): Promise<CommentObject[]> => {
        const res = await api.get<CommentObject[] | PaginatedResponse<CommentObject>>(
            `/posts/${postId}/comments/`
        );
        return unwrapList(res.data);
    },

    createComment: (postId: number, body: string) =>
        api.post<CommentObject>(`/posts/${postId}/comments/`, { body }),

    getReplies: async (commentId: number): Promise<CommentObject[]> => {
        const res = await api.get<CommentObject[] | PaginatedResponse<CommentObject>>(
            `/comments/${commentId}/replies/`
        );
        return unwrapList(res.data);
    },

    createReply: (commentId: number, body: string) =>
        api.post<CommentObject>(`/comments/${commentId}/replies/`, { body }),

    updateComment: (commentId: number, body: string) =>
        api.patch<CommentObject>(`/comments/${commentId}/`, { body }),

    deleteComment: (commentId: number) => api.delete(`/comments/${commentId}/`),

    sharePost: (postId: number, quote?: string) =>
        api.post(`/posts/${postId}/share/`, quote ? { quote } : {}),
};

export const followApi = {
    getFollowers: async (userId: number): Promise<FollowRelation[]> => {
        const res = await api.get<FollowRelation[] | PaginatedResponse<FollowRelation>>(
            `/users/${userId}/followers/`
        );
        return unwrapList(res.data);
    },

    getFollowing: async (userId: number): Promise<FollowRelation[]> => {
        const res = await api.get<FollowRelation[] | PaginatedResponse<FollowRelation>>(
            `/users/${userId}/following/`
        );
        return unwrapList(res.data);
    },
};
