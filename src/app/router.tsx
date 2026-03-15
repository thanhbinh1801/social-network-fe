import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import FeedPage from "@/features/feed/pages/FeedPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import SavedPostsPage from "@/features/posts/pages/SavedPostsPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import SettingsPage from "@/features/profile/pages/SettingsPage";
import DiscoverPage from "@/features/search/pages/DiscoverPage";
import { useAuthStore } from "@/store/auth.store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <LoginPage />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <RegisterPage />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/verify-email"
                    element={
                        <GuestRoute>
                            <VerifyEmailPage />
                        </GuestRoute>
                    }
                />

                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/saved" element={<SavedPostsPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
