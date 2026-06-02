import { CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { fetchNotifications, markNotificationRead } from "../features/notificationsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export function NotificationsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const { items, isLoading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications(user.id));
  }, [dispatch, user.id]);

  return (
    <section className="notifications-page">
      <h1>Сповіщення</h1>
      {isLoading ? <p className="muted">Завантаження...</p> : null}
      <div className="notification-list">
        {items.map((notification) => (
          <article className={notification.readAt ? "notification-card" : "notification-card unread"} key={notification.id}>
            <div>
              <strong>{notification.text}</strong>
              <span>
                {notification.type} · {new Date(notification.createdAt).toLocaleString("uk-UA")}
              </span>
            </div>
            {!notification.readAt ? (
              <button className="icon-button" onClick={() => dispatch(markNotificationRead(notification.id))}>
                <CheckCheck size={17} />
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
