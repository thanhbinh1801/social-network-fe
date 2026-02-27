import { useEffect, useRef } from "react";
import { useFeed } from "@/features/feed/hooks/useFeed";
import PostCard from "@/features/posts/components/PostCard";
import CreatePostBox from "@/features/posts/components/CreatePostBox";
import { Skeleton } from "@/components/ui/skeleton";

function PostSkeleton() {
    return (
        <div className="px-4 py-4 border-b border-gray-200 flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
        <div className="pb-20 md:pb-0">
            {/* Sticky header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-3">
                <h1 className="text-xl font-bold">Home</h1>
            </div>

            {/* Create post */}
            <CreatePostBox onPostCreated={prependPost} />

            {/* Feed */}
            {posts.length === 0 && !loading ? (
                <div className="py-16 text-center text-gray-400">
                    <p className="text-lg font-medium">Nothing here yet</p>
                    <p className="text-sm mt-1">Create your first post to get started.</p>
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
                <p className="text-center py-8 text-gray-400 text-sm">You're all caught up!</p>
            )}
        </div>
    );
}
