import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { profileApi } from "@/features/profile/api/profile.api";
import { postsApi } from "@/features/posts/api/posts.api";
import { followApi } from "@/features/engagement/api/engagement.api";
import type { UserPublicObject, PostObject, FollowRelation } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/features/posts/components/PostCard";
import { toast } from "sonner";
import { MapPin, Link2, CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { resolveMedia as ra } from "@/lib/config";

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const currentUser = useAuthStore((s) => s.user);

    const [profileUser, setProfileUser] = useState<UserPublicObject | null>(null);
    const [posts, setPosts] = useState<PostObject[]>([]);
    const [followers, setFollowers] = useState<FollowRelation[]>([]);
    const [following, setFollowing] = useState<FollowRelation[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const apiId: "me" | number = id === "me" ? "me" : Number(id);

    useEffect(() => {
        if (typeof apiId === "number" && isNaN(apiId)) return;

        setLoading(true);
        setProfileUser(null);

        profileApi
            .getUser(apiId)
            .then(({ data: u }) => {
                setProfileUser(u);
                // Set follow state directly from profile response — no pagination issues
                setIsFollowing(u.is_following);
                const numId = u.id;
                Promise.all([
                    postsApi.getByAuthor(numId),
                    followApi.getFollowers(numId),
                    followApi.getFollowing(numId),
                ])
                    .then(([postsRes, followersData, followingData]) => {
                        // Handle both plain array and paginated {results:[]} response shapes
                        const rawPosts = postsRes.data;
                        const postList = Array.isArray(rawPosts)
                            ? rawPosts
                            : (rawPosts as unknown as { results: PostObject[] }).results ?? [];
                        setPosts(postList);
                        setFollowers(followersData);
                        setFollowing(followingData);
                    })
                    .catch(() => {
                        // Secondary data failed silently — profile is already visible
                    });
            })
            .catch(() => toast.error("Failed to load profile."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleFollow = async () => {
        if (!profileUser) return;
        setFollowLoading(true);
        const was = isFollowing;
        setIsFollowing(!was);
        setProfileUser((u) =>
            u ? { ...u, followers_count: u.followers_count + (was ? -1 : 1) } : u
        );
        try {
            await profileApi.followToggle(profileUser.id);
        } catch {
            setIsFollowing(was);
            setProfileUser((u) =>
                u ? { ...u, followers_count: u.followers_count + (was ? 1 : -1) } : u
            );
            toast.error("Action failed.");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return <ProfileSkeleton />;
    if (!profileUser)
        return <div className="p-8 text-center text-gray-400">User not found.</div>;

    // isOwn: true when viewing own profile ("/profile/me") or IDs match
    const isOwn = id === "me" || currentUser?.id === profileUser.id;

    return (
        <div className="pb-20 md:pb-0">
            {/* Sticky header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-3">
                <h1 className="text-xl font-bold">{profileUser.username}</h1>
                <p className="text-gray-500 text-xs">{posts.length} posts</p>
            </div>

            {/* Cover */}
            <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                {profileUser.cover && (
                    <img
                        src={ra(profileUser.cover)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Avatar + actions */}
            <div className="px-4 pb-4">
                <div className="flex items-end justify-between -mt-8 mb-3">
                    <Avatar className="w-20 h-20 border-4 border-white">
                        <AvatarImage src={ra(profileUser.avatar ?? "")} />
                        <AvatarFallback className="text-2xl bg-gray-200">
                            {profileUser.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {isOwn ? (
                        <Link to="/settings">
                            <Button variant="outline" size="sm" className="rounded-full">
                                Edit profile
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size="sm"
                            className="rounded-full"
                            variant={isFollowing ? "outline" : "default"}
                            onClick={handleFollow}
                            disabled={followLoading}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    )}
                </div>

                <h2 className="font-bold text-xl">{profileUser.username}</h2>
                <p className="text-gray-500 text-sm">@{profileUser.username}</p>
                {profileUser.bio && (
                    <p className="mt-2 text-[15px]">{profileUser.bio}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500 text-sm">
                    {profileUser.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profileUser.location}
                        </span>
                    )}
                    {profileUser.website && (
                        <a
                            href={profileUser.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                            <Link2 className="w-4 h-4" />
                            {profileUser.website}
                        </a>
                    )}
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Joined {format(new Date(profileUser.date_joined), "MMMM yyyy")}
                    </span>
                </div>

                <div className="flex gap-4 mt-3 text-sm">
                    <span>
                        <strong>{profileUser.following_count}</strong>{" "}
                        <span className="text-gray-500">Following</span>
                    </span>
                    <span>
                        <strong>{profileUser.followers_count}</strong>{" "}
                        <span className="text-gray-500">Followers</span>
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full h-auto border-b border-gray-200 bg-transparent rounded-none p-0">
                    {["posts", "followers", "following"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="flex-1 capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none h-12 text-sm font-semibold"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="posts" className="mt-0">
                    {posts.length === 0 ? (
                        <p className="py-12 text-center text-gray-400 text-sm">
                            No posts yet.
                        </p>
                    ) : (
                        posts.map((p) => (
                            <PostCard
                                key={p.id}
                                post={p}
                                onDelete={(deletedId) =>
                                    setPosts((prev) => prev.filter((x) => x.id !== deletedId))
                                }
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="followers" className="mt-0">
                    <UserList relations={followers} field="follower" />
                </TabsContent>

                <TabsContent value="following" className="mt-0">
                    <UserList relations={following} field="following" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserList({
    relations,
    field,
}: {
    relations: FollowRelation[];
    field: "follower" | "following";
}) {
    if (relations.length === 0) {
        return (
            <p className="py-12 text-center text-gray-400 text-sm">
                No users here yet.
            </p>
        );
    }
    return (
        <div>
            {relations.map((r) => {
                const u = r[field];
                return (
                    <Link
                        key={r.id}
                        to={`/profile/${u.id}`}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                    >
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={ra(u.avatar ?? "")} />
                            <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{u.username}</p>
                            {u.bio && (
                                <p className="text-gray-500 text-xs truncate max-w-[240px]">
                                    {u.bio}
                                </p>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div>
            <Skeleton className="h-36 w-full" />
            <div className="px-4 py-4 space-y-3">
                <Skeleton className="w-20 h-20 rounded-full -mt-8" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
}
