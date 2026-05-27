import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as likeService from "../Services/LikeService";
import User from "../Models/Users";
import { sendNotification } from "../Socket/notificationHandler";
import { NotificationType } from "../Types/Notification.types";

async function likePost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      const error = new Error("User information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!postId) {
      const error = new Error("Post information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    const { post , currentUser} = await likeService.likePost(postId, currentUserId);

    if (post.author.toString() !== currentUser._id.toString() && req.io && req.onlineUsers) {

      const user = await User.findById(post.author);

      if(!user) throw new Error("user not found");

      await sendNotification(req.io, req.onlineUsers, {
        recipientId: user.userId,
        senderId: currentUser._id.toString(),
        type: NotificationType.LIKE,
        referenceId: postId
      });
    }

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function unlikePost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      const error = new Error("User information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!postId) {
      const error = new Error("Post information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    await likeService.unlikePost(postId, currentUserId);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function getLikes(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { postId } = req.params;

    if (!postId) {
      const error = new Error("Post information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    const response = await likeService.getAllLike(postId);

    res.status(200).json({
      status: true,
      body: response,
    });
  } catch (err) {
    next(err);
  }
}

export { likePost, unlikePost, getLikes };
