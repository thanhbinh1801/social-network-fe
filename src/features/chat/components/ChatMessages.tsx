import { useEffect, useRef } from "react";
import { resolveMedia } from "@/lib/config";
import type { ChatMessage } from "@/features/chat/types";

interface ChatMessagesProps {
    messages: ChatMessage[];
    meId?: number;
    isPeerTyping?: boolean;
}

export default function ChatMessages({ messages, meId, isPeerTyping }: ChatMessagesProps) {
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {messages.map((message) => {
                const mine = message.sender.id === meId;
                return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                mine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                            }`}
                        >
                            {message.message_type === "image" && message.image ? (
                                <img
                                    src={resolveMedia(message.image)}
                                    alt="message"
                                    className="mb-2 max-h-72 rounded-md object-cover"
                                />
                            ) : null}
                            {message.body ? <p>{message.body}</p> : null}
                        </div>
                    </div>
                );
            })}
            {isPeerTyping ? (
                <div className="flex justify-start">
                    <div className="rounded-2xl bg-gray-200 px-3 py-2 text-sm text-gray-700">
                        <span className="inline-flex gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.2s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.1s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                        </span>
                    </div>
                </div>
            ) : null}
            <div ref={endRef} />
        </div>
    );
}
