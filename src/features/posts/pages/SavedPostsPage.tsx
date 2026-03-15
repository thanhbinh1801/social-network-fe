import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostCard from "@/features/posts/components/PostCard";
import { postsApi } from "@/features/posts/api/posts.api";
import type { PostObject } from "@/types";
import { toast } from "sonner";

export default function SavedPostsPage() {
    const [posts, setPosts] = useState<PostObject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        postsApi
            .getSaved()
            .then(setPosts)
            .catch(() => toast.error("Khong tai duoc bai viet da luu."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
            <Card className="mb-6 border-border/70 bg-gradient-to-r from-card to-secondary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Bookmark className="h-5 w-5 text-primary" />
                        Saved Posts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Danh sach bai viet duoc lay tu `GET /api/posts/saved/`.
                    </p>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="py-8 text-sm text-muted-foreground">
                        Loading saved posts...
                    </CardContent>
                </Card>
            ) : posts.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Ban chua luu bai viet nao.
                    </CardContent>
                </Card>
            ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
        </div>
    );
}
