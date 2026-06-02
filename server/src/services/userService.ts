import { FollowModel, UserModel } from "../models/index.js";

export async function getUserProfile(userId: string, viewerId?: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("Користувача не знайдено");
  }

  const [followersCount, followingCount, viewerFollow] = await Promise.all([
    FollowModel.countDocuments({ followingId: userId }),
    FollowModel.countDocuments({ followerId: userId }),
    viewerId ? FollowModel.findOne({ followerId: viewerId, followingId: userId }) : null
  ]);

  return {
    ...user.toJSON(),
    followersCount,
    followingCount,
    viewerIsFollowing: Boolean(viewerFollow)
  };
}
