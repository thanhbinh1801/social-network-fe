import { useState } from "react";
import { Globe, ImagePlus, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { postsApi, buildPostFormData } from "@/features/posts/api/posts.api";
import { resolveMedia } from "@/lib/config";
import { useAuthStore } from "@/store/auth.store";
import type { PostObject } from "@/types";

interface Props {
    onPostCreated: (post: PostObject) => void;
}

const visibilityItems = [
    { value: "public", label: "Public", icon: Globe },
    { value: "friends", label: "Friends", icon: Users },
    { value: "private", label: "Private", icon: Lock },
] as const;

export default function CreatePostBox({ onPostCreated }: Props) {
    const user = useAuthStore((state) => state.user);
    const [open, setOpen] = useState(false);
    const [body, setBody] = useState("");
    const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!body.trim()) return;

        setLoading(true);
        try {
            const formData = buildPostFormData({ body: body.trim(), visibility });
            const { data } = await postsApi.create(formData);
            onPostCreated(data);
            setBody("");
            setOpen(false);
            toast.success("Post published!");
        } catch {
            toast.error("Failed to create post.");
        } finally {
            setLoading(false);
        }
    };

    const selectedVisibility =
        visibilityItems.find((item) => item.value === visibility) ?? visibilityItems[0];
    const VisibilityIcon = selectedVisibility.icon;

    return (
        <>
            <Card className="border-border/70 bg-gradient-to-br from-card via-card to-secondary/20 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="h-11 w-11 border">
                        <AvatarImage src={resolveMedia(user?.avatar)} />
                        <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                    </Avatar>
                    <button
                        className="flex-1 rounded-full border bg-background px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/40"
                        onClick={() => setOpen(true)}
                    >
                        Share an update, thought, or question...
                    </button>
                    <Button onClick={() => setOpen(true)}>Post</Button>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Create post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={resolveMedia(user?.avatar)} />
                                <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">{user?.username}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        <Textarea
                            autoFocus
                            placeholder="What do you want to talk about?"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            rows={6}
                            className="resize-none border-0 bg-secondary/30 shadow-none focus-visible:ring-1"
                        />

                        <div className="flex flex-col gap-3 rounded-2xl border bg-secondary/20 p-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ImagePlus className="h-4 w-4" />
                                Media upload can be added next with the same endpoint.
                            </div>
                            <Select
                                value={visibility}
                                onValueChange={(value) =>
                                    setVisibility(value as "public" | "friends" | "private")
                                }
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <VisibilityIcon className="h-4 w-4" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {visibilityItems.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !body.trim()}>
                                {loading ? "Posting..." : "Publish"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
