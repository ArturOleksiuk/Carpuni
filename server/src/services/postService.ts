import { CommentModel, PostModel, SavedPostModel, UserModel } from "../models/index.js";
import { IPost, PostType, UserRole } from "../types.js";

export async function getFeed(userId?: string) {
  const postDocs = await PostModel.find().sort({ createdAt: -1 }).populate("authorId");
  return Promise.all(postDocs.map(async (postDoc) => {
    const post = postDoc.toJSON() as unknown as IPost;
    const author = postDoc.get("authorId") as { _id?: unknown; toJSON?: () => unknown } | null;
    const likedUserIds = postDoc.get("likedUserIds") as unknown[];
    const commentsCount = await CommentModel.countDocuments({ postId: post.id, isDeleted: false });
    const viewerHasSaved = userId ? Boolean(await SavedPostModel.exists({ userId, postId: post.id })) : false;
    return {
      ...post,
      authorId: String(author?._id ?? post.authorId),
      author: typeof author?.toJSON === "function" ? author.toJSON() : undefined,
      commentsCount,
      viewerHasLiked: userId ? likedUserIds.some((id) => String(id) === userId) : false,
      viewerHasSaved
    };
  }));
}

export async function createPost(authorId: string, content: string, mediaUrls: string[] = []): Promise<IPost> {
  if (!content.trim()) {
    throw new Error("Текст поста не може бути порожнім");
  }

  const hashtags = Array.from(content.matchAll(/#[\p{L}\p{N}_-]+/gu)).map((match) => match[0].slice(1));
  const post = await PostModel.create({
    authorId,
    content,
    type: mediaUrls.length > 0 ? PostType.Media : PostType.Text,
    mediaUrls,
    hashtags,
    likedUserIds: [],
    repostsCount: 0
  });
  await post.populate("authorId");

  const author = post.get("authorId") as { _id?: unknown; toJSON?: () => unknown } | null;

  return {
    ...(post.toJSON() as unknown as IPost),
    authorId: String(author?._id ?? authorId),
    author: typeof author?.toJSON === "function" ? (author.toJSON() as unknown as IPost["author"]) : undefined,
    commentsCount: 0,
    viewerHasLiked: false,
    viewerHasSaved: false
  };
}

export async function toggleLike(postId: string, userId: string) {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error("Пост не знайдено");
  }

  const likedUserIds = post.get("likedUserIds") as unknown[];
  const alreadyLiked = likedUserIds.some((id) => String(id) === userId);

  if (alreadyLiked) {
    post.set(
      "likedUserIds",
      likedUserIds.filter((id) => String(id) !== userId)
    );
  } else {
    likedUserIds.push(userId);
    post.set("likedUserIds", likedUserIds);
  }

  await post.save();
  return {
    ...(post.toJSON() as unknown as IPost),
    viewerHasLiked: !alreadyLiked
  };
}

export async function deletePost(postId: string, userId: string) {
  const [post, user] = await Promise.all([PostModel.findById(postId), UserModel.findById(userId)]);
  if (!post) {
    throw new Error("Пост не знайдено");
  }
  if (!user) {
    throw new Error("Користувача не знайдено");
  }

  const isAuthor = String(post.get("authorId")) === userId;
  const isAdmin = user.role === UserRole.Admin;
  if (!isAuthor && !isAdmin) {
    throw new Error("Можна видалити тільки власний пост");
  }

  await Promise.all([
    CommentModel.deleteMany({ postId }),
    SavedPostModel.deleteMany({ postId }),
    post.deleteOne()
  ]);

  return { id: postId };
}
