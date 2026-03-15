import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Hash, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PostCard from "@/features/posts/components/PostCard";
import { searchApi } from "@/features/search/api/search.api";
import { postsApi } from "@/features/posts/api/posts.api";
import { resolveMedia } from "@/lib/config";
import type { Hashtag, PostObject, SearchResults, UserPublicObject } from "@/types";
import { toast } from "sonner";

const emptyResults: SearchResults = { users: [], posts: [], hashtags: [] };

export default function DiscoverPage() {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SearchResults>(emptyResults);
    const [trending, setTrending] = useState<Hashtag[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [tagPosts, setTagPosts] = useState<PostObject[]>([]);
    const [loadingTagPosts, setLoadingTagPosts] = useState(false);

    useEffect(() => {
        searchApi
            .getTrending()
            .then(setTrending)
            .catch(() => toast.error("Khong tai duoc trending hashtags."));
    }, []);

    const runSearch = async () => {
        if (!query.trim()) {
            setResults(emptyResults);
            return;
        }

        setSearching(true);
        setSelectedTag(null);
        try {
            const { data } = await searchApi.search(query.trim(), "all");
            setResults(data);
        } catch {
            toast.error("Tim kiem that bai.");
        } finally {
            setSearching(false);
        }
    };

    const loadHashtagPosts = async (tag: string) => {
        setSelectedTag(tag);
        setLoadingTagPosts(true);
        try {
            const data = await postsApi.getByHashtag(tag);
            setTagPosts(data);
        } catch {
            toast.error("Khong tai duoc bai viet theo hashtag.");
        } finally {
            setLoadingTagPosts(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
            <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-secondary/30">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Compass className="h-5 w-5 text-primary" />
                        Discover
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") runSearch();
                                }}
                                placeholder="Search users, posts, hashtags..."
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={runSearch} disabled={searching}>
                            {searching ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {trending.map((tag) => (
                            <Button
                                key={tag.id}
                                variant={selectedTag === tag.name ? "default" : "secondary"}
                                size="sm"
                                onClick={() => loadHashtagPosts(tag.name)}
                                className="rounded-full"
                            >
                                #{tag.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedTag && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge className="rounded-full">#{selectedTag}</Badge>
                        <p className="text-sm text-muted-foreground">Posts from hashtag API</p>
                    </div>
                    {loadingTagPosts ? (
                        <Card>
                            <CardContent className="py-8 text-sm text-muted-foreground">
                                Loading hashtag posts...
                            </CardContent>
                        </Card>
                    ) : tagPosts.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-sm text-muted-foreground">
                                No posts found for this hashtag.
                            </CardContent>
                        </Card>
                    ) : (
                        tagPosts.map((post) => <PostCard key={post.id} post={post} />)
                    )}
                </section>
            )}

            {!selectedTag && (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-primary" />
                                Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {results.users.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Search to see matching people.
                                </p>
                            ) : (
                                results.users.map((user: UserPublicObject) => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-secondary/40"
                                    >
                                        <Avatar className="h-11 w-11 border">
                                            <AvatarImage src={resolveMedia(user.avatar)} />
                                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{user.username}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user.bio || user.email}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Hash className="h-4 w-4 text-primary" />
                                Search Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {results.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {results.hashtags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="cursor-pointer rounded-full"
                                            onClick={() => loadHashtagPosts(tag.name)}
                                        >
                                            #{tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {results.posts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Search results for posts will appear here.
                                </p>
                            ) : (
                                results.posts.map((post) => <PostCard key={post.id} post={post} />)
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
