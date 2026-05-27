import express from "express";
import {
  createConversation,
  getMessages,
  getUserConversations,
  getUnreadCount,
  createGroupChat,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  updateGroupInfo,
  updateGroupImage,
  deleteGroup,
  deleteMessageForMe,
  deleteMessageForAll,
} from "../Controllers/chatController";
import { upload } from "../Middlewares/PostsFileUploadMiddleware";

const router = express.Router();

router.post(
  "/conversation",
  createConversation
);

router.get(
  "/conversations",
  getUserConversations
);

router.get(
  "/messages/:conversationId",
  getMessages
);

router.get("/unread-count", getUnreadCount);

router.post(
  "/group",
  upload.single("groupImage"),
  createGroupChat
);

router.post(
  "/group/:groupId/members",
  addGroupMember
);

router.delete(
  "/group/:groupId/members/:userId",
  removeGroupMember
);

router.delete(
  "/group/:groupId/leave",
  leaveGroup
);

router.put(
  "/group/:groupId",
  updateGroupInfo
);

router.put(
  "/group/:groupId/image",
  upload.single("groupImage"),
  updateGroupImage
);

router.delete(
  "/group/:groupId",
  deleteGroup
)

router.delete(
  "/message/:messageId/delete-for-me",
  deleteMessageForMe
);

router.delete(
  "/message/:messageId/delete-for-all",
  deleteMessageForAll
);

export default router;