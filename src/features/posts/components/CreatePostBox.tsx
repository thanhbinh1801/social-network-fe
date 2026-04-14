import { useRef, useState } from "react";
import { Globe, ImagePlus, Lock, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!body.trim() && files.length === 0) return;

        setLoading(true);
        try {
            const formData = buildPostFormData({ body: body.trim(), visibility, media: files });
            const { data } = await postsApi.create(formData);
            onPostCreated(data);
            setBody("");
            setFiles([]);
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
            <div className="mb-4 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={resolveMedia(user?.avatar)} />
                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <button
                    className="flex-1 rounded-full border border-border bg-muted/30 px-4 py-2.5 text-left text-[14px] text-muted-foreground transition-colors hover:bg-muted/50"
                    onClick={() => setOpen(true)}
                >
                    Share an update, thought, or question...
                </button>
                <Button variant="ghost" className="font-semibold text-primary hover:bg-transparent" onClick={() => setOpen(true)}>Post</Button>
            </div>

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

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {files.map((file, index) => (
                                    <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md border">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFiles(files.filter((_, i) => i !== index));
                                            }}
                                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 rounded-2xl border bg-secondary/20 p-4 md:flex-row md:items-center md:justify-between">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                <ImagePlus className="h-4 w-4" />
                                <span className="font-medium">Add photos</span>
                            </button>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files?.length) {
                                        setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
                                    }
                                }}
                            />
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
                            <Button type="submit" disabled={loading || (!body.trim() && files.length === 0)}>
                                {loading ? "Posting..." : "Publish"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
