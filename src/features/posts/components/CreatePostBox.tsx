import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { postsApi, buildPostFormData } from "@/features/posts/api/posts.api";
import type { PostObject } from "@/types";
import { toast } from "sonner";

import { resolveMedia } from "@/lib/config";

interface Props {
    onPostCreated: (post: PostObject) => void;
}

export default function CreatePostBox({ onPostCreated }: Props) {
    const user = useAuthStore((s) => s.user);
    const [open, setOpen] = useState(false);
    const [body, setBody] = useState("");
    const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setLoading(true);
        try {
            const fd = buildPostFormData({ body: body.trim(), visibility });
            const { data } = await postsApi.create(fd);
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

    return (
        <>
            {/* Trigger row */}
            <div
                className="flex gap-3 px-4 py-3 border-b border-gray-200 cursor-text"
                onClick={() => setOpen(true)}
            >
                <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={resolveMedia(user?.avatar ?? "")} />
                    <AvatarFallback className="bg-gray-200 text-sm font-semibold">
                        {user?.username?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center">
                    <span className="text-gray-400 text-[17px]">What's happening?</span>
                </div>
                <Button size="sm" className="rounded-full self-center" variant="default">
                    Post
                </Button>
            </div>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader>
                        <DialogTitle>Create post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarImage src={resolveMedia(user?.avatar ?? "")} />
                                <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                            </Avatar>
                            <Textarea
                                autoFocus
                                placeholder="What's happening?"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="resize-none border-0 shadow-none focus-visible:ring-0 text-[18px] placeholder:text-gray-400 p-0"
                                rows={4}
                            />
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                            <Select
                                value={visibility}
                                onValueChange={(v) => setVisibility(v as typeof visibility)}
                            >
                                <SelectTrigger className="w-[130px] h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌍 Public</SelectItem>
                                    <SelectItem value="friends">👥 Friends</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                className="rounded-full"
                                disabled={loading || !body.trim()}
                            >
                                {loading ? "Posting…" : "Post"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
