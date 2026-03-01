import { useState } from "react";
import { Heart } from "lucide-react";
import { engagementApi } from "@/features/engagement/api/engagement.api";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/types";

interface Props {
    postId: number;
    reactionsCount: number;
    initialReaction: ReactionType | null;
    onReactionChange: (delta: number) => void;
}

const REACT_TYPE: ReactionType = "like";

export default function ReactionButton({
    postId,
    reactionsCount,
    initialReaction,
    onReactionChange,
}: Props) {
    const [liked, setLiked] = useState<boolean>(initialReaction !== null);
    const [pending, setPending] = useState(false);
    const [animating, setAnimating] = useState(false);
    void reactionsCount; // count is displayed by the parent PostCard

    const handleClick = async () => {
        if (pending) return;
        setPending(true);

        const wasLiked = liked;
        const delta = wasLiked ? -1 : 1;

        // Trigger animation
        if (!wasLiked) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 300);
        }

        // Optimistic update
        setLiked(!wasLiked);
        onReactionChange(delta);

        try {
            await engagementApi.react(postId, REACT_TYPE);
        } catch {
            // Rollback
            setLiked(wasLiked);
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
                "flex items-center transition-all select-none",
                pending && "opacity-50 cursor-not-allowed"
            )}
            title={liked ? "Unlike" : "Like"}
        >
            <Heart
                className={cn(
                    "w-6 h-6 transition-all duration-200",
                    liked ? "fill-current scale-110" : "hover:opacity-60",
                    animating && "scale-125"
                )}
                style={{
                    color: liked ? "#ed4956" : "#262626",
                    fill: liked ? "#ed4956" : "none",
                    transition: "color 0.15s ease, fill 0.15s ease, transform 0.2s ease",
                }}
            />
        </button>
    );
}
