import { WS_BASE_URL } from "@/lib/config";
import { authStorage } from "@/lib/auth";

export type SocketEventHandler = (event: MessageEvent) => void;

export function connectChatSocket(
    conversationId: number,
    onMessage: SocketEventHandler,
    onOpen?: () => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (event: Event) => void,
) {
    const token = authStorage.getAccess();
    const ws = new WebSocket(
        `${WS_BASE_URL}/ws/chat/${conversationId}/?token=${token ?? ""}`
    );

    // Register ALL handlers before the connection is established
    // to avoid race conditions where onopen fires before assignment
    ws.onmessage = onMessage;
    if (onOpen) ws.onopen = onOpen;
    if (onClose) ws.onclose = onClose;
    if (onError) ws.onerror = onError;

    return ws;
}
