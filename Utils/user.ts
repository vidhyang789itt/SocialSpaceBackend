import { Like } from "../Models/Likes";
import Post from "../Models/Posts";
import User from "../Models/Users";


export async function getBothUsers(
  currentUserId: string,
  toFollowUserId: string,
) {
  const currentUser = await User.findOne({ userId: currentUserId });
  const toFollowUser = await User.findOne({ userId: toFollowUserId });

  if (!currentUser || !toFollowUser) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser._id.equals(toFollowUser._id)) {
    const error: any = new Error("You cannot follow yourself");
    error.statusCode = 400;
    throw error;
  }

  return { currentUser, toFollowUser };
}

export async function checkForUserAndPost(userId: string, postId: string) {
  const currentUser = await User.findOne({ userId: userId }, "_id");
  const post = await Post.findOne({ postId });

  if (!currentUser) {
    throw new Error("User not found");
  }

  if (!post) {
    throw new Error("Cannot find post");
  }

  return {
    currentUser,
    post,
  };
}

export async function checkForUserAndPostForLike(userId: string, postId: string) {
  const currentUser = await User.findOne({ userId: userId }, "_id");
  const post = await Post.findOne({ postId });

  if (!currentUser) {
    throw new Error("User not found");
  }

  if (!post) {
    throw new Error("Cannot find post");
  }

  const alreadyExist = await Like.findOne({
    user: currentUser._id,
    post: post._id,
  });

  return {
    currentUser,
    post,
    alreadyExist,
  };
}

export const isUserFollowing = async (senderId: string, recipientId: string): Promise<boolean> => {
  try {
    const sender = await User.findOne({userId : senderId}).select("following");
    if (!sender) return false;

    const recipient = await User.findOne({userId : recipientId}).select("_id");
    if (!recipient) return false;

    const isFollowing = sender.following?.some(
      (follow: any) => follow._id.toString() === recipient._id.toString()
    );

    return !!isFollowing;
  } catch (error) {
    return false;
  }
};