import type { UserPublicObject } from "@/types";

export type ChatMessageType = "text" | "image" | "voice";

export interface ChatMessage {
    id: number | string;
    conversation: number;
    sender: UserPublicObject;
    body: string;
    message_type: ChatMessageType;
    image: string | null;
    voice: string | null;
    is_seen: boolean;
    seen_at: string | null;
    created_at: string;
    optimistic?: boolean;
}

export interface PresencePayload {
    user_id: number;
    is_online: boolean;
    last_active_at: string;
}

export interface ChatConversation {
    id: number;
    participants: UserPublicObject[];
    is_group: boolean;
    name: string;
    last_message: ChatMessage | null;
    created_at: string;
    updated_at: string;
}
