import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAppSelector } from "./hooks";
import { UserRole } from "./types";

export function App() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <AuthPage />;
  }

  const defaultRoute = user.role === UserRole.Admin ? "/admin" : "/home";

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={user.role === UserRole.Admin ? <Navigate to="/admin" replace /> : <ProfilePage />} />
        <Route path="/profile/:userId" element={user.role === UserRole.Admin ? <Navigate to="/admin" replace /> : <ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
}
