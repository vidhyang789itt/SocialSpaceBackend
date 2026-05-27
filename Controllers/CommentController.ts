import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as commentService from "../Services/commentService";
import { sendNotification } from "../Socket/notificationHandler";
import { NotificationType } from "../Types/Notification.types";
import User from "../Models/Users";

async function CreateComment(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.userId;
    const { content }: { content: string } = req.body;

    if (!postId || !currentUserId) {
      const error = new Error("post id is not there") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!content) {
      const error = new Error("content should not be empty") as any;
      error.statusCode = 400;
      return next(error);
    }

    const {newComment, post, currentUser} = await commentService.postComment(currentUserId, postId, content);

    if (post.author.toString() !== currentUser._id.toString() && req.io && req.onlineUsers) {

      const user = await User.findById(post.author);

      if(!user) throw new Error("user not found");

      await sendNotification(req.io, req.onlineUsers, {
        recipientId: user.userId,
        senderId: currentUser._id.toString(),
        type: NotificationType.COMMENT,
        content: content,
        referenceId: postId
      });
    }

    res.status(201).json({
      newComment,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllPostComments(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { postId } = req.params;

    if (!postId) {
      const error = new Error("post id is not there") as any;
      error.statusCode = 400;
      return next(error);
    }

    const comments = await commentService.getPostComments(postId);

    res.status(201).json({
      comments,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllUserComments(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      const error = new Error("user id is not there") as any;
      error.statusCode = 400;
      return next(error);
    }

    const comments = await commentService.getUserComments(currentUserId);

    res.status(201).json({
      comments,
    });
  } catch (err) {
    next(err);
  }
}

async function editComment(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
      const error = new Error("comment id is not there") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!content) {
      const error = new Error("content should not be empty") as any;
      error.statusCode = 400;
      return next(error);
    }

    const newComment = await commentService.editComment(commentId, content);

    res.status(201).json({
      newComment,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      const error = new Error("comment id is not there") as any;
      error.statusCode = 400;
      return next(error);
    }

    await commentService.deleteComment(commentId);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export {
  CreateComment,
  getAllPostComments,
  getAllUserComments,
  editComment,
  deleteComment,
};
