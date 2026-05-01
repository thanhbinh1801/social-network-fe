import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { chatApi } from "@/features/chat/api/chat.api";
import ChatLayout from "@/features/chat/components/ChatLayout";
import type { ChatConversation, ChatMessage } from "@/features/chat/types";
import { profileApi } from "@/features/profile/api/profile.api";
import { resolveMedia } from "@/lib/config";
import { connectChatSocket } from "@/services/socket";
import { useAuthStore } from "@/store/auth.store";
import type { UserPublicObject } from "@/types";
import { toast } from "sonner";

type ViewMode = "list" | "chat";

function toOptimisticMessage(me: UserPublicObject, conversationId: number, body: string, image?: File): ChatMessage {
    // Append a random string because Date.now() can be identical in a synchronous loop
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return {
        id: `temp-${Date.now()}-${randomSuffix}`,
        conversation: conversationId,
        sender: me,
        body,
        message_type: image ? "image" : "text",
        image: image ? URL.createObjectURL(image) : null,
        voice: null,
        is_seen: false,
        seen_at: null,
        created_at: new Date().toISOString(),
        optimistic: true,
    };
}

export default function ChatPage() {
    const me = useAuthStore((state) => state.user);
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
    const [directUser, setDirectUser] = useState<UserPublicObject | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineStatus, setOnlineStatus] = useState("Active recently");
    const [isPeerTyping, setIsPeerTyping] = useState(false);
    const [unreadConversationIds, setUnreadConversationIds] = useState<Set<number>>(new Set());

    const socketRef = useRef<WebSocket | null>(null);
    const socketConversationRef = useRef<number | null>(null);
    const locallyReadLastMessageByConversationRef = useRef<Map<number, string | number>>(new Map());
    const directInitRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    // Use a ref so socket handlers always read the latest `me` without stale closure
    const meRef = useRef(me);
    useEffect(() => { meRef.current = me; }, [me]);
    // Track viewMode in a ref so the socket closure never reads a stale value
    const viewModeRef = useRef(viewMode);
    useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

    const directUserIdParam = searchParams.get("userId");
    const isDirectMode = Boolean(directUserIdParam);

    const selectedUser = useMemo(() => {
        if (directUser) return directUser;
        if (!selectedConversation || !me) return null;
        return (
            selectedConversation.participants.find((participant) => participant.id !== me.id) ??
            selectedConversation.participants[0] ??
            null
        );
    }, [selectedConversation, me, directUser]);

    const activeConversationId = selectedConversation?.id ?? null;
    const visibleMessages = useMemo(() => {
        if (!activeConversationId) return messages;
        return messages.filter((message) => message.conversation === activeConversationId);
    }, [messages, activeConversationId]);

    const loadConversations = async () => {
        const data = await chatApi.getConversations();
        setConversations(data);
        const serverUnread = new Set<number>();
        for (const conversation of data) {
            const lastMessage = conversation.last_message;
            if (!lastMessage || !me) continue;
            if (lastMessage.sender.id === me.id || lastMessage.is_seen) continue;

            const locallyReadLastMessageId = locallyReadLastMessageByConversationRef.current.get(conversation.id);
            const isAlreadyReadLocally = locallyReadLastMessageId === lastMessage.id;
            if (!isAlreadyReadLocally) {
                serverUnread.add(conversation.id);
            }
        }
        const filteredUnread = serverUnread;
        setUnreadConversationIds(filteredUnread);
    };

    useEffect(() => {
        void loadConversations();
    }, []);

    useEffect(() => {
        if (viewMode !== "list") return;
        const intervalId = window.setInterval(() => {
            void loadConversations();
        }, 1500);
        return () => window.clearInterval(intervalId);
    }, [viewMode, me]);

    const connectSocket = (conversationId: number, targetUserId?: number) => {
        if (
            socketConversationRef.current === conversationId &&
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            return;
        }

        socketRef.current?.close();
        socketConversationRef.current = conversationId;

        socketRef.current = connectChatSocket(
            conversationId,
            (event) => {
                const data = JSON.parse(event.data);

                if (data.event === "receive_message") {
                    const incomingId = data.payload.id;
                    const currentMe = meRef.current;
                    const isFromOther = currentMe && data.payload.sender_id !== currentMe.id;

                    setMessages((prev) => {
                        // Skip if message already exists (dedup by real ID)
                        if (prev.some((m) => m.id === incomingId)) return prev;

                        // Own message: replace optimistic temp OR skip (REST already committed it)
                        if (!isFromOther) {
                            if (data.payload.temp_id) {
                                const hasTemp = prev.some((m) => String(m.id) === String(data.payload.temp_id));
                                if (hasTemp) {
                                    // Replace the optimistic row with confirmed data
                                    return prev.map((m) =>
                                        String(m.id) === String(data.payload.temp_id)
                                            ? { ...m, ...data.payload, sender: m.sender, optimistic: false }
                                            : m
                                    );
                                }
                            }
                            // REST response already committed this message — don't add again
                            return prev;
                        }

                        // ── Message from ANOTHER user ──────────────────────────────────
                        // NOTE: Do NOT check temp_id here. temp_id belongs to the sender's
                        // client — the recipient has no matching optimistic row. If we tried
                        // to map() on it we'd return `prev` unchanged and silently drop the
                        // message. Always append the incoming message directly.
                        const sender: UserPublicObject = {
                            id: data.payload.sender_id,
                            username: data.payload.sender_username,
                            email: "",
                            avatar: null,
                            cover: null,
                            bio: "",
                            website: "",
                            location: "",
                            followers_count: 0,
                            following_count: 0,
                            is_following: false,
                            date_joined: data.payload.created_at,
                        };
                        return [...prev, { ...data.payload, sender }];
                    });

                    // When message arrives from another user, update the conversation list
                    // in real-time: bump last_message preview and mark as unread.
                    if (isFromOther) {
                        const incomingConvId: number = data.payload.conversation ?? conversationId;
                        setConversations((prevConvs) =>
                            prevConvs.map((conv) =>
                                conv.id === incomingConvId
                                    ? {
                                          ...conv,
                                          last_message: {
                                              ...data.payload,
                                              id: incomingId,
                                              is_seen: false,
                                          } as ChatMessage,
                                      }
                                    : conv
                            )
                        );
                        // Mark unread only if we're not currently viewing this conversation
                        if (socketConversationRef.current !== incomingConvId || viewModeRef.current !== "chat") {
                            locallyReadLastMessageByConversationRef.current.delete(incomingConvId);
                            setUnreadConversationIds((prev) => new Set([...prev, incomingConvId]));
                        }
                    }
                }


                if (data.event === "typing") {
                    setIsPeerTyping(Boolean(data.is_typing));
                }

                if (data.event === "presence_update" && targetUserId && data.payload.user_id === targetUserId) {
                    setOnlineStatus(data.payload.is_online ? "Active now" : "Active recently");
                }

                if (data.event === "messages_seen") {
                    const seenIds: Array<number> = data.payload.message_ids ?? [];
                    setMessages((prev) =>
                        prev.map((m) =>
                            seenIds.includes(Number(m.id)) ? { ...m, is_seen: true, seen_at: data.payload.seen_at } : m
                        )
                    );
                }
            },
            // onopen - registered before connection, no race condition
            () => {
                setIsSocketConnected(true);
            },
            // onclose - auto-reconnect
            () => {
                setIsSocketConnected(false);
                if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = window.setTimeout(() => {
                    if (socketConversationRef.current === conversationId) {
                        connectSocket(conversationId, targetUserId);
                    }
                }, 1500);
            },
            // onerror
            () => {
                setIsSocketConnected(false);
            },
        );
    };


    const openConversation = async (conversation: ChatConversation) => {
        setDirectUser(null);
        setSelectedConversation(conversation);
        setViewMode("chat");
        setOnlineStatus("Active recently");
        setIsPeerTyping(false);
        // Clear unread indicator for this conversation
        if (conversation.last_message?.id !== undefined && conversation.last_message?.id !== null) {
            locallyReadLastMessageByConversationRef.current.set(conversation.id, conversation.last_message.id);
        }
        setUnreadConversationIds((prev) => {
            const next = new Set(prev);
            next.delete(conversation.id);
            return next;
        });

        const history = await chatApi.getMessagesByConversation(conversation.id);
        setMessages([...history].reverse());

        const target = me ? conversation.participants.find((p) => p.id !== me.id) : null;
        connectSocket(conversation.id, target?.id);
    };

    useEffect(() => {
        const userIdParam = directUserIdParam;
        if (!userIdParam || !me) return;
        if (directInitRef.current === userIdParam) return;

        const userId = Number(userIdParam);
        if (!userId || userId === me.id) return;

        directInitRef.current = userIdParam;

        const fromState = (location.state as { prefillUser?: UserPublicObject } | null)?.prefillUser;

        const openFromConversation = async () => {
            const existing = conversations.find(
                (conversation) =>
                    conversation.participants.some((participant) => participant.id === me.id) &&
                    conversation.participants.some((participant) => participant.id === userId)
            );

            if (existing) {
                await openConversation(existing);
                return;
            }

            if (fromState) {
                setDirectUser(fromState);
                setSelectedConversation(null);
                setMessages([]);
                setViewMode("chat");
                return;
            }

            try {
                const { data } = await profileApi.getUser(userId);
                setDirectUser(data);
                setSelectedConversation(null);
                setMessages([]);
                setViewMode("chat");
            } catch {
                setViewMode("list");
            }
        };

        void openFromConversation();
    }, [directUserIdParam, me, conversations, location.state]);

    useEffect(() => {
        if (!me || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const unseenIds = messages
            .filter((m) => m.sender.id !== me.id && !m.is_seen && typeof m.id === "number")
            .map((m) => m.id as number);

        if (unseenIds.length === 0) return;
        socketRef.current.send(JSON.stringify({ event: "mark_seen", message_ids: unseenIds }));
    }, [messages, me]);

    useEffect(() => {
        if (!activeConversationId) return;
        const id = window.setInterval(async () => {
            if (isSocketConnected) return;
            try {
                const latest = await chatApi.getMessagesByConversation(activeConversationId);
                const normalized = [...latest].reverse();
                setMessages((prev) => {
                    const optimistic = prev.filter((m) => String(m.id).startsWith("temp-"));
                    const merged = [...normalized];
                    for (const item of optimistic) {
                        if (!merged.some((m) => m.id === item.id)) {
                            merged.push(item);
                        }
                    }
                    return merged;
                });
            } catch {
                // ignore transient sync errors
            }
        }, 2000);
        return () => window.clearInterval(id);
    }, [activeConversationId, isSocketConnected]);

    // Cleanup on unmount: close socket and cancel reconnect timer
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
            socketConversationRef.current = null; // prevent reconnect after unmount
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, []);

    const sendTyping = (typing: boolean) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({ event: "typing", is_typing: typing }));
    };

    const handleSend = async ({ body, images }: { body: string; images?: File[] }) => {
        if (!me || !selectedUser) return;

        const localConversationId = activeConversationId ?? 0;
        const queuedImages = images ?? [];
        const optimisticText =
            body.trim().length > 0 ? toOptimisticMessage(me, localConversationId, body, undefined) : null;
        const optimisticImages = queuedImages.map((file) =>
            toOptimisticMessage(me, localConversationId, "", file)
        );
        const optimisticQueue = [optimisticText, ...optimisticImages].filter(Boolean) as ChatMessage[];
        if (optimisticQueue.length > 0) {
            setMessages((prev) => [...prev, ...optimisticQueue]);
        }

        try {
            let lastConversationId = activeConversationId ?? undefined;
            const createdPairs: Array<{ tempId: string; created: ChatMessage }> = [];

            if (body.trim().length > 0 && optimisticText) {
                const createdText = await chatApi.sendMessage({
                    user_id: selectedUser.id,
                    conversation: lastConversationId,
                    temp_id: String(optimisticText.id),
                    body,
                    message_type: "text",
                });
                lastConversationId = createdText.conversation;
                createdPairs.push({ tempId: String(optimisticText.id), created: createdText });
            }

            for (let index = 0; index < queuedImages.length; index += 1) {
                const file = queuedImages[index];
                const optimisticImage = optimisticImages[index];
                const createdImage = await chatApi.sendMessage({
                    user_id: selectedUser.id,
                    conversation: lastConversationId,
                    temp_id: String(optimisticImage.id),
                    body: "",
                    message_type: "image",
                    image: file,
                });
                lastConversationId = createdImage.conversation;
                createdPairs.push({ tempId: String(optimisticImage.id), created: createdImage });
            }

            // Immediate local commit from REST response (single source for sender-side render).
            // WS is still used for peer-side realtime delivery.
            setMessages((prev) => {
                let next = [...prev];
                for (const pair of createdPairs) {
                    const hasCreated = next.some((m) => m.id === pair.created.id);
                    if (hasCreated) {
                        next = next.filter((m) => String(m.id) !== pair.tempId);
                        continue;
                    }
                    next = next.map((m) =>
                        String(m.id) === pair.tempId
                            ? { ...pair.created, conversation: pair.created.conversation, optimistic: false }
                            : m
                    );
                }
                return next;
            });

            await loadConversations();

            if (!lastConversationId) {
                sendTyping(false);
                return;
            }

            if (!selectedConversation && lastConversationId) {
                const data = await chatApi.getConversations();
                const createdConversation = data.find((conversation) => conversation.id === lastConversationId);
                if (createdConversation) {
                    setSelectedConversation(createdConversation);
                    setDirectUser(null);
                    connectSocket(createdConversation.id, selectedUser.id);
                }
            }
            if (selectedConversation && lastConversationId !== selectedConversation.id) {
                const data = await chatApi.getConversations();
                const actualConversation = data.find((conversation) => conversation.id === lastConversationId);
                if (actualConversation) {
                    await openConversation(actualConversation);
                }
            }

            const targetConversationId = lastConversationId;
            if (
                targetConversationId &&
                (socketConversationRef.current !== targetConversationId ||
                    socketRef.current?.readyState !== WebSocket.OPEN)
            ) {
                connectSocket(targetConversationId, selectedUser.id);
            }

            sendTyping(false);
        } catch {
            const optimisticIds = new Set(optimisticQueue.map((m) => m.id));
            setMessages((prev) => prev.filter((m) => !optimisticIds.has(m.id)));
            toast.error("Send message failed. Please try again.");
        }
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="h-[calc(100dvh-3rem)] w-full overflow-hidden">
                {viewMode === "list" && !isDirectMode ? (
                    <div className="h-full overflow-y-auto rounded-xl border bg-background p-3">
                        <h2 className="mb-3 text-2xl font-semibold">Messages</h2>
                        <div className="space-y-2">
                            {conversations.map((conversation) => {
                                const user = me
                                    ? conversation.participants.find((participant) => participant.id !== me.id)
                                    : conversation.participants[0];
                                if (!user) return null;

                                const isUnread = unreadConversationIds.has(conversation.id);
                                const lastBody = conversation.last_message?.body || "Sent an attachment";

                                return (
                                    <Button
                                        key={conversation.id}
                                        variant="ghost"
                                        className="h-auto w-full justify-start gap-3 py-3"
                                        onClick={() => void openConversation(conversation)}
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={resolveMedia(user.avatar)} />
                                            <AvatarFallback>{user.username.slice(0, 1).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1 text-left">
                                            <p className={isUnread ? "truncate font-bold" : "truncate font-medium"}>
                                                {user.username}
                                            </p>
                                            <p className={isUnread
                                                ? "truncate text-xs font-semibold text-foreground"
                                                : "truncate text-xs text-muted-foreground"
                                            }>
                                                {lastBody}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <span
                                                className="ml-auto mb-1 h-2.5 w-2.5 shrink-0 self-end rounded-full bg-[#d97706]"
                                                aria-label="Unread message"
                                            />
                                        )}
                                    </Button>
                                );
                            })}
                            {conversations.length === 0 ? (
                                <p className="px-2 py-3 text-sm text-muted-foreground">No conversations yet.</p>
                            ) : null}
                        </div>
                    </div>
                ) : selectedUser ? (
                    <ChatLayout
                        selectedUser={selectedUser}
                        messages={visibleMessages}
                        onlineStatus={onlineStatus}
                        myUserId={me?.id}
                        isPeerTyping={isPeerTyping}
                        onBack={() => setViewMode("list")}
                        onClose={() => {
                            setViewMode("list");
                            setSelectedConversation(null);
                            setMessages([]);
                            socketRef.current?.close();
                            socketRef.current = null;
                            socketConversationRef.current = null;
                            if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
                            reconnectTimeoutRef.current = null;
                            setIsSocketConnected(false);
                            setIsPeerTyping(false);
                        }}
                        onTypingChange={(typing) => {
                            sendTyping(typing);
                            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = window.setTimeout(() => sendTyping(false), 1200);
                        }}
                        onSend={handleSend}
                    />
                ) : null}
            </div>
        </div>
    );
}
