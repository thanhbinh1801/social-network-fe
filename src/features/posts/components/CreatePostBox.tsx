import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
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
                className="flex gap-3 px-3 py-3 rounded-md mb-4 cursor-text"
                onClick={() => setOpen(true)}
                style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #dbdbdb",
                }}
            >
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={resolveMedia(user?.avatar ?? "")} />
                    <AvatarFallback
                        className="text-xs font-semibold"
                        style={{ backgroundColor: "#efefef", color: "#262626" }}
                    >
                        {user?.username?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center">
                    <span className="text-[15px]" style={{ color: "#8e8e8e" }}>
                        What's on your mind, {user?.username ?? ""}?
                    </span>
                </div>
                <button
                    className="text-[14px] font-semibold px-4 py-1.5 rounded-md self-center transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#0095f6", color: "#ffffff" }}
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                >
                    Post
                </button>
            </div>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[540px]" style={{ backgroundColor: "#ffffff", border: "1px solid #dbdbdb" }}>
                    <DialogHeader>
                        <DialogTitle style={{ color: "#262626" }}>Create post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={resolveMedia(user?.avatar ?? "")} />
                                <AvatarFallback style={{ backgroundColor: "#efefef", color: "#262626" }}>
                                    {user?.username?.[0]?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-[14px] mb-1" style={{ color: "#262626" }}>
                                    {user?.username}
                                </p>
                                <Textarea
                                    autoFocus
                                    placeholder="What's on your mind?"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="resize-none border-0 shadow-none focus-visible:ring-0 text-[16px] p-0"
                                    style={{ color: "#262626" }}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div
                            className="flex items-center justify-between pt-3"
                            style={{ borderTop: "1px solid #efefef" }}
                        >
                            <Select
                                value={visibility}
                                onValueChange={(v) => setVisibility(v as typeof visibility)}
                            >
                                <SelectTrigger
                                    className="w-[130px] h-8 text-sm"
                                    style={{ borderColor: "#dbdbdb" }}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌍 Public</SelectItem>
                                    <SelectItem value="friends">👥 Friends</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <button
                                type="submit"
                                disabled={loading || !body.trim()}
                                className="px-5 py-2 rounded-md text-[14px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                                style={{ backgroundColor: "#0095f6", color: "#ffffff" }}
                            >
                                {loading ? "Posting…" : "Share"}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
