import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
        <div className="border-t border-gray-100 pt-3 space-y-3">
            {/* New comment form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a comment…"
                    rows={1}
                    className="resize-none text-sm"
                />
                <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
                    Post
                </Button>
            </form>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
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
            )}

            {/* Comments list */}
            {!loading && (
                <div className="space-y-3">
                    {comments.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-2">No comments yet.</p>
                    )}
                    {comments.map((c) => (
                        <CommentItem key={c.id} comment={c} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CommentItem({ comment }: { comment: CommentObject }) {
    const [showReplies, setShowReplies] = useState(false);
    return (
        <div className="flex gap-2">
            <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={resolveMedia(comment.user.avatar ?? "")} />
                <AvatarFallback className="text-xs">{comment.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <span className="font-semibold text-xs">{comment.user.username}</span>
                    <p className="text-sm mt-0.5 break-words">{comment.body}</p>
                </div>
                <div className="flex items-center gap-3 ml-1 mt-0.5">
                    <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.replies_count > 0 && (
                        <button
                            onClick={() => setShowReplies((v) => !v)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {showReplies ? "Hide" : `${comment.replies_count} repl${comment.replies_count === 1 ? "y" : "ies"}`}
                        </button>
                    )}
                </div>
                {/* Nested replies */}
                {showReplies && comment.replies.length > 0 && (
                    <div className="mt-2 ml-3 space-y-2">
                        {comment.replies.map((r) => (
                            <div key={r.id} className="flex gap-2">
                                <Avatar className="w-6 h-6 flex-shrink-0">
                                    <AvatarImage src={resolveMedia(r.user.avatar ?? "")} />
                                    <AvatarFallback className="text-[10px]">{r.user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-50 rounded-xl px-3 py-2">
                                    <span className="font-semibold text-xs">{r.user.username}</span>
                                    <p className="text-sm mt-0.5 break-words">{r.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
