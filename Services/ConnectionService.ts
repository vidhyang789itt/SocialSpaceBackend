import User from "../Models/Users";
import { getBothUsers } from "../Utils/user";

export async function follow(
  currentUserId: string,
  toFollowUserId: string,
) {
  const { currentUser, toFollowUser } = await getBothUsers(
    currentUserId,
    toFollowUserId,
  );

  await User.updateOne(
    { _id: toFollowUser._id },
    { $addToSet: { followers: currentUser._id } },
  );

  await User.updateOne(
    { _id: currentUser._id },
    { $addToSet: { following: toFollowUser._id } },
  );

  return {currentUser, toFollowUser};
}

export async function unfollow(
  currentUserId: string,
  toFollowUserId: string,
) {
  const { currentUser, toFollowUser } = await getBothUsers(
    currentUserId,
    toFollowUserId,
  );

  await User.updateOne(
    { _id: toFollowUser._id },
    { $pull: { followers: currentUser._id } },
  );

  await User.updateOne(
    { _id: currentUser._id },
    { $pull: { following: toFollowUser._id } },
  );

  return true;
}

export async function getUserConnections(
  userId: string,
  type: "followers" | "following",
) {
  const user = await User.findOne({ userId }).populate(type);

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user[type];
}
