import { Comment } from "../Models/Comments";
import Post from "../Models/Posts";
import User from "../Models/Users";
import { checkForUserAndPost } from "../Utils/user";

async function postComment(
  userId: string,
  postId: string,
  content: string,
) {
  try {
    const { currentUser, post } = await checkForUserAndPost(userId, postId);

    const newComment = await Comment.create({
      user: currentUser._id,
      post: post._id,
      content: content,
    });

    await newComment.populate({
      path: "user",
    });

    return {newComment, post, currentUser};
  } catch (err) {
    throw err;
  }
}

async function getPostComments(postId: string) {
  const post = await Post.findOne({ postId });

  if (!post) {
    throw new Error("post not found");
  }

  const postComments = Comment.find({
    post: post._id,
  })
    .populate("user")
    .sort({ createdAt: -1 });

  return postComments;
}

async function getUserComments(userId: string) {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("user not found");
  }

  const userComments = Comment.find({
    user: user._id,
  }).populate("user");

  return userComments;
}

async function editComment(commentId: string, content: string) {
  await Comment.findByIdAndUpdate(commentId, {
    content: content,
  });

  const updatedComment = await Comment.findById(commentId).populate("user");

  return updatedComment;
}

async function deleteComment(commentId: string) {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  await Comment.findByIdAndDelete(commentId);

  return true;
}
export {
  postComment,
  getPostComments,
  getUserComments,
  editComment,
  deleteComment,
};
