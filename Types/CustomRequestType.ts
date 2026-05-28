import { Request } from "express";
import { Server } from "socket.io";

interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

interface RouteParams {
  id?: string;
  userId?: string;
  groupId?: string;
  conversationId?: string;
  postId?: string;
  commentId?: string;
  type?: "followers" | "following";
  notificationId?: string;
  messageId?: string;
}

export interface CustomRequest extends Request<RouteParams> {
  user?: AuthUser;
  resource?: any;
  io?: Server;
  onlineUsers?: Map<string, string>;
}
