import { api } from "@/lib/axios";
import { unwrapList } from "@/lib/api";
import type { PaginatedResponse, UserPublicObject } from "@/types";
import type { ChatConversation, ChatMessage, ChatMessageType } from "@/features/chat/types";

export const chatApi = {
    getConversations: async () => {
        const res = await api.get<ChatConversation[] | PaginatedResponse<ChatConversation>>("/conversations/");
        return unwrapList(res.data);
    },

    getMessagesByConversation: async (conversationId: number) => {
        const res = await api.get<ChatMessage[] | PaginatedResponse<ChatMessage>>(
            `/conversations/${conversationId}/messages/`,
            { params: { page_size: 50 } }
        );
        return unwrapList(res.data);
    },

    getMessagesByUser: async (userId: number) => {
        const res = await api.get<ChatMessage[] | PaginatedResponse<ChatMessage>>(`/messages/${userId}/`);
        return unwrapList(res.data);
    },

    sendMessage: async (payload: {
        user_id: number;
        conversation?: number;
        temp_id?: string;
        body?: string;
        message_type?: ChatMessageType;
        image?: File;
        voice?: File;
    }) => {
        const form = new FormData();
        form.append("user_id", String(payload.user_id));
        if (payload.conversation) form.append("conversation", String(payload.conversation));
        if (payload.temp_id) form.append("temp_id", payload.temp_id);
        if (payload.body) form.append("body", payload.body);
        if (payload.message_type) form.append("message_type", payload.message_type);
        if (payload.image) form.append("image", payload.image);
        if (payload.voice) form.append("voice", payload.voice);

        const res = await api.post<ChatMessage>("/messages/", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    getSuggestedUsers: async () => {
        const res = await api.get<UserPublicObject[] | PaginatedResponse<UserPublicObject>>("/users/suggestions/");
        return unwrapList(res.data);
    },
};
