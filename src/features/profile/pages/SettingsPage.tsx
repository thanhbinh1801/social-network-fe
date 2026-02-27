import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { profileApi } from "@/features/profile/api/profile.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { resolveMedia as ra } from "@/lib/config";

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [loadingUser, setLoadingUser] = useState(false);
    const [form, setForm] = useState({
        username: "",
        bio: "",
        website: "",
        location: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // If user is not in the store yet (background /me failed), fetch it now
    useEffect(() => {
        if (user) {
            setForm({
                username: user.username,
                bio: user.bio,
                website: user.website,
                location: user.location,
            });
        } else {
            setLoadingUser(true);
            profileApi
                .getUser("me")
                .then(({ data }) => {
                    setUser(data);
                    setForm({
                        username: data.username,
                        bio: data.bio,
                        website: data.website,
                        location: data.location,
                    });
                })
                .catch(() => toast.error("Could not load profile. Please re-login."))
                .finally(() => setLoadingUser(false));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Re-fetch user id if still null
        let uid = user?.id;
        if (!uid) {
            toast.error("User not loaded. Please wait or refresh.");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("username", form.username);
            fd.append("bio", form.bio);
            fd.append("website", form.website);
            fd.append("location", form.location);
            if (avatarFile) fd.append("avatar", avatarFile);
            if (coverFile) fd.append("cover", coverFile);

            const { data } = await profileApi.updateUser(uid, fd);
            setUser(data);
            setAvatarFile(null);
            setCoverFile(null);
            toast.success("Profile updated!");
            navigate(`/profile/${uid}`);
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="px-4 py-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        );
    }

    // Avatar preview: prefer newly chosen file, then server URL with cache-bust
    const avatarPreview = avatarFile
        ? URL.createObjectURL(avatarFile)
        : user?.avatar
            ? `${ra(user.avatar)}?t=${user.username}` // bust browser cache with a stable key
            : "";

    const coverPreview = coverFile
        ? URL.createObjectURL(coverFile)
        : user?.cover
            ? `${ra(user.cover)}?t=${user.username}`
            : "";

    return (
        <div className="pb-20 md:pb-0">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-3">
                <h1 className="text-xl font-bold">Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 max-w-lg">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border border-gray-200">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="text-lg bg-gray-100">
                            {user?.username?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Label
                            htmlFor="avatar-upload"
                            className="cursor-pointer text-sm text-blue-500 hover:underline font-medium"
                        >
                            {avatarFile ? `Selected: ${avatarFile.name}` : "Change avatar"}
                        </Label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                                e.target.files?.[0] && setAvatarFile(e.target.files[0])
                            }
                        />
                        {avatarFile && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                Click save to apply
                            </p>
                        )}
                    </div>
                </div>

                {/* Cover */}
                <div>
                    <Label>Cover photo</Label>
                    <div className="mt-1 h-28 bg-gray-100 rounded-xl overflow-hidden relative">
                        {coverPreview && (
                            <img
                                src={coverPreview}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <label
                            htmlFor="cover-upload"
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/25 text-white text-sm font-medium hover:bg-black/35 transition"
                        >
                            {coverFile ? coverFile.name : "Change cover"}
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] && setCoverFile(e.target.files[0])
                                }
                            />
                        </label>
                    </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        required
                    />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={onChange}
                        rows={3}
                        maxLength={160}
                        placeholder="Tell the world about yourself…"
                    />
                    <p className="text-xs text-gray-400 text-right">
                        {form.bio.length}/160
                    </p>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://"
                        value={form.website}
                        onChange={onChange}
                    />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        placeholder="City, Country"
                        value={form.location}
                        onChange={onChange}
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving…" : "Save changes"}
                </Button>
            </form>
        </div>
    );
}
