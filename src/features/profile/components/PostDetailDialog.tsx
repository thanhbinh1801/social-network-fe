import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import PostCard from "@/features/posts/components/PostCard";
import type { PostObject } from "@/types";

interface PostDetailDialogProps {
    post: PostObject | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedPost: PostObject) => void;
    onDelete: (id: number) => void;
}

export default function PostDetailDialog({
    post,
    open,
    onOpenChange,
    onUpdate,
    onDelete,
}: PostDetailDialogProps) {
    if (!post) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Post details</DialogTitle>
                </DialogHeader>
                <div className="bg-background rounded-xl overflow-hidden">
                    <PostCard 
                        post={post} 
                        onUpdate={onUpdate} 
                        onDelete={(id) => {
                            onDelete(id);
                            onOpenChange(false);
                        }} 
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
