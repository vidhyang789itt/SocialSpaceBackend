import { Response, NextFunction, RequestHandler } from "express";
import Post from "../Models/Posts";
import User from "../Models/Users";
import { CustomRequest } from "../Types/CustomRequestType";

export const checkOwnership: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return res.status(404).json({ message: "unauthenticated" });

    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resource = await Post.findOne({ postId: resourceId });
    const user = await User.findOne({ userId });

    if (!resource || !user) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isOwner = resource.author.toString() === user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        message: "Access denied: You do not own this resource.",
      });
    }

    req.resource = resource;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization check failed", error });
  }
};
