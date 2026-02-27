import { useState, useEffect, useCallback } from "react";
import { feedApi } from "@/features/feed/api/feed.api";
import type { PostObject } from "@/types";
import { toast } from "sonner";

const LIMIT = 20;

export function useFeed() {
    const [posts, setPosts] = useState<PostObject[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (currentOffset: number) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const { data } = await feedApi.getFeed(currentOffset, LIMIT);
            setPosts((prev) =>
                currentOffset === 0 ? data.results : [...prev, ...data.results]
            );
            setOffset(currentOffset + data.results.length);
            if (data.results.length < LIMIT) setHasMore(false);
        } catch {
            toast.error("Failed to load feed.");
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        fetchPosts(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMore = () => fetchPosts(offset);

    const prependPost = (post: PostObject) => {
        setPosts((prev) => [post, ...prev]);
    };

    const updatePost = (updated: PostObject) => {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    };

    const removePost = (id: number) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    return { posts, loading, hasMore, loadMore, prependPost, updatePost, removePost };
}
