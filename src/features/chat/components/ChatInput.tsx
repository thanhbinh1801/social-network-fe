import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
    onSend: (params: { body: string; images?: File[] }) => Promise<void>;
    onTypingChange?: (typing: boolean) => void;
}

export default function ChatInput({ onSend, onTypingChange }: ChatInputProps) {
    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    const submit = async () => {
        if (isSending) return;
        const body = text.trim();
        if (!body && images.length === 0) return;
        setIsSending(true);
        try {
            await onSend({ body, images });
            setText("");
            setImages([]);
            if (fileRef.current) fileRef.current.value = "";
            // Return focus to input after sending
            inputRef.current?.focus();
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            // Always preventDefault so Enter never bubbles to file inputs or buttons
            e.preventDefault();
            e.stopPropagation();
            void submit();
        }
    };

    const handleImageButtonClick = (e: React.MouseEvent) => {
        // Prevent any event from bubbling that could interfere with input focus
        e.preventDefault();
        e.stopPropagation();
        fileRef.current?.click();
    };

    return (
        <div className="border-t px-4 py-3">
            {/* Image previews row - shown above input when images are selected */}
            {images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {images.map((file, index) => (
                        <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="relative">
                            <img src={previewUrls[index]} alt={file.name} className="h-14 w-14 rounded-xl object-cover" />
                            <button
                                type="button"
                                className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setImages((prev) => prev.filter((_, i) => i !== index));
                                    // Keep focus on text input after removing image
                                    inputRef.current?.focus();
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleImageButtonClick}
                    aria-label="Attach image"
                    disabled={isSending}
                >
                    <ImagePlus className="h-4 w-4" />
                </Button>

                {/* Hidden file input — never receives focus or keyboard events */}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    tabIndex={-1}
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (!files.length) return;
                        setImages((prev) => [...prev, ...files]);
                        // Reset so same file can be picked again
                        e.target.value = "";
                        // Return focus to text input after file selection
                        inputRef.current?.focus();
                    }}
                />

                <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={text}
                    disabled={isSending}
                    onChange={(e) => {
                        setText(e.target.value);
                        onTypingChange?.(true);
                    }}
                    onBlur={() => onTypingChange?.(false)}
                    onKeyDown={handleKeyDown}
                />

                <Button
                    type="button"
                    onClick={() => void submit()}
                    disabled={isSending || (text.trim().length === 0 && images.length === 0)}
                >
                    {isSending ? (
                        <span className="animate-pulse">...</span>
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
