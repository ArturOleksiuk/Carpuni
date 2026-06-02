import { CommentModel, FollowModel, NotificationModel, SavedPostModel, UserModel } from "../models/index.js";

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Не можна підписатися на себе");
  }

  const existing = await FollowModel.findOne({ followerId, followingId });
  if (existing) {
    await existing.deleteOne();
    await UserModel.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
    return { following: false };
  }

  await FollowModel.create({ followerId, followingId });
  await UserModel.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
  await UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });
  await NotificationModel.create({
    userId: followingId,
    actorId: followerId,
    type: "FOLLOW",
    text: "У вас новий підписник",
    entityType: "USER",
    entityId: followerId
  });

  return { following: true };
}

export async function toggleSavedPost(userId: string, postId: string) {
  const existing = await SavedPostModel.findOne({ userId, postId });
  if (existing) {
    await existing.deleteOne();
    return { saved: false };
  }

  await SavedPostModel.create({ userId, postId });
  return { saved: true };
}

export async function getSavedPosts(userId: string) {
  const savedPosts = await SavedPostModel.find({ userId }).sort({ createdAt: -1 }).populate({
    path: "postId",
    populate: { path: "authorId" }
  });

  return Promise.all(
    savedPosts.map(async (savedPost) => {
      const postDoc = savedPost.get("postId") as unknown as {
        _id?: unknown;
        get?: (path: string) => unknown;
        toJSON?: () => Record<string, unknown>;
      } | null;

      if (!postDoc?.toJSON) {
        return null;
      }

      const post = postDoc.toJSON();
      const author = postDoc.get?.("authorId") as { _id?: unknown; toJSON?: () => unknown } | null;
      const likedUserIds = (postDoc.get?.("likedUserIds") as unknown[]) ?? [];
      const postId = String(postDoc._id ?? post.id);
      const commentsCount = await CommentModel.countDocuments({ postId, isDeleted: false });

      return {
        ...post,
        id: postId,
        authorId: String(author?._id ?? post.authorId),
        author: typeof author?.toJSON === "function" ? author.toJSON() : undefined,
        commentsCount,
        viewerHasLiked: likedUserIds.some((id) => String(id) === userId),
        viewerHasSaved: true
      };
    })
  ).then((posts) => posts.filter(Boolean));
}

export async function getFollowSuggestions(userId: string) {
  const [users, follows] = await Promise.all([
    UserModel.find({ _id: { $ne: userId } }).sort({ followersCount: -1 }).limit(5),
    FollowModel.find({ followerId: userId })
  ]);
  const followingIds = new Set(follows.map((follow) => String(follow.get("followingId"))));

  return users.map((user) => ({
    ...user.toJSON(),
    viewerIsFollowing: followingIds.has(user.id)
  }));
}

export async function getFollowers(userId: string, viewerId?: string) {
  const follows = await FollowModel.find({ followingId: userId }).populate("followerId").sort({ createdAt: -1 });
  return hydrateFollowUsers(
    follows.map((follow) => follow.get("followerId")),
    viewerId
  );
}

export async function getFollowing(userId: string, viewerId?: string) {
  const follows = await FollowModel.find({ followerId: userId }).populate("followingId").sort({ createdAt: -1 });
  return hydrateFollowUsers(
    follows.map((follow) => follow.get("followingId")),
    viewerId
  );
}

async function hydrateFollowUsers(users: unknown[], viewerId?: string) {
  const viewerFollows = viewerId ? await FollowModel.find({ followerId: viewerId }) : [];
  const viewerFollowingIds = new Set(viewerFollows.map((follow) => String(follow.get("followingId"))));

  return users
    .map((user) => {
      const doc = user as { id?: string; toJSON?: () => Record<string, unknown> } | null;
      if (!doc?.toJSON) {
        return null;
      }

      return {
        ...doc.toJSON(),
        viewerIsFollowing: doc.id ? viewerFollowingIds.has(doc.id) : false
      };
    })
    .filter(Boolean);
}
