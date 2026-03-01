import { useEffect, useRef } from "react";
import { useFeed } from "@/features/feed/hooks/useFeed";
import PostCard from "@/features/posts/components/PostCard";
import CreatePostBox from "@/features/posts/components/CreatePostBox";
import { Skeleton } from "@/components/ui/skeleton";

function PostSkeleton() {
    return (
        <div
            className="rounded-md mb-6"
            style={{ backgroundColor: "#ffffff", border: "1px solid #dbdbdb" }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: "#efefef" }} />
                <div className="space-y-1">
                    <Skeleton className="h-3 w-24" style={{ backgroundColor: "#efefef" }} />
                    <Skeleton className="h-3 w-16" style={{ backgroundColor: "#efefef" }} />
                </div>
            </div>
            {/* Image */}
            <Skeleton className="w-full h-60" style={{ borderRadius: 0, backgroundColor: "#efefef" }} />
            {/* Actions */}
            <div className="px-3 pt-3 pb-4 space-y-2">
                <Skeleton className="h-3 w-32" style={{ backgroundColor: "#efefef" }} />
                <Skeleton className="h-3 w-full" style={{ backgroundColor: "#efefef" }} />
                <Skeleton className="h-3 w-3/4" style={{ backgroundColor: "#efefef" }} />
            </div>
        </div>
    );
}

export default function FeedPage() {
    const { posts, loading, hasMore, loadMore, prependPost, removePost, updatePost } = useFeed();
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    return (
        <div className="max-w-[470px] mx-auto py-6 pb-20 md:pb-6 px-0">
            {/* Create post */}
            <CreatePostBox onPostCreated={prependPost} />

            {/* Feed */}
            {posts.length === 0 && !loading ? (
                <div
                    className="rounded-md py-16 text-center"
                    style={{ border: "1px solid #dbdbdb", backgroundColor: "#ffffff" }}
                >
                    <p className="font-semibold text-[16px]" style={{ color: "#262626" }}>
                        Nothing here yet
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#8e8e8e" }}>
                        Create your first post to get started.
                    </p>
                </div>
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={removePost}
                            onUpdate={updatePost}
                        />
                    ))}
                </>
            )}

            {/* Loading skeletons */}
            {loading && (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {!hasMore && posts.length > 0 && (
                <p className="text-center py-8 text-sm" style={{ color: "#8e8e8e" }}>
                    You're all caught up! ✓
                </p>
            )}
        </div>
    );
}
