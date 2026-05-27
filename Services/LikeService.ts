import { Like } from "../Models/Likes";
import Post from "../Models/Posts";
import { checkForUserAndPostForLike } from "../Utils/user";

async function likePost(postId: string, currentUserId: string) {
  try {
    const { currentUser, post, alreadyExist } = await checkForUserAndPostForLike(
      currentUserId,
      postId,
    );

    if (alreadyExist) {
      throw new Error("Like already exist");
    }

    await Like.create({
      user: currentUser._id,
      post: post._id,
    });

    return {post, currentUser};
  } catch (err) {
    throw err;
  }
}

async function unlikePost(postId: string, currentUserId: string) {
  try {
    const { currentUser, post, alreadyExist } = await checkForUserAndPostForLike(
      currentUserId,
      postId,
    );

    if (!alreadyExist) {
      throw new Error("like the post First");
    }

    const like = await Like.deleteOne({
      user: currentUser._id,
      post: post._id,
    });

    return true;
  } catch (err) {
    throw err;
  }
}

async function getAllLike(postId: string) {
  const post = await Post.findOne({ postId });

  if (!post) {
    throw new Error("post not exist");
  }

  const totalLikes = await Like.find({ post: post._id });

  return totalLikes;
}

export { likePost, unlikePost, getAllLike };
