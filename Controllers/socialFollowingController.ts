import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as connectionService from "../Services/ConnectionService";
import { sendNotification } from "../Socket/notificationHandler";
import { NotificationType } from "../Types/Notification.types";

async function followUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId || !targetUserId) {
      const error = new Error("User information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (currentUserId === targetUserId) {
      const error = new Error("You cannot follow yourself") as any;
      error.statusCode = 400;
      return next(error);
    }

    const { currentUser, toFollowUser } = await connectionService.follow(currentUserId, targetUserId);

    if (req.io && req.onlineUsers) {
      await sendNotification(req.io, req.onlineUsers, {
        recipientId: toFollowUser.userId,
        senderId: currentUser._id.toString(),
        type: NotificationType.FOLLOW,
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function unfollowUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId || !targetUserId) {
      const error = new Error("User information missing") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (currentUserId === targetUserId) {
      const error = new Error("You cannot unfollow yourself") as any;
      error.statusCode = 400;
      return next(error);
    }

    await connectionService.unfollow(currentUserId, targetUserId);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function getConnections(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, type } = req.params;

    if (!userId || !type) {
      const error = new Error(
        "User ID and connection type are required",
      ) as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!["followers", "following"].includes(type)) {
      const error = new Error("Invalid connection type") as any;
      error.statusCode = 400;
      return next(error);
    }

    const users = await connectionService.getUserConnections(
      userId,
      type as "followers" | "following",
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export { followUser, unfollowUser, getConnections };
