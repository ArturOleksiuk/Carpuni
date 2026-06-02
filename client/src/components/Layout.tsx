import { Bell, Home, LogOut, Settings, Shield, UserPlus, UserRound } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../features/authSlice";
import { fetchNotifications } from "../features/notificationsSlice";
import { fetchFollowSuggestions, toggleFollow } from "../features/socialSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { UserRole } from "../types";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const suggestions = useAppSelector((state) => state.social.suggestions);
  const unreadCount = useAppSelector((state) => state.notifications.items.filter((item) => !item.readAt).length);
  const isAdmin = user?.role === UserRole.Admin;

  useEffect(() => {
    if (!user) {
      return;
    }
    dispatch(fetchFollowSuggestions(user.id));
    dispatch(fetchNotifications(user.id));
  }, [dispatch, user]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          Carp<span>uni</span>
        </div>
        <nav className="nav-list">
          <NavLink to="/home">
            <Home size={17} /> Стрічка
          </NavLink>
          {!isAdmin ? (
            <>
              <NavLink to="/notifications">
                <Bell size={17} /> Сповіщення {unreadCount > 0 ? <span className="nav-badge">{unreadCount}</span> : null}
              </NavLink>
              <NavLink to="/profile">
                <UserRound size={17} /> Профіль
              </NavLink>
            </>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin">
              <Shield size={17} /> Адмін
            </NavLink>
          ) : null}
          <a href="#settings">
            <Settings size={17} /> Налаштування
          </a>
        </nav>
        <button className="ghost-button logout" onClick={() => dispatch(logout())}>
          <LogOut size={16} /> Вийти
        </button>
      </aside>

      <main className="content">{children}</main>

      <aside className="right-panel">
        <section>
          <h3>Тренди</h3>
          <a>#Сесія</a>
          <a>#КПІ2026</a>
          <a>#Хакатон</a>
          <a>#ФМІ</a>
        </section>
        {!isAdmin ? (
          <section>
            <h3>Люди</h3>
            {suggestions.map((suggestedUser) => (
              <div className="suggested-user" key={suggestedUser.id}>
                <div>
                  <Link to={`/profile/${suggestedUser.id}`}>
                    <strong>{suggestedUser.displayName}</strong>
                  </Link>
                  <span>{suggestedUser.group ?? suggestedUser.faculty}</span>
                </div>
                <button
                  className={suggestedUser.viewerIsFollowing ? "icon-button liked" : "icon-button"}
                  aria-label={suggestedUser.viewerIsFollowing ? "Відписатись" : "Підписатись"}
                  onClick={() =>
                    user &&
                    dispatch(
                      toggleFollow({
                        followerId: user.id,
                        followingId: suggestedUser.id,
                        follower: { ...user, viewerIsFollowing: false }
                      })
                    )
                  }
                >
                  <UserPlus size={16} />
                </button>
              </div>
            ))}
          </section>
        ) : null}
      </aside>
    </div>
  );
}
