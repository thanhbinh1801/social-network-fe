import { ArrowLeft, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { resolveMedia } from "@/lib/config";
import type { UserPublicObject } from "@/types";

interface ChatHeaderProps {
    user: UserPublicObject;
    onlineStatus: string;
    onBack: () => void;
    onClose: () => void;
}

export default function ChatHeader({ user, onlineStatus, onBack, onClose }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={resolveMedia(user.avatar)} />
                    <AvatarFallback>{user.username.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{onlineStatus}</p>
                </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
