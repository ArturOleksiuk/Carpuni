import { CommentModel, NotificationModel, PostModel } from "../models/index.js";

export async function getPostComments(postId: string) {
  const comments = await CommentModel.find({ postId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate("authorId");

  return comments.map((comment) => {
    const author = comment.get("authorId") as { _id?: unknown; toJSON?: () => unknown } | null;
    return {
      ...(comment.toJSON() as unknown as object),
      authorId: String(author?._id ?? ""),
      author: typeof author?.toJSON === "function" ? author.toJSON() : undefined
    };
  });
}

export async function createComment(postId: string, authorId: string, content: string) {
  if (!content.trim()) {
    throw new Error("Коментар не може бути порожнім");
  }

  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error("Пост не знайдено");
  }

  const comment = await CommentModel.create({ postId, authorId, content });
  const postAuthorId = String(post.get("authorId"));

  if (postAuthorId !== authorId) {
    await NotificationModel.create({
      userId: postAuthorId,
      actorId: authorId,
      type: "COMMENT",
      text: "Новий коментар до вашого поста",
      entityType: "POST",
      entityId: post._id
    });
  }

  return comment.toJSON();
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new Error("Коментар не знайдено");
  }
  if (String(comment.get("authorId")) !== userId) {
    throw new Error("Можна видалити тільки власний коментар");
  }

  comment.set("isDeleted", true);
  await comment.save();
  return comment.toJSON();
}
