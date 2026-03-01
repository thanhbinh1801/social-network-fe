import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { profileApi } from "@/features/profile/api/profile.api";
import { postsApi } from "@/features/posts/api/posts.api";
import { followApi } from "@/features/engagement/api/engagement.api";
import type { UserPublicObject, PostObject, FollowRelation } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Heart, MessageCircle, Grid3x3, List } from "lucide-react";
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
                setIsFollowing(u.is_following);
                const numId = u.id;
                Promise.all([
                    postsApi.getByAuthor(numId),
                    followApi.getFollowers(numId),
                    followApi.getFollowing(numId),
                ])
                    .then(([postsRes, followersData, followingData]) => {
                        const rawPosts = postsRes.data;
                        const postList = Array.isArray(rawPosts)
                            ? rawPosts
                            : (rawPosts as unknown as { results: PostObject[] }).results ?? [];
                        setPosts(postList);
                        setFollowers(followersData);
                        setFollowing(followingData);
                    })
                    .catch(() => { });
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
        } catch (err) {
            console.error("Follow error:", err);
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
        return (
            <div className="py-20 text-center" style={{ color: "#8e8e8e" }}>
                User not found.
            </div>
        );

    const isOwn = id === "me" || currentUser?.id === profileUser.id;

    return (
        <div className="pb-20 md:pb-8 pt-6 px-4">
            {/* ── Profile Header ── */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 px-4 mb-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div
                        className="rounded-full overflow-hidden"
                        style={{
                            width: "150px",
                            height: "150px",
                            border: "1px solid #dbdbdb",
                        }}
                    >
                        <Avatar className="w-full h-full">
                            <AvatarImage src={ra(profileUser.avatar ?? "")} className="object-cover" />
                            <AvatarFallback
                                className="text-4xl font-semibold"
                                style={{ backgroundColor: "#efefef", color: "#262626" }}
                            >
                                {profileUser.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    {/* Username row */}
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-4">
                        <h1
                            className="text-[20px] font-light"
                            style={{ color: "#262626" }}
                        >
                            {profileUser.username}
                        </h1>

                        {isOwn ? (
                            <Link
                                to="/settings"
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[14px] font-semibold transition-opacity hover:opacity-70"
                                style={{
                                    border: "1px solid #dbdbdb",
                                    backgroundColor: "#ffffff",
                                    color: "#262626",
                                }}
                            >
                                Edit profile
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className="inline-flex items-center justify-center px-6 py-1.5 rounded-md text-[14px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                                    style={
                                        isFollowing
                                            ? {
                                                border: "1px solid #dbdbdb",
                                                backgroundColor: "#ffffff",
                                                color: "#262626",
                                            }
                                            : {
                                                backgroundColor: "#0095f6",
                                                color: "#ffffff",
                                                border: "none",
                                            }
                                    }
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                {isFollowing && (
                                    <button
                                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[14px] font-semibold transition-opacity hover:opacity-70"
                                        style={{
                                            border: "1px solid #dbdbdb",
                                            backgroundColor: "#ffffff",
                                            color: "#262626",
                                        }}
                                    >
                                        Message
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-center md:justify-start gap-8 mb-4">
                        <div className="text-center md:text-left">
                            <span className="font-semibold text-[16px]" style={{ color: "#262626" }}>
                                {posts.length}
                            </span>{" "}
                            <span className="text-[16px]" style={{ color: "#262626" }}>
                                posts
                            </span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="font-semibold text-[16px]" style={{ color: "#262626" }}>
                                {profileUser.followers_count}
                            </span>{" "}
                            <span className="text-[16px]" style={{ color: "#262626" }}>
                                followers
                            </span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="font-semibold text-[16px]" style={{ color: "#262626" }}>
                                {profileUser.following_count}
                            </span>{" "}
                            <span className="text-[16px]" style={{ color: "#262626" }}>
                                following
                            </span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        {profileUser.bio && (
                            <p className="text-[14px] leading-relaxed" style={{ color: "#262626" }}>
                                {profileUser.bio}
                            </p>
                        )}
                        {profileUser.website && (
                            <a
                                href={profileUser.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[14px] font-semibold hover:underline"
                                style={{ color: "#00376b" }}
                            >
                                {profileUser.website}
                            </a>
                        )}
                        <p className="text-[14px]" style={{ color: "#8e8e8e" }}>
                            Joined {format(new Date(profileUser.date_joined), "MMMM yyyy")}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="posts" className="w-full">
                <TabsList
                    className="w-full flex bg-transparent rounded-none p-0 mb-0"
                    style={{ borderTop: "1px solid #dbdbdb" }}
                >
                    {[
                        { value: "posts", icon: Grid3x3, label: "POSTS" },
                        { value: "followers", icon: List, label: "FOLLOWERS" },
                        { value: "following", icon: List, label: "FOLLOWING" },
                    ].map(({ value, icon: Icon, label }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-none border-t-2 border-transparent data-[state=active]:border-[#262626] data-[state=active]:shadow-none h-12 text-[12px] font-semibold tracking-[1px] transition-colors"
                            style={{ color: "#8e8e8e" }}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Posts Grid */}
                <TabsContent value="posts" className="mt-0">
                    {posts.length === 0 ? (
                        <div className="py-20 text-center">
                            <Grid3x3 className="w-12 h-12 mx-auto mb-4" style={{ color: "#dbdbdb" }} />
                            <p className="font-semibold text-[14px]" style={{ color: "#262626" }}>
                                No Posts Yet
                            </p>
                            <p className="text-[14px]" style={{ color: "#8e8e8e" }}>
                                When you share photos, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="grid grid-cols-3"
                            style={{ gap: "3px" }}
                        >
                            {posts.map((p) => (
                                <PostGridItem key={p.id} post={p} />
                            ))}
                        </div>
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

function PostGridItem({ post }: { post: PostObject }) {
    const thumb =
        post.media.length > 0 && post.media[0].media_type === "image"
            ? ra(post.media[0].file)
            : null;

    return (
        <div className="relative group aspect-square overflow-hidden cursor-pointer" style={{ backgroundColor: "#efefef" }}>
            {thumb ? (
                <img
                    src={thumb}
                    alt="Post"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: "#dbdbdb" }}
                >
                    <span className="text-[10px] text-center px-2 line-clamp-3" style={{ color: "#8e8e8e" }}>
                        {post.body || "Post"}
                    </span>
                </div>
            )}

            {/* Hover overlay */}
            <div
                className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            >
                <span className="flex items-center gap-1.5 text-white font-semibold text-[16px]">
                    <Heart className="w-5 h-5 fill-white" />
                    {post.reactions_count}
                </span>
                <span className="flex items-center gap-1.5 text-white font-semibold text-[16px]">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {post.comments_count}
                </span>
            </div>
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
            <p className="py-12 text-center text-sm" style={{ color: "#8e8e8e" }}>
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
                        className="flex items-center gap-3 px-4 py-3 transition-opacity hover:opacity-70"
                        style={{ borderBottom: "1px solid #efefef" }}
                    >
                        <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={ra(u.avatar ?? "")} />
                            <AvatarFallback style={{ backgroundColor: "#efefef", color: "#262626" }}>
                                {u.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-[14px]" style={{ color: "#262626" }}>
                                {u.username}
                            </p>
                            {u.bio && (
                                <p className="text-[12px] truncate max-w-[240px]" style={{ color: "#8e8e8e" }}>
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
        <div className="max-w-[935px] mx-auto px-4 pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-8">
                <Skeleton
                    className="w-[150px] h-[150px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#efefef" }}
                />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-40" style={{ backgroundColor: "#efefef" }} />
                    <div className="flex gap-8">
                        <Skeleton className="h-4 w-16" style={{ backgroundColor: "#efefef" }} />
                        <Skeleton className="h-4 w-16" style={{ backgroundColor: "#efefef" }} />
                        <Skeleton className="h-4 w-16" style={{ backgroundColor: "#efefef" }} />
                    </div>
                    <Skeleton className="h-4 w-64" style={{ backgroundColor: "#efefef" }} />
                </div>
            </div>
        </div>
    );
}
