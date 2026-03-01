import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, MessageCircle, Lock, Users, Bookmark, Send } from "lucide-react";
import type { PostObject } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { postsApi } from "@/features/posts/api/posts.api";
import { toast } from "sonner";
import ReactionButton from "@/features/engagement/components/ReactionButton";
import CommentSection from "@/features/engagement/components/CommentSection";

interface PostCardProps {
    post: PostObject;
    onDelete?: (id: number) => void;
    onUpdate?: (post: PostObject) => void;
    onReactionUpdate?: (id: number, delta: number) => void;
}

import { resolveMedia } from "@/lib/config";

export default function PostCard({ post, onDelete, onReactionUpdate }: PostCardProps) {
    const currentUser = useAuthStore((s) => s.user);
    const isOwner = currentUser?.id === post.author.id;
    const [showComments, setShowComments] = useState(false);
    const [reactionsCount, setReactionsCount] = useState(post.reactions_count);

    const handleDelete = async () => {
        try {
            await postsApi.delete(post.id);
            onDelete?.(post.id);
            toast.success("Post deleted.");
        } catch {
            toast.error("Failed to delete post.");
        }
    };

    const handleReactionChange = (delta: number) => {
        setReactionsCount((c) => c + delta);
        onReactionUpdate?.(post.id, delta);
    };

    const visibilityIcon =
        post.visibility === "private" ? (
            <Lock className="w-3 h-3" />
        ) : post.visibility === "friends" ? (
            <Users className="w-3 h-3" />
        ) : null;

    return (
        <article
            className="rounded-md mb-6"
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dbdbdb",
            }}
        >
            {/* ── Post Header ── */}
            <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={resolveMedia(post.author.avatar ?? "")} />
                            <AvatarFallback
                                className="text-xs font-semibold"
                                style={{ backgroundColor: "#efefef", color: "#262626" }}
                            >
                                {post.author.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex flex-col leading-none">
                        <Link
                            to={`/profile/${post.author.id}`}
                            className="font-semibold text-[14px] hover:opacity-70 transition-opacity"
                            style={{ color: "#262626" }}
                        >
                            {post.author.username}
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5">
                            {visibilityIcon && (
                                <span style={{ color: "#8e8e8e" }}>{visibilityIcon}</span>
                            )}
                            <span className="text-[11px]" style={{ color: "#8e8e8e" }}>
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="p-1 rounded-full transition-opacity hover:opacity-60"
                            style={{ color: "#262626" }}
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDelete} className="gap-2" style={{ color: "#ed4956" }}>
                                <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* ── Media ── */}
            {post.media.length > 0 && (
                <div className="w-full" style={{ borderTop: "1px solid #efefef", borderBottom: "1px solid #efefef" }}>
                    {post.media.map((m) =>
                        m.media_type === "image" ? (
                            <img
                                key={m.id}
                                src={resolveMedia(m.file)}
                                alt="Post media"
                                className="w-full block"
                                style={{ maxHeight: "600px", objectFit: "cover" }}
                            />
                        ) : (
                            <video
                                key={m.id}
                                src={resolveMedia(m.file)}
                                controls
                                className="w-full block"
                            />
                        )
                    )}
                </div>
            )}

            {/* ── Action row ── */}
            <div className="px-3 pt-3 pb-2">
                <div className="flex items-center gap-3 mb-2">
                    {/* Like (Heart) */}
                    <ReactionButton
                        postId={post.id}
                        reactionsCount={reactionsCount}
                        initialReaction={post.user_reaction}
                        onReactionChange={handleReactionChange}
                    />
                    {/* Comment */}
                    <button
                        onClick={() => setShowComments((v) => !v)}
                        className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
                        style={{ color: "#262626" }}
                        title="Comment"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                    {/* Share (decorative) */}
                    <button
                        className="flex items-center transition-opacity hover:opacity-60"
                        style={{ color: "#262626" }}
                        title="Share"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                    {/* Bookmark (decorative, pushed right) */}
                    <button
                        className="flex items-center transition-opacity hover:opacity-60 ml-auto"
                        style={{ color: "#262626" }}
                        title="Save"
                    >
                        <Bookmark className="w-6 h-6" />
                    </button>
                </div>

                {/* Like count */}
                {reactionsCount > 0 && (
                    <p className="text-[14px] font-semibold mb-1" style={{ color: "#262626" }}>
                        {reactionsCount.toLocaleString()} {reactionsCount === 1 ? "like" : "likes"}
                    </p>
                )}

                {/* Caption */}
                {(post.body || post.hashtags.length > 0) && (
                    <p className="text-[14px] leading-relaxed mb-1">
                        <Link
                            to={`/profile/${post.author.id}`}
                            className="font-semibold mr-1 hover:opacity-70 transition-opacity"
                            style={{ color: "#262626" }}
                        >
                            {post.author.username}
                        </Link>
                        <span style={{ color: "#262626" }}>{post.body}</span>
                        {post.hashtags.length > 0 && (
                            <>
                                {" "}
                                {post.hashtags.map((h) => (
                                    <span key={h.id} className="cursor-pointer hover:opacity-70" style={{ color: "#00376b" }}>
                                        #{h.name}{" "}
                                    </span>
                                ))}
                            </>
                        )}
                    </p>
                )}

                {/* Comment count trigger */}
                {post.comments_count > 0 && !showComments && (
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-[14px] hover:opacity-60 transition-opacity block mb-1"
                        style={{ color: "#8e8e8e" }}
                    >
                        View all {post.comments_count} comment{post.comments_count !== 1 ? "s" : ""}
                    </button>
                )}

                {/* Timestamp */}
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#8e8e8e" }}>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>

            {/* ── Comments ── */}
            {showComments && (
                <div style={{ borderTop: "1px solid #efefef" }}>
                    <CommentSection postId={post.id} />
                </div>
            )}
        </article>
    );
}
