import { Bookmark, ImagePlus, MessageCircle, MoreHorizontal, Repeat2, Send, ThumbsUp, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addComment, fetchComments } from "../features/commentsSlice";
import { cancelEvent, fetchEvents, registerForEvent, setEventFilter } from "../features/eventsSlice";
import { createPost, deletePost, fetchPosts, likePost } from "../features/postsSlice";
import { toggleSavedPost } from "../features/socialSlice";
import { setHomeTab } from "../features/uiSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { UserRole } from "../types";

export function HomePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const isAdmin = user.role === UserRole.Admin;
  const { items: posts } = useAppSelector((state) => state.posts);
  const commentsByPostId = useAppSelector((state) => state.comments.byPostId);
  const { items: events, activeFilter } = useAppSelector((state) => state.events);
  const activeTab = useAppSelector((state) => state.ui.homeTab);
  const [content, setContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPosts(user.id));
  }, [dispatch, user.id]);

  useEffect(() => {
    dispatch(fetchEvents({ filter: activeFilter, userId: user.id }));
  }, [activeFilter, dispatch, user.id]);

  function submitPost(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    dispatch(createPost({ authorId: user.id, content, author: user }));
    setContent("");
  }

  function toggleComments(postId: string) {
    setExpandedComments((current) => ({ ...current, [postId]: !current[postId] }));
    if (!commentsByPostId[postId]) {
      dispatch(fetchComments(postId));
    }
  }

  function submitComment(event: FormEvent, postId: string) {
    event.preventDefault();
    const draft = commentDrafts[postId]?.trim();
    if (!draft) {
      return;
    }

    dispatch(addComment({ postId, authorId: user.id, content: draft, author: user }));
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  }

  function removeOwnPost(postId: string) {
    setOpenPostMenuId(null);
    dispatch(deletePost({ postId, userId: user.id }));
  }

  return (
    <section className="center-column">
      <div className="top-tabs">
        <button className={activeTab === "feed" ? "active" : ""} onClick={() => dispatch(setHomeTab("feed"))}>
          Стрічка
        </button>
        <button className={activeTab === "events" ? "active" : ""} onClick={() => dispatch(setHomeTab("events"))}>
          Події
        </button>
      </div>

      {activeTab === "feed" ? (
        <>
          <form className="composer" onSubmit={submitPost}>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Що у вас нового?"
            />
            <div>
              <button type="button" className="ghost-button">
                <ImagePlus size={16} /> Фото
              </button>
              <button className="primary-button small">
                <Send size={16} /> Опублікувати
              </button>
            </div>
          </form>

          <div className="stack">
            {posts.map((post) => (
              <article className="post-card" key={post.id}>
                {(() => {
                  const commentsBucket = commentsByPostId[post.id];
                  const comments = commentsBucket?.items ?? [];
                  const commentsOpen = Boolean(expandedComments[post.id]);

                  return (
                    <>
                      <div className="author-row">
                        <div className="avatar">{post.author?.displayName.slice(0, 1) ?? "C"}</div>
                        <div>
                          {post.author && !isAdmin ? (
                            <Link to={`/profile/${post.author.id}`}>
                              <strong>{post.author.displayName}</strong>
                            </Link>
                          ) : (
                            <strong>{post.author?.displayName ?? "Carpuni"}</strong>
                          )}
                          <span>
                            @{post.author?.username ?? "user"} · {post.author?.group ?? post.author?.faculty} ·{" "}
                            {new Date(post.createdAt).toLocaleDateString("uk-UA")}
                          </span>
                        </div>
                        {post.authorId === user.id || isAdmin ? (
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
                                <button onClick={() => removeOwnPost(post.id)}>
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
                      <div className="reaction-row">
                        <button
                          className={post.viewerHasLiked ? "liked" : ""}
                          onClick={() => dispatch(likePost({ postId: post.id, userId: user.id }))}
                        >
                          <ThumbsUp size={15} /> {post.likesCount}
                        </button>
                        <button className={commentsOpen ? "liked" : ""} onClick={() => toggleComments(post.id)}>
                          <MessageCircle size={15} /> {commentsBucket ? comments.length : post.commentsCount ?? 0}
                        </button>
                        <button>
                          <Repeat2 size={15} /> {post.repostsCount}
                        </button>
                        <button
                          className={post.viewerHasSaved ? "liked" : ""}
                          aria-label={post.viewerHasSaved ? "Прибрати зі збережених" : "Зберегти пост"}
                          onClick={() => dispatch(toggleSavedPost({ postId: post.id, userId: user.id }))}
                        >
                          <Bookmark size={15} />
                        </button>
                      </div>

                      {commentsOpen ? (
                        <section className="comments-panel">
                          {commentsBucket?.isLoading ? <p className="muted">Завантаження коментарів...</p> : null}
                          {comments.map((comment) => (
                            <article className="comment-card" key={comment.id}>
                              <div className="avatar small">{comment.author?.displayName.slice(0, 1) ?? "C"}</div>
                              <div>
                                <strong>{comment.author?.displayName ?? "Carpuni"}</strong>
                                <p>{comment.content}</p>
                              </div>
                            </article>
                          ))}
                          <form className="comment-form" onSubmit={(event) => submitComment(event, post.id)}>
                            <input
                              value={commentDrafts[post.id] ?? ""}
                              onChange={(event) =>
                                setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))
                              }
                              placeholder="Написати коментар..."
                            />
                            <button className="primary-button small">
                              <Send size={15} /> Надіслати
                            </button>
                          </form>
                        </section>
                      ) : null}
                    </>
                  );
                })()}
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="filter-row">
            <button className={activeFilter === "all" ? "active" : ""} onClick={() => dispatch(setEventFilter("all"))}>
              Всі
            </button>
            <button
              className={activeFilter === "today" ? "active" : ""}
              onClick={() => dispatch(setEventFilter("today"))}
            >
              Сьогодні
            </button>
            <button
              className={activeFilter === "mine" ? "active" : ""}
              onClick={() => dispatch(setEventFilter("mine"))}
            >
              Мої події
            </button>
          </div>

          <div className="stack">
            {events.map((event) => {
              const registered = event.registeredUserIds.includes(user.id);
              const progress = Math.round((event.registeredCount / event.maxParticipants) * 100);
              return (
                <article className="event-card" key={event.id}>
                  <span className={registered ? "status-pill green" : "status-pill red"}>
                    {registered ? "Ви зареєстровані" : "Скоро"} ·{" "}
                    {new Date(event.startDate).toLocaleDateString("uk-UA")}
                  </span>
                  <h2>{event.title}</h2>
                  <p>{event.location}</p>
                  <div className="progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <p>
                    {event.registeredCount} / {event.maxParticipants} зареєстровано
                  </p>
                  <button
                    className={registered ? "danger-button" : "primary-button small"}
                    onClick={() =>
                      dispatch(
                        registered
                          ? cancelEvent({ eventId: event.id, userId: user.id })
                          : registerForEvent({ eventId: event.id, userId: user.id })
                      )
                    }
                  >
                    {registered ? "Скасувати реєстрацію" : "Зареєструватись"}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
