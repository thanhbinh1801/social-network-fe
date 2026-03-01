import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { engagementApi } from "@/features/engagement/api/engagement.api";
import type { CommentObject } from "@/types";
import { toast } from "sonner";
import { resolveMedia } from "@/lib/config";

interface Props { postId: number }

export default function CommentSection({ postId }: Props) {
    const [comments, setComments] = useState<CommentObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        engagementApi.getComments(postId)
            .then((data) => {
                setComments(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load comments.");
                setLoading(false);
            });
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await engagementApi.createComment(postId, body.trim());
            setComments((prev) => [data, ...prev]);
            setBody("");
        } catch {
            toast.error("Failed to post comment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Comments list */}
            {loading ? (
                <div className="px-3 py-2 space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-2">
                            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-3 pt-2 pb-1 space-y-2">
                    {comments.length === 0 && (
                        <p className="text-sm text-center py-2" style={{ color: "#8e8e8e" }}>
                            No comments yet. Be the first!
                        </p>
                    )}
                    {comments.map((c) => (
                        <CommentItem key={c.id} comment={c} />
                    ))}
                </div>
            )}

            {/* Inline comment input — Instagram style */}
            <form
                onSubmit={handleSubmit}
                className="flex items-center px-3 py-2"
                style={{ borderTop: "1px solid #efefef" }}
            >
                <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 text-[14px] bg-transparent outline-none"
                    style={{ color: "#262626" }}
                    disabled={submitting}
                />
                {body.trim() && (
                    <button
                        type="submit"
                        disabled={submitting}
                        className="text-[14px] font-semibold ml-2 transition-opacity hover:opacity-70 disabled:opacity-40"
                        style={{ color: "#0095f6" }}
                    >
                        {submitting ? "Posting…" : "Post"}
                    </button>
                )}
            </form>
        </div>
    );
}

function CommentItem({ comment }: { comment: CommentObject }) {
    const [showReplies, setShowReplies] = useState(false);
    return (
        <div className="flex gap-2">
            <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={resolveMedia(comment.user.avatar ?? "")} />
                <AvatarFallback
                    className="text-[10px] font-semibold"
                    style={{ backgroundColor: "#efefef", color: "#262626" }}
                >
                    {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-[14px] leading-snug">
                    <span className="font-semibold mr-1" style={{ color: "#262626" }}>
                        {comment.user.username}
                    </span>
                    <span style={{ color: "#262626" }}>{comment.body}</span>
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px]" style={{ color: "#8e8e8e" }}>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.replies_count > 0 && (
                        <button
                            onClick={() => setShowReplies((v) => !v)}
                            className="text-[11px] font-semibold transition-opacity hover:opacity-70"
                            style={{ color: "#8e8e8e" }}
                        >
                            {showReplies
                                ? "Hide replies"
                                : `View ${comment.replies_count} repl${comment.replies_count === 1 ? "y" : "ies"}`}
                        </button>
                    )}
                </div>
                {/* Nested replies */}
                {showReplies && comment.replies.length > 0 && (
                    <div className="mt-2 ml-2 space-y-2">
                        {comment.replies.map((r) => (
                            <div key={r.id} className="flex gap-2">
                                <Avatar className="w-6 h-6 flex-shrink-0">
                                    <AvatarImage src={resolveMedia(r.user.avatar ?? "")} />
                                    <AvatarFallback className="text-[9px]" style={{ backgroundColor: "#efefef", color: "#262626" }}>
                                        {r.user.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-[13px] leading-snug">
                                    <span className="font-semibold mr-1" style={{ color: "#262626" }}>
                                        {r.user.username}
                                    </span>
                                    <span style={{ color: "#262626" }}>{r.body}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
