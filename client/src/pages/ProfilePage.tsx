import { BookmarkX, Edit3, MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { deletePost, fetchPosts } from "../features/postsSlice";
import { clearProfileUser, fetchProfileUser } from "../features/profileSlice";
import { fetchSchedule } from "../features/scheduleSlice";
import { fetchFollowers, fetchFollowing, fetchSavedPosts, toggleFollow, toggleSavedPost } from "../features/socialSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

const days = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
type ProfileTab = "posts" | "schedule" | "saved" | "followers" | "following";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user)!;
  const { userId: routeUserId } = useParams();
  const profileState = useAppSelector((state) => state.profile);
  const { schedule, currentPair } = useAppSelector((state) => state.schedule);
  const posts = useAppSelector((state) => state.posts.items);
  const savedPosts = useAppSelector((state) => state.social.savedPosts);
  const followers = useAppSelector((state) => state.social.followers);
  const following = useAppSelector((state) => state.social.following);
  const [activeTab, setActiveTab] = useState<ProfileTab>("schedule");
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const isOwnProfile = !routeUserId || routeUserId === authUser.id;
  const profileUser = isOwnProfile ? authUser : profileState.user;
  const viewedUserId = routeUserId ?? authUser.id;
  const authUserAsFollower = { ...authUser, viewerIsFollowing: false };
  const userPosts = posts.filter((post) => post.authorId === viewedUserId);
  const followersCount = followers.length;
  const followingCount = following.length;
  const viewerIsFollowingProfile =
    !isOwnProfile && profileUser && "viewerIsFollowing" in profileUser ? profileUser.viewerIsFollowing : false;

  useEffect(() => {
    if (isOwnProfile) {
      dispatch(clearProfileUser());
      dispatch(fetchSavedPosts(authUser.id));
      dispatch(fetchSchedule(authUser.id));
    } else {
      dispatch(fetchProfileUser({ userId: viewedUserId, viewerId: authUser.id }));
      setActiveTab("posts");
    }

    dispatch(fetchPosts(authUser.id));
    dispatch(fetchFollowers({ userId: viewedUserId, viewerId: authUser.id }));
    dispatch(fetchFollowing({ userId: viewedUserId, viewerId: authUser.id }));
  }, [authUser.id, dispatch, isOwnProfile, viewedUserId]);

  if (!profileUser) {
    return (
      <section className="profile-page">
        <p className="muted">{profileState.isLoading ? "Завантаження профілю..." : "Користувача не знайдено"}</p>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-cover" />
      <div className="profile-header">
        <div className="avatar large">{profileUser.displayName.slice(0, 1)}</div>
        <div>
          <h1>{profileUser.displayName}</h1>
          <p>
            @{profileUser.username} · {profileUser.group ?? profileUser.role} · {profileUser.faculty} · Івано-Франківськ
          </p>
          <button className="profile-counter" onClick={() => setActiveTab("followers")}>
            <strong>{followersCount}</strong> підписників
          </button>
          <button className="profile-counter" onClick={() => setActiveTab("following")}>
            <strong>{followingCount}</strong> підписок
          </button>
        </div>
      </div>

      <div className="profile-actions">
        {isOwnProfile ? (
          <button className="ghost-button">
            <Edit3 size={16} /> Редагувати профіль
          </button>
        ) : (
          <button
            className="ghost-button"
            onClick={() =>
              dispatch(
                toggleFollow({
                  followerId: authUser.id,
                  followingId: profileUser.id,
                  follower: authUserAsFollower
                })
              )
            }
          >
            <UserPlus size={16} /> {viewerIsFollowingProfile ? "Відписатись" : "Підписатись"}
          </button>
        )}
      </div>

      <div className="content-tabs">
        <button className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>
          Пости ({userPosts.length})
        </button>
        {isOwnProfile ? (
          <>
            <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>
              Розклад
            </button>
            <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>
              Збережені
            </button>
          </>
        ) : null}
        <button className={activeTab === "followers" ? "active" : ""} onClick={() => setActiveTab("followers")}>
          Підписники
        </button>
        <button className={activeTab === "following" ? "active" : ""} onClick={() => setActiveTab("following")}>
          Підписки
        </button>
      </div>

      {activeTab === "posts" ? (
        <div className="profile-posts">
          {userPosts.length === 0 ? <p className="muted">Поки немає опублікованих постів.</p> : null}
          {userPosts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="author-row">
                <div className="avatar">{profileUser.displayName.slice(0, 1)}</div>
                <div>
                  <strong>{profileUser.displayName}</strong>
                  <span>
                    @{profileUser.username} · {profileUser.group ?? profileUser.faculty} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                {isOwnProfile ? (
                  <div className="post-menu">
                    <button
                      className="icon-button"
                      aria-label="Опції поста"
                      onClick={() => setOpenPostMenuId((current) => (current === post.id ? null : post.id))}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openPostMenuId === post.id ? (
                      <div className="post-menu-popover">
                        <button
                          onClick={() => {
                            setOpenPostMenuId(null);
                            dispatch(deletePost({ postId: post.id, userId: authUser.id }));
                          }}
                        >
                          <Trash2 size={15} /> Видалити
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p>{post.content}</p>
              <div className="hashtags">
                {post.hashtags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "schedule" ? (
        <div className="schedule-panel">
          <h2>
            Тиждень {schedule?.weekNumber ?? "-"} · {schedule?.group ?? authUser.group}
          </h2>
          <p className="muted">{currentPair ? `Поточна пара: ${currentPair.subject}` : "Поточна пара не активна"}</p>
          {schedule?.pairs.map((pair) => {
            const isCurrent = currentPair?.subject === pair.subject && currentPair?.startTime === pair.startTime;
            return (
              <article
                className={isCurrent ? "pair-card current" : "pair-card"}
                key={`${pair.dayOfWeek}-${pair.startTime}`}
              >
                <time>
                  {days[pair.dayOfWeek]}, {pair.startTime}-{pair.endTime}
                </time>
                <div>
                  <strong>{pair.subject}</strong>
                  <span>
                    {pair.type} · {pair.teacher} · {pair.room}
                  </span>
                </div>
                {isCurrent ? <span className="now-badge">Зараз</span> : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {activeTab === "saved" ? (
        <div className="profile-posts">
          {savedPosts.length === 0 ? <p className="muted">Поки немає збережених постів.</p> : null}
          {savedPosts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="author-row">
                <div className="avatar">{post.author?.displayName.slice(0, 1) ?? "C"}</div>
                <div>
                  <strong>{post.author?.displayName ?? "Carpuni"}</strong>
                  <span>
                    @{post.author?.username ?? "user"} · {post.author?.group ?? post.author?.faculty} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <button
                  className="icon-button"
                  aria-label="Прибрати зі збережених"
                  onClick={() => dispatch(toggleSavedPost({ postId: post.id, userId: authUser.id }))}
                >
                  <BookmarkX size={18} />
                </button>
              </div>
              <p>{post.content}</p>
              <div className="hashtags">
                {post.hashtags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === "followers" ? (
        <FollowList
          emptyText="Поки немає підписників."
          users={followers}
          currentUserId={authUser.id}
          onToggle={(followingId) =>
            dispatch(toggleFollow({ followerId: authUser.id, followingId, follower: authUserAsFollower }))
          }
        />
      ) : null}

      {activeTab === "following" ? (
        <FollowList
          emptyText="Поки немає підписок."
          users={following}
          currentUserId={authUser.id}
          onToggle={(followingId) =>
            dispatch(toggleFollow({ followerId: authUser.id, followingId, follower: authUserAsFollower }))
          }
        />
      ) : null}
    </section>
  );
}

interface FollowListProps {
  emptyText: string;
  users: Array<{
    id: string;
    displayName: string;
    username: string;
    faculty: string;
    group?: string;
    followersCount: number;
    viewerIsFollowing: boolean;
  }>;
  currentUserId: string;
  onToggle: (userId: string) => void;
}

function FollowList({ emptyText, users, currentUserId, onToggle }: FollowListProps) {
  return (
    <div className="follow-list">
      {users.length === 0 ? <p className="muted">{emptyText}</p> : null}
      {users.map((item) => (
        <article className="follow-card" key={item.id}>
          <div className="avatar">{item.displayName.slice(0, 1)}</div>
          <div>
            <Link to={`/profile/${item.id}`}>
              <strong>{item.displayName}</strong>
            </Link>
            <span>
              @{item.username} · {item.group ?? item.faculty} · {item.followersCount} підписників
            </span>
          </div>
          {item.id !== currentUserId ? (
            <button className="ghost-button" onClick={() => onToggle(item.id)}>
              <UserPlus size={16} /> {item.viewerIsFollowing ? "Відписатись" : "Підписатись"}
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
