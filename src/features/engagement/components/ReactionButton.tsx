import { useState } from "react";
import { Heart } from "lucide-react";
import { engagementApi } from "@/features/engagement/api/engagement.api";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/types";

interface Props {
    postId: number;
    reactionsCount: number;
    initialReaction: ReactionType | null; // from server: null means not reacted
    onReactionChange: (delta: number) => void;
}

const REACT_TYPE: ReactionType = "like";

export default function ReactionButton({
    postId,
    reactionsCount,
    initialReaction,
    onReactionChange,
}: Props) {
    // Initialize from server state
    const [liked, setLiked] = useState<boolean>(initialReaction !== null);
    const [count, setCount] = useState<number>(reactionsCount);
    const [pending, setPending] = useState(false);

    const handleClick = async () => {
        if (pending) return;
        setPending(true);

        const wasLiked = liked;
        const delta = wasLiked ? -1 : 1;

        // Optimistic update
        setLiked(!wasLiked);
        setCount((c) => c + delta);
        onReactionChange(delta);

        try {
            await engagementApi.react(postId, REACT_TYPE);
        } catch {
            // Rollback
            setLiked(wasLiked);
            setCount((c) => c - delta);
            onReactionChange(-delta);
        } finally {
            setPending(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={pending}
            className={cn(
                "flex items-center gap-1.5 text-sm transition-colors select-none",
                liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            )}
        >
            <Heart className={cn("w-4 h-4 transition-transform", liked && "fill-current scale-110")} />
            <span>{count}</span>
        </button>
    );
}
