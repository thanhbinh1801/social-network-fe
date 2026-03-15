import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Grid3x3, MapPin, MessageCircle, UserPlus2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileApi } from "@/features/profile/api/profile.api";
import { resolveMedia } from "@/lib/config";
import { useAuthStore } from "@/store/auth.store";
import type { FollowRelation, PostObject, UserPublicObject } from "@/types";

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const currentUser = useAuthStore((state) => state.user);
    const [profileUser, setProfileUser] = useState<UserPublicObject | null>(null);
    const [posts, setPosts] = useState<PostObject[]>([]);
    const [followers, setFollowers] = useState<FollowRelation[]>([]);
    const [following, setFollowing] = useState<FollowRelation[]>([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const apiId: "me" | number = id === "me" ? "me" : Number(id);
    const isOwnProfile = id === "me" || currentUser?.id === profileUser?.id;

    useEffect(() => {
        if (typeof apiId === "number" && Number.isNaN(apiId)) return;

        setLoading(true);
        profileApi
            .getUser(apiId)
            .then(async ({ data }) => {
                setProfileUser(data);
                const [userPosts, userFollowers, userFollowing] = await Promise.all([
                    profileApi.getUserPosts(data.id),
                    profileApi.getFollowers(data.id),
                    profileApi.getFollowing(data.id),
                ]);
                setPosts(userPosts);
                setFollowers(userFollowers);
                setFollowing(userFollowing);
            })
            .catch(() => toast.error("Failed to load profile."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleFollow = async () => {
        if (!profileUser) return;
        setFollowLoading(true);
        const previous = profileUser.is_following;

        setProfileUser((user) =>
            user
                ? {
                      ...user,
                      is_following: !user.is_following,
                      followers_count: user.followers_count + (user.is_following ? -1 : 1),
                  }
                : user
        );

        try {
            await profileApi.followToggle(profileUser.id);
        } catch {
            setProfileUser((user) =>
                user
                    ? {
                          ...user,
                          is_following: previous,
                          followers_count: user.followers_count + (previous ? 1 : -1),
                      }
                    : user
            );
            toast.error("Could not update follow status.");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-sm text-muted-foreground">
                        Loading profile...
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        User not found.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
                <div className="h-44 bg-gradient-to-r from-sky-100 via-white to-slate-100">
                    {profileUser.cover && (
                        <img
                            src={resolveMedia(profileUser.cover)}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <CardContent className="px-6 pb-6 pt-0">
                    <div className="-mt-14 flex flex-col gap-6 md:-mt-16 md:flex-row md:items-end">
                        <Avatar className="h-28 w-28 border-4 border-white shadow-sm md:h-32 md:w-32">
                            <AvatarImage src={resolveMedia(profileUser.avatar)} />
                            <AvatarFallback className="text-3xl font-semibold">
                                {profileUser.username[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4 pt-2">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-semibold tracking-tight">
                                            {profileUser.username}
                                        </h1>
                                        {!isOwnProfile && profileUser.is_following && (
                                            <Badge variant="secondary" className="rounded-full">
                                                Following
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Joined {format(new Date(profileUser.date_joined), "MMMM yyyy")}
                                    </p>
                                </div>

                                {isOwnProfile ? (
                                    <Button asChild variant="secondary">
                                        <Link to="/settings">Edit profile</Link>
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleFollow} disabled={followLoading}>
                                            <UserPlus2 className="mr-2 h-4 w-4" />
                                            {profileUser.is_following ? "Following" : "Follow"}
                                        </Button>
                                        <Button variant="secondary">
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Message
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm md:gap-8">
                                <StatInline label="posts" value={posts.length} />
                                <StatInline label="followers" value={profileUser.followers_count} />
                                <StatInline label="following" value={profileUser.following_count} />
                            </div>

                            <div className="space-y-2">
                                {profileUser.bio ? (
                                    <p className="max-w-2xl text-sm leading-6 text-slate-700">
                                        {profileUser.bio}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        This user has not added a bio yet.
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {profileUser.location && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {profileUser.location}
                                        </span>
                                    )}
                                    {profileUser.website && (
                                        <a
                                            href={profileUser.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {profileUser.website}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="posts" className="mt-8 w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary/70">
                            <TabsTrigger value="posts">Posts</TabsTrigger>
                            <TabsTrigger value="followers">Followers</TabsTrigger>
                            <TabsTrigger value="following">Following</TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="pt-5">
                            {posts.length === 0 ? (
                                <EmptyState label="No posts yet." />
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {posts.map((post) => (
                                        <PostPreview key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="followers" className="pt-5">
                            <RelationshipList relations={followers} field="follower" />
                        </TabsContent>

                        <TabsContent value="following" className="pt-5">
                            <RelationshipList relations={following} field="following" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function StatInline({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-slate-900">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}

function PostPreview({ post }: { post: PostObject }) {
    const preview = post.media[0];

    return (
        <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="aspect-square overflow-hidden bg-secondary/30">
                {preview?.media_type === "image" ? (
                    <img
                        src={resolveMedia(preview.file)}
                        alt="Post preview"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                        <Grid3x3 className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="line-clamp-4 text-sm text-muted-foreground">
                            {post.body || "Media post"}
                        </p>
                    </div>
                )}
            </div>
            <div className="space-y-2 p-4">
                <p className="line-clamp-2 text-sm font-medium text-slate-800">
                    {post.body || "No caption"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {post.reactions_count} reactions · {post.comments_count} comments
                </p>
            </div>
        </div>
    );
}

function RelationshipList({
    relations,
    field,
}: {
    relations: FollowRelation[];
    field: "follower" | "following";
}) {
    if (relations.length === 0) {
        return <EmptyState label="Nothing to show yet." />;
    }

    return (
        <div className="space-y-3">
            {relations.map((relation) => {
                const user = relation[field];
                return (
                    <Link
                        key={relation.id}
                        to={`/profile/${user.id}`}
                        className="flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-secondary/20"
                    >
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={resolveMedia(user.avatar)} />
                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.username}</p>
                            <p className="truncate text-sm text-muted-foreground">
                                {user.bio || user.email}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
            {label}
        </div>
    );
}
