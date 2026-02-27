import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, MessageCircle, Lock, Users } from "lucide-react";
import type { PostObject } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
        <article className="px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex gap-3">
                {/* Avatar */}
                <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={resolveMedia(post.author.avatar ?? "")} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-semibold">
                            {post.author.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Link
                                to={`/profile/${post.author.id}`}
                                className="font-semibold text-[15px] hover:underline truncate"
                            >
                                {post.author.username}
                            </Link>
                            {visibilityIcon && (
                                <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                                    {visibilityIcon}
                                    {post.visibility}
                                </Badge>
                            )}
                            <span className="text-gray-500 text-sm flex-shrink-0">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDelete} className="text-red-500 gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Body */}
                    {post.body && (
                        <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {post.body}
                        </p>
                    )}

                    {/* Media */}
                    {post.media.length > 0 && (
                        <div className="mt-3 rounded-xl overflow-hidden grid gap-1">
                            {post.media.map((m) =>
                                m.media_type === "image" ? (
                                    <img
                                        key={m.id}
                                        src={resolveMedia(m.file)}
                                        alt="Post media"
                                        className="w-full rounded-xl object-cover max-h-96"
                                    />
                                ) : (
                                    <video
                                        key={m.id}
                                        src={resolveMedia(m.file)}
                                        controls
                                        className="w-full rounded-xl"
                                    />
                                )
                            )}
                        </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {post.hashtags.map((h) => (
                                <span key={h.id} className="text-blue-500 text-sm hover:underline cursor-pointer">
                                    #{h.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action row */}
                    <div className="mt-3 flex items-center gap-6">
                        <ReactionButton
                            postId={post.id}
                            reactionsCount={reactionsCount}
                            initialReaction={post.user_reaction}
                            onReactionChange={handleReactionChange}
                        />
                        <button
                            onClick={() => setShowComments((v) => !v)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count}</span>
                        </button>
                    </div>

                    {/* Comments */}
                    {showComments && (
                        <div className="mt-3">
                            <CommentSection postId={post.id} />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
