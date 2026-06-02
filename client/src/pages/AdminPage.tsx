import { Ban, Eye, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { fetchAdminOverview, resolveComplaint } from "../features/adminSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export function AdminPage() {
  const dispatch = useAppDispatch();
  const overview = useAppSelector((state) => state.admin.overview);

  useEffect(() => {
    dispatch(fetchAdminOverview());
  }, [dispatch]);

  return (
    <section className="admin-page">
      <h1>Огляд</h1>
      <div className="stat-grid">
        <StatCard label="Користувачі" value={overview?.stats.users ?? 0} delta={`+${overview?.stats.usersToday ?? 0} сьогодні`} />
        <StatCard label="Пости" value={overview?.stats.posts ?? 0} delta={`+${overview?.stats.postsToday ?? 0} сьогодні`} />
        <StatCard label="Події" value={overview?.stats.events ?? 0} delta={`${overview?.stats.activeEvents ?? 0} активних`} />
        <StatCard label="Скарги" value={overview?.stats.activeComplaints ?? 0} delta="очікують дії" />
      </div>

      <h2>Активні скарги</h2>
      <div className="stack">
        {overview?.complaints.map((complaint) => (
          <article className="complaint-card" key={complaint.id}>
            <span className="status-pill yellow">{complaint.label}</span>
            <strong>{complaint.author}</strong>
            <p>{complaint.text}</p>
            <div className="reaction-row">
              <button onClick={() => dispatch(resolveComplaint({ complaintId: complaint.id, action: "delete" }))}>
                <Trash2 size={15} /> Видалити
              </button>
              <button onClick={() => dispatch(resolveComplaint({ complaintId: complaint.id, action: "block" }))}>
                <Ban size={15} /> Заблокувати
              </button>
              <button onClick={() => dispatch(resolveComplaint({ complaintId: complaint.id, action: "ignore" }))}>
                <Eye size={15} /> Ігнорувати
              </button>
            </div>
          </article>
        ))}
      </div>

      <h2>Нові реєстрації</h2>
      <div className="registration-list">
        {overview?.recentRegistrations.map((user) => (
          <div key={user.id}>
            <span className="avatar small">{user.displayName.slice(0, 1)}</span>
            <strong>{user.email}</strong>
            <span className="role-badge">{user.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, delta }: { label: string; value: number; delta: string }) {
  return (
    <article className="stat-card">
      <ShieldCheck size={18} />
      <span>{label}</span>
      <strong>{value.toLocaleString("uk-UA")}</strong>
      <p>{delta}</p>
    </article>
  );
}
