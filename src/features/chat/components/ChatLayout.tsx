import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatInput from "@/features/chat/components/ChatInput";
import ChatMessages from "@/features/chat/components/ChatMessages";
import type { ChatMessage } from "@/features/chat/types";
import type { UserPublicObject } from "@/types";

interface ChatLayoutProps {
    selectedUser: UserPublicObject;
    messages: ChatMessage[];
    onlineStatus: string;
    myUserId?: number;
    isPeerTyping?: boolean;
    onBack: () => void;
    onClose: () => void;
    onSend: (params: { body: string; images?: File[] }) => Promise<void>;
    onTypingChange?: (typing: boolean) => void;
}

export default function ChatLayout({
    selectedUser,
    messages,
    onlineStatus,
    myUserId,
    isPeerTyping,
    onBack,
    onClose,
    onSend,
    onTypingChange,
}: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100dvh-3rem)] flex-col rounded-xl border bg-background">
            <ChatHeader user={selectedUser} onlineStatus={onlineStatus} onBack={onBack} onClose={onClose} />
            <ChatMessages messages={messages} meId={myUserId} isPeerTyping={isPeerTyping} />
            <ChatInput onSend={onSend} onTypingChange={onTypingChange} />
        </div>
    );
}
