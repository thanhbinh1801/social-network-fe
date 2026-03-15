import { useEffect, useRef, useState } from "react";
import { Flame, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeed } from "@/features/feed/hooks/useFeed";
import CreatePostBox from "@/features/posts/components/CreatePostBox";
import PostCard from "@/features/posts/components/PostCard";

function PostSkeleton() {
    return (
        <Card className="mb-4 overflow-hidden border-border/70">
            <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
        </Card>
    );
}

export default function FeedPage() {
    const [tab, setTab] = useState<"personalized" | "trending">("personalized");
    const personalizedFeed = useFeed("personalized");
    const trendingFeed = useFeed("trending");
    const currentFeed = tab === "trending" ? trendingFeed : personalizedFeed;
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && currentFeed.hasMore && !currentFeed.loading) {
                    currentFeed.loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [currentFeed]);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
            <div className="mb-5 flex flex-col gap-4">
                <CreatePostBox onPostCreated={personalizedFeed.prependPost} />

                <Tabs
                    value={tab}
                    onValueChange={(value) => setTab(value as "personalized" | "trending")}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-secondary/80">
                        <TabsTrigger value="personalized" className="gap-2 rounded-xl">
                            <Newspaper className="h-4 w-4" />
                            Following feed
                        </TabsTrigger>
                        <TabsTrigger value="trending" className="gap-2 rounded-xl">
                            <Flame className="h-4 w-4" />
                            Trending
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {currentFeed.posts.length === 0 && !currentFeed.loading ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <p className="text-base font-semibold">
                            {tab === "trending" ? "No trending posts yet" : "Nothing here yet"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {tab === "trending"
                                ? "Once posts pick up reactions and comments, they will show here."
                                : "Create your first post or follow more people to personalize the feed."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                currentFeed.posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onDelete={currentFeed.removePost}
                        onUpdate={currentFeed.updatePost}
                    />
                ))
            )}

            {currentFeed.loading && (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            )}

            <div ref={sentinelRef} className="h-4" />
        </div>
    );
}
