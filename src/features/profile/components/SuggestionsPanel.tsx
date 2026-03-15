import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profileApi } from "@/features/profile/api/profile.api";
import { resolveMedia } from "@/lib/config";
import type { UserPublicObject } from "@/types";
import { toast } from "sonner";

export default function SuggestionsPanel() {
    const [users, setUsers] = useState<UserPublicObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState<number | null>(null);

    useEffect(() => {
        profileApi
            .getSuggestions()
            .then(setUsers)
            .catch(() => toast.error("Khong tai duoc goi y theo doi."))
            .finally(() => setLoading(false));
    }, []);

    const handleFollow = async (user: UserPublicObject) => {
        setPendingId(user.id);
        const wasFollowing = user.is_following;
        setUsers((prev) =>
            prev.map((item) =>
                item.id === user.id
                    ? {
                          ...item,
                          is_following: !item.is_following,
                          followers_count: item.followers_count + (item.is_following ? -1 : 1),
                      }
                    : item
            )
        );

        try {
            await profileApi.followToggle(user.id);
        } catch {
            setUsers((prev) =>
                prev.map((item) =>
                    item.id === user.id
                        ? {
                              ...item,
                              is_following: wasFollowing,
                              followers_count:
                                  item.followers_count + (wasFollowing ? 1 : -1),
                          }
                        : item
                )
            );
            toast.error("Khong cap nhat duoc theo doi.");
        } finally {
            setPendingId(null);
        }
    };

    return (
        <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Suggested for you
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                        Live API
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading suggestions...
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Chua co goi y nao luc nay.
                    </p>
                ) : (
                    users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                            <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                                <Avatar className="h-11 w-11 border">
                                    <AvatarImage src={resolveMedia(user.avatar)} />
                                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{user.username}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.bio || `${user.followers_count} followers`}
                                    </p>
                                </div>
                            </Link>
                            <Button
                                size="sm"
                                variant={user.is_following ? "secondary" : "default"}
                                disabled={pendingId === user.id}
                                onClick={() => handleFollow(user)}
                            >
                                {pendingId === user.id
                                    ? "..."
                                    : user.is_following
                                      ? "Following"
                                      : "Follow"}
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
