import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
    Home,
    Search,
    Compass,
    Heart,
    User,
    Settings,
    LogOut,
    MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { resolveMedia } from "@/lib/config";

export default function AppLayout() {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const profileHref = user?.id ? `/profile/${user.id}` : "/profile/me";

    const navItems = [
        { to: "/", icon: Home, label: "Home", exact: true },
        { to: null, icon: Search, label: "Search", exact: false },
        { to: null, icon: MessageCircle, label: "Messages", exact: false },
        { to: null, icon: Heart, label: "Notifications", exact: false },
        { to: profileHref, icon: User, label: "Profile", exact: false },
    ];

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#fafafa" }}>
            {/* ── Left Sidebar ── */}
            <aside
                className="hidden md:flex flex-col sticky top-0 self-start h-screen shrink-0"
                style={{
                    width: "245px",
                    backgroundColor: "#ffffff",
                    borderRight: "1px solid #dbdbdb",
                    padding: "8px 12px 20px",
                }}
            >
                {/* Instagram logo */}
                <div className="flex items-center px-3 py-5 mb-3">
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{
                            background:
                                "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </div>
                    <span
                        className="ml-3 font-semibold text-[18px]"
                        style={{ color: "#262626" }}
                    >
                        SocialNet
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ to, icon: Icon, label, exact }) =>
                        to ? (
                            <NavLink
                                key={label}
                                to={to}
                                end={exact}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-4 px-3 py-3 rounded-lg text-[16px] transition-all",
                                        isActive
                                            ? "font-bold"
                                            : "font-normal hover:bg-[#efefef]"
                                    )
                                }
                                style={{ color: "#262626" }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className="w-6 h-6 flex-shrink-0"
                                            strokeWidth={isActive ? 2.5 : 1.75}
                                        />
                                        <span>{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ) : (
                            // Non-routed decorative items
                            <button
                                key={label}
                                className="flex items-center gap-4 px-3 py-3 rounded-lg text-[16px] font-normal hover:bg-[#efefef] transition-all text-left w-full"
                                style={{ color: "#262626" }}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
                                <span>{label}</span>
                            </button>
                        )
                    )}
                </nav>

                {/* Bottom section: Settings + Logout */}
                <div className="flex flex-col gap-1">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-4 px-3 py-3 rounded-lg text-[16px] transition-all",
                                isActive ? "font-bold" : "font-normal hover:bg-[#efefef]"
                            )
                        }
                        style={{ color: "#262626" }}
                    >
                        <Settings className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
                        <span>Settings</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-3 py-3 rounded-lg text-[16px] font-normal hover:bg-[#efefef] transition-all text-left w-full"
                        style={{ color: "#262626" }}
                    >
                        <LogOut className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Center: Main Feed ── */}
            <main className="flex-1 min-w-0 min-h-screen">
                <Outlet />
            </main>

            {/* ── Right: Suggestions Panel ── */}
            <aside
                className="hidden lg:block shrink-0"
                style={{ width: "319px", padding: "24px 20px" }}
            >
                <div className="sticky top-6">
                    {/* Current user row */}
                    <div className="flex items-center justify-between mb-5">
                        <Link to={profileHref} className="flex items-center gap-3 group">
                            <Avatar className="w-11 h-11">
                                <AvatarImage src={resolveMedia(user?.avatar ?? "")} />
                                <AvatarFallback
                                    className="text-sm font-semibold"
                                    style={{ backgroundColor: "#efefef", color: "#262626" }}
                                >
                                    {user?.username?.[0]?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p
                                    className="font-semibold text-[14px] group-hover:opacity-70 transition-opacity"
                                    style={{ color: "#262626" }}
                                >
                                    {user?.username}
                                </p>
                                <p className="text-[12px]" style={{ color: "#8e8e8e" }}>
                                    {user?.email ?? ""}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-[12px] font-semibold hover:opacity-70 transition-opacity"
                            style={{ color: "#0095f6" }}
                        >
                            Switch
                        </button>
                    </div>

                    {/* Suggested for you */}
                    <div className="flex flex-col items-center justify-center py-10 mt-4 rounded-xl border" style={{ backgroundColor: "#fafafa", borderColor: "#dbdbdb" }}>
                        <Compass className="w-10 h-10 mb-3" style={{ color: "#8e8e8e" }} strokeWidth={1.5} />
                        <p className="text-[14px] font-semibold" style={{ color: "#262626" }}>
                            Suggestions
                        </p>
                        <p className="text-[12px] mt-1" style={{ color: "#8e8e8e" }}>
                            Coming Soon
                        </p>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Bottom Nav ── */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 flex z-50"
                style={{
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #dbdbdb",
                    height: "49px",
                }}
            >
                {[
                    { to: "/", icon: Home, exact: true },
                    { to: profileHref, icon: User, exact: false },
                    { to: "/settings", icon: Settings, exact: false },
                ].map(({ to, icon: Icon, exact }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={exact}
                        className={({ isActive }) =>
                            cn(
                                "flex-1 flex items-center justify-center transition-opacity",
                                isActive ? "opacity-100" : "opacity-40"
                            )
                        }
                    >
                        <Icon className="w-6 h-6" style={{ color: "#262626" }} />
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                >
                    <LogOut className="w-6 h-6" style={{ color: "#262626" }} />
                </button>
            </nav>
        </div>
    );
}
