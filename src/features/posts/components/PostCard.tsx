import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Lock, MessageCircle, MoreHorizontal, Send, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentSection from "@/features/engagement/components/CommentSection";
import ReactionButton from "@/features/engagement/components/ReactionButton";
import { engagementApi } from "@/features/engagement/api/engagement.api";
import { postsApi } from "@/features/posts/api/posts.api";
import { resolveMedia } from "@/lib/config";
import { useAuthStore } from "@/store/auth.store";
import type { PostObject } from "@/types";

interface PostCardProps {
    post: PostObject;
    onDelete?: (id: number) => void;
    onUpdate?: (post: PostObject) => void;
}

export default function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
    const currentUser = useAuthStore((state) => state.user);
    const isOwner = currentUser?.id === post.author.id;
    const [showComments, setShowComments] = useState(false);
    const [reactionsCount, setReactionsCount] = useState(post.reactions_count);
    const [saved, setSaved] = useState(post.is_saved);
    const [saving, setSaving] = useState(false);
    const [sharing, setSharing] = useState(false);

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
        setReactionsCount((count) => count + delta);
    };

    const handleSave = async () => {
        setSaving(true);
        const nextValue = !saved;
        setSaved(nextValue);
        try {
            await postsApi.saveToggle(post.id);
            toast.success(nextValue ? "Saved post." : "Removed from saved posts.");
            onUpdate?.({ ...post, is_saved: nextValue });
        } catch {
            setSaved(!nextValue);
            toast.error("Could not update saved state.");
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        setSharing(true);
        try {
            await engagementApi.sharePost(post.id);
            toast.success("Post shared.");
        } catch {
            toast.error("Could not share this post.");
        } finally {
            setSharing(false);
        }
    };

    const visibilityIcon =
        post.visibility === "private" ? (
            <Lock className="h-3.5 w-3.5" />
        ) : post.visibility === "friends" ? (
            <Users className="h-3.5 w-3.5" />
        ) : null;

    return (
        <Card className="mb-5 overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to={`/profile/${post.author.id}`}>
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={resolveMedia(post.author.avatar)} />
                            <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="min-w-0">
                        <Link
                            to={`/profile/${post.author.id}`}
                            className="truncate text-sm font-semibold hover:underline"
                        >
                            {post.author.username}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {visibilityIcon}
                            <span>
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {post.hashtags.length > 0 && (
                        <Badge variant="secondary" className="hidden rounded-full md:inline-flex">
                            #{post.hashtags[0].name}
                        </Badge>
                    )}

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="gap-2 text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {post.media.length > 0 && (
                <div className="border-b bg-secondary/20">
                    {post.media.map((media) =>
                        media.media_type === "image" ? (
                            <img
                                key={media.id}
                                src={resolveMedia(media.file)}
                                alt="Post media"
                                className="max-h-[560px] w-full object-cover"
                            />
                        ) : (
                            <video
                                key={media.id}
                                src={resolveMedia(media.file)}
                                controls
                                className="max-h-[560px] w-full"
                            />
                        )
                    )}
                </div>
            )}

            <CardContent className="space-y-4 px-4 py-4">
                {(post.body || post.hashtags.length > 0) && (
                    <div className="text-sm leading-6">
                        <Link to={`/profile/${post.author.id}`} className="mr-2 font-semibold">
                            {post.author.username}
                        </Link>
                        <span>{post.body}</span>
                        {post.hashtags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {post.hashtags.map((tag) => (
                                    <Badge key={tag.id} variant="secondary" className="rounded-full">
                                        #{tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 border-t pt-3">
                    <ReactionButton
                        postId={post.id}
                        reactionsCount={reactionsCount}
                        initialReaction={post.user_reaction}
                        onReactionChange={handleReactionChange}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowComments((value) => !value)}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare} disabled={sharing}>
                        <Send className="h-5 w-5" />
                    </Button>
                    <Button
                        variant={saved ? "secondary" : "ghost"}
                        size="icon"
                        className="ml-auto"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
                    </Button>
                </div>

                {reactionsCount > 0 && (
                    <p className="text-sm font-semibold">
                        {reactionsCount.toLocaleString()} {reactionsCount === 1 ? "like" : "likes"}
                    </p>
                )}

                {post.comments_count > 0 && !showComments && (
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-sm text-muted-foreground transition-opacity hover:opacity-70"
                    >
                        View all {post.comments_count} comment{post.comments_count === 1 ? "" : "s"}
                    </button>
                )}
            </CardContent>

            {showComments && (
                <div className="border-t">
                    <CommentSection postId={post.id} />
                </div>
            )}
        </Card>
    );
}
