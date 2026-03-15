import { useEffect, useState } from "react";
import { toast } from "sonner";
import { feedApi } from "@/features/feed/api/feed.api";
import type { PostObject } from "@/types";

const LIMIT = 20;

export function useFeed(mode: "personalized" | "trending" = "personalized") {
    const [posts, setPosts] = useState<PostObject[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (currentOffset: number, replace = false) => {
        if (loading || (!replace && !hasMore)) return;
        setLoading(true);

        try {
            const request =
                mode === "trending"
                    ? feedApi.getTrending(currentOffset, LIMIT)
                    : feedApi.getFeed(currentOffset, LIMIT);
            const { data } = await request;

            setPosts((prev) => (replace ? data.results : [...prev, ...data.results]));
            setOffset(currentOffset + data.results.length);
            setHasMore(data.results.length >= LIMIT);
        } catch {
            toast.error(
                mode === "trending" ? "Failed to load trending feed." : "Failed to load feed."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPosts([]);
        setOffset(0);
        setHasMore(true);
        fetchPosts(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return {
        posts,
        loading,
        hasMore,
        loadMore: () => fetchPosts(offset),
        refresh: () => fetchPosts(0, true),
        prependPost: (post: PostObject) => setPosts((prev) => [post, ...prev]),
        updatePost: (updated: PostObject) =>
            setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post))),
        removePost: (id: number) => setPosts((prev) => prev.filter((post) => post.id !== id)),
    };
}
