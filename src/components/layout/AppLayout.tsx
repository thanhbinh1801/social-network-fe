import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, User, Settings, LogOut, Zap } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const profileHref = user?.id ? `/profile/${user.id}` : "/profile/me";

    return (
        <div className="min-h-screen bg-white">
            {/* Outer wrapper: centered, max 1200px, flex row */}
            <div className="max-w-[1200px] mx-auto flex min-h-screen">

                {/* ── Left Sidebar (sticky) ── */}
                <aside className="hidden md:flex flex-col sticky top-0 self-start h-screen w-[250px] shrink-0 border-r border-gray-200 px-4 py-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-3 mb-8">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl">SocialNet</span>
                    </div>

                    {/* Nav */}
                    <nav className="flex flex-col gap-1 flex-1">
                        {[
                            { to: "/", icon: Home, label: "Home" },
                            { to: profileHref, icon: User, label: "Profile" },
                            { to: "/settings", icon: Settings, label: "Settings" },
                        ].map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={label}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors",
                                        isActive
                                            ? "bg-gray-100 text-black font-semibold"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                    )
                                }
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:text-red-500 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </aside>

                {/* ── Main Feed ── */}
                <main className="flex-1 min-h-screen border-r border-gray-200 min-w-0 max-w-[600px]">
                    <Outlet />
                </main>

                {/* ── Right Sidebar ── */}
                <aside className="hidden lg:block w-[300px] shrink-0 pl-8 py-6">
                    <div className="sticky top-6">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <h3 className="font-bold text-[18px] mb-4">Who to follow</h3>
                            <p className="text-sm text-gray-500">Suggestions coming soon.</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20">
                {[
                    { to: "/", icon: Home, label: "Home" },
                    { to: profileHref, icon: User, label: "Profile" },
                    { to: "/settings", icon: Settings, label: "Settings" },
                ].map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={label}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            cn(
                                "flex-1 flex flex-col items-center py-3 text-xs gap-1",
                                isActive ? "text-black" : "text-gray-400"
                            )
                        }
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex flex-col items-center py-3 text-xs gap-1 text-gray-400"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </nav>
        </div>
    );
}
