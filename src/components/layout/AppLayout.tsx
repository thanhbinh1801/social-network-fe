import { Bell, Bookmark, Compass, Home, LogOut, Settings, User } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api/auth.api";
import SuggestionsPanel from "@/features/profile/components/SuggestionsPanel";
import { authStorage } from "@/lib/auth";
import { resolveMedia } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export default function AppLayout() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const profileHref = user?.id ? `/profile/${user.id}` : "/profile/me";

    const navItems = [
        { to: "/", icon: Home, label: "Home", end: true },
        { to: "/discover", icon: Compass, label: "Discover" },
        { to: "/notifications", icon: Bell, label: "Notifications" },
        { to: "/saved", icon: Bookmark, label: "Saved" },
        { to: profileHref, icon: User, label: "Profile" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

    const handleLogout = async () => {
        const refresh = authStorage.getRefresh();
        if (refresh) {
            try {
                await authApi.logout(refresh);
            } catch {
                toast.error("Server logout failed, but local session was cleared.");
            }
        }
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f8fb_45%,#eef2ff_100%)]">
            <div className="mx-auto grid min-h-dvh max-w-[1440px] gap-6 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
                <aside className="hidden lg:block">
                    <div className="sticky top-4 flex min-h-[calc(100dvh-2rem)] flex-col rounded-3xl border bg-card/90 p-4 shadow-sm backdrop-blur">
                        <Link to="/" className="mb-6 flex items-center gap-3 px-2">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                SN
                            </div>
                            <div>
                                <p className="font-semibold">SocialNet</p>
                                <p className="text-xs text-muted-foreground">Frontend integration</p>
                            </div>
                        </Link>

                        <nav className="space-y-1">
                            {navItems.map(({ to, icon: Icon, label, end }) => (
                                <NavLink
                                    key={label}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-secondary/70"
                                        )
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="mt-auto rounded-2xl border bg-secondary/25 p-3">
                            <Link to={profileHref} className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 border">
                                    <AvatarImage src={resolveMedia(user?.avatar)} />
                                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{user?.username}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                className="mt-3 w-full justify-start"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 min-h-[calc(100dvh-2rem)]">
                    <Outlet />
                </main>

                <aside className="hidden lg:block">
                    <div className="sticky top-4 space-y-4">
                        <SuggestionsPanel />
                    </div>
                </aside>
            </div>

            <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border bg-card/95 px-3 py-2 shadow-lg backdrop-blur lg:hidden">
                {navItems.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={label}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            cn(
                                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
