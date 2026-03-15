import { useEffect, useState } from "react";
import { Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { profileApi } from "@/features/profile/api/profile.api";
import { resolveMedia } from "@/lib/config";
import { useAuthStore } from "@/store/auth.store";
import type { PrivacySettings } from "@/types";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [form, setForm] = useState({
        username: "",
        bio: "",
        website: "",
        location: "",
    });
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        privacy_posts: "public",
        privacy_messages: "everyone",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPrivacy, setSavingPrivacy] = useState(false);

    useEffect(() => {
        Promise.all([profileApi.getMe(), profileApi.getPrivacy()])
            .then(([userRes, privacyRes]) => {
                setUser(userRes.data);
                setForm({
                    username: userRes.data.username,
                    bio: userRes.data.bio,
                    website: userRes.data.website,
                    location: userRes.data.location,
                });
                setPrivacy(privacyRes.data);
            })
            .catch(() => toast.error("Could not load settings."))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleProfileSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSavingProfile(true);

        try {
            const formData = new FormData();
            formData.append("username", form.username);
            formData.append("bio", form.bio);
            formData.append("website", form.website);
            formData.append("location", form.location);
            if (avatarFile) formData.append("avatar", avatarFile);
            if (coverFile) formData.append("cover", coverFile);

            const { data } = await profileApi.updateMe(formData);
            setUser(data);
            setAvatarFile(null);
            setCoverFile(null);
            toast.success("Profile updated.");
            navigate(`/profile/${data.id}`);
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePrivacySubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSavingPrivacy(true);

        try {
            const { data } = await profileApi.updatePrivacy(privacy);
            setPrivacy(data);
            toast.success("Privacy settings updated.");
        } catch {
            toast.error("Failed to update privacy.");
        } finally {
            setSavingPrivacy(false);
        }
    };

    const avatarPreview = avatarFile
        ? URL.createObjectURL(avatarFile)
        : resolveMedia(user?.avatar);
    const coverPreview = coverFile ? URL.createObjectURL(coverFile) : resolveMedia(user?.cover);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <Card>
                    <CardContent className="py-10 text-sm text-muted-foreground">
                        Loading settings...
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="border-border/70 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-primary" />
                        Profile settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                        <div className="space-y-3">
                            <div className="h-36 overflow-hidden rounded-2xl border bg-secondary/30">
                                {coverPreview ? (
                                    <img
                                        src={coverPreview}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Avatar className="h-20 w-20 border">
                                    <AvatarImage src={avatarPreview} />
                                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-wrap gap-3">
                                    <label className="inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium">
                                        Change avatar
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) =>
                                                setAvatarFile(event.target.files?.[0] ?? null)
                                            }
                                        />
                                    </label>
                                    <label className="inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium">
                                        Change cover
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) =>
                                                setCoverFile(event.target.files?.[0] ?? null)
                                            }
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <Field label="Username">
                                <Input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field label="Bio">
                                <Textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Write a short introduction..."
                                />
                            </Field>
                            <Field label="Website">
                                <Input
                                    name="website"
                                    type="url"
                                    value={form.website}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                />
                            </Field>
                            <Field label="Location">
                                <Input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                />
                            </Field>
                        </div>

                        <Button type="submit" disabled={savingProfile}>
                            {savingProfile ? "Saving..." : "Save profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Privacy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePrivacySubmit} className="space-y-5">
                        <Field label="Who can see your posts">
                            <Select
                                value={privacy.privacy_posts}
                                onValueChange={(value) =>
                                    setPrivacy((prev) => ({
                                        ...prev,
                                        privacy_posts: value as PrivacySettings["privacy_posts"],
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="friends">Friends</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Who can message you">
                            <Select
                                value={privacy.privacy_messages}
                                onValueChange={(value) =>
                                    setPrivacy((prev) => ({
                                        ...prev,
                                        privacy_messages:
                                            value as PrivacySettings["privacy_messages"],
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="following">Following only</SelectItem>
                                    <SelectItem value="no_one">No one</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Button type="submit" variant="secondary" disabled={savingPrivacy}>
                            {savingPrivacy ? "Saving..." : "Save privacy"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}
