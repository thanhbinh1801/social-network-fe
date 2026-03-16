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
        <div className="min-h-dvh bg-background">
            <div className="mx-auto grid min-h-dvh max-w-[1440px] gap-6 px-1 py-4 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:px-2 xl:px-8">
                <aside className="hidden lg:block">
                    <div className="sticky top-4 flex min-h-[calc(100dvh-2rem)] flex-col bg-background py-4">
                        <Link to="/" className="mb-8 flex items-center gap-3 px-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                SN
                            </div>
                            <span className="font-semibold text-xl tracking-tight">SocialNet</span>
                        </Link>

                        <nav className="space-y-2">
                            {navItems.map(({ to, icon: Icon, label, end }) => (
                                <NavLink
                                    key={label}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-4 rounded-lg px-3 py-3 text-[15px] transition-all hover:bg-black/5 active:opacity-70",
                                            isActive
                                                ? "font-bold"
                                                : "font-normal"
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                                            <span>{label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="mt-auto px-1">
                            <Link to={profileHref} className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-black/5">
                                <Avatar className="h-8 w-8 border">
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
                                className="mt-2 w-full justify-start gap-4 px-2 py-6 text-[15px] font-normal hover:bg-black/5"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-6 w-6 stroke-[1.5px]" />
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

            <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t bg-background px-3 py-2 sm:hidden">
                {navItems.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={label}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            cn(
                                "flex h-12 w-12 items-center justify-center rounded-xl transition-all active:opacity-70",
                                isActive ? "text-foreground" : "text-foreground"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
