import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { resolveMedia } from "@/lib/config";
import type { NotificationObject } from "@/types";
import { toast } from "sonner";

export default function NotificationsPage() {
    const [items, setItems] = useState<NotificationObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationsApi.getAll();
            setItems(data);
        } catch {
            toast.error("Khong tai duoc notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const unreadCount = items.filter((item) => !item.is_read).length;

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationsApi.markRead();
            setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
            toast.success("Da danh dau tat ca la da doc.");
        } catch {
            toast.error("Khong danh dau duoc notifications.");
        } finally {
            setMarkingAll(false);
        }
    };

    const handleMarkOneRead = async (id: number) => {
        try {
            await notificationsApi.markRead(id);
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
            );
        } catch {
            toast.error("Khong cap nhat duoc notification.");
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleMarkAllRead}
                        disabled={markingAll || unreadCount === 0}
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all read
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <p className="py-8 text-sm text-muted-foreground">Loading notifications...</p>
                    ) : items.length === 0 ? (
                        <p className="py-8 text-sm text-muted-foreground">
                            Chua co thong bao nao.
                        </p>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                                    item.is_read ? "bg-card" : "bg-primary/5"
                                }`}
                            >
                                <Avatar className="h-11 w-11 border">
                                    <AvatarImage src={resolveMedia(item.actor?.avatar)} />
                                    <AvatarFallback>
                                        {item.actor?.username?.[0]?.toUpperCase() ?? "N"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {item.message ||
                                                    `${item.actor?.username ?? "Someone"} ${item.verb}`}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(item.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        {!item.is_read && (
                                            <Badge className="rounded-full">New</Badge>
                                        )}
                                    </div>
                                </div>
                                {!item.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkOneRead(item.id)}
                                    >
                                        Read
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
