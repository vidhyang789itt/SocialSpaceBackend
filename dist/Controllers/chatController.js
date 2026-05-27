"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageForAll = exports.deleteMessageForMe = exports.deleteGroup = exports.updateGroupImage = exports.updateGroupInfo = exports.leaveGroup = exports.removeGroupMember = exports.addGroupMember = exports.createGroupChat = exports.getUnreadCount = exports.getUserConversations = exports.getMessages = exports.createConversation = void 0;
const chatService = __importStar(require("../Services/chatService"));
const createConversation = async (req, res, next) => {
    try {
        const { otherUserId } = req.body;
        if (!req.user)
            throw new Error("Unauthorized");
        const currentUserId = req.user.userId;
        const conversation = await chatService.createOrGetConversation(currentUserId, otherUserId);
        res.json(conversation);
    }
    catch (err) {
        next(err);
    }
};
exports.createConversation = createConversation;
const getMessages = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const userId = req.user?.userId;
        if (!conversationId)
            throw new Error("Conversation not found");
        const result = await chatService.getMessages(conversationId, userId, page, limit);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getMessages = getMessages;
const getUserConversations = async (req, res, next) => {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        const userId = req.user.userId;
        const conversations = await chatService.getUserConversations(userId);
        res.json(conversations);
    }
    catch (err) {
        next(err);
    }
};
exports.getUserConversations = getUserConversations;
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const count = await chatService.getUnreadChatCount(userId, false);
        res.status(200).json({ count });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadCount = getUnreadCount;
const createGroupChat = async (req, res, next) => {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        let { groupName, memberIds } = req.body;
        memberIds = JSON.parse(memberIds);
        let groupImage;
        if (req.file) {
            groupImage = `../uploads/${req.file.filename}`;
        }
        const adminId = req.user.userId;
        if (!groupName) {
            return res
                .status(400)
                .json({ message: "Group name is required" });
        }
        if (!memberIds || memberIds.length === 0) {
            return res
                .status(400)
                .json({ message: "At least one member is required" });
        }
        const memberIdsArray = Array.isArray(memberIds)
            ? memberIds
            : [memberIds];
        const group = await chatService.createGroupChat(groupName, memberIdsArray, groupImage, adminId);
        res.json(group);
    }
    catch (err) {
        console.error("❌ Controller error:", err);
        next(err);
    }
};
exports.createGroupChat = createGroupChat;
const addGroupMember = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId)
            throw new Error("give group id");
        const group = await chatService.addGroupMember(groupId, userId, req.user.userId);
        res.json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.addGroupMember = addGroupMember;
const removeGroupMember = async (req, res, next) => {
    try {
        const { groupId, userId } = req.params;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId || !userId)
            throw new Error("give group id");
        const group = await chatService.removeGroupMember(groupId, userId, req.user.userId);
        res.json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.removeGroupMember = removeGroupMember;
const leaveGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId)
            throw new Error("give group id");
        const result = await chatService.leaveGroup(groupId, req.user.userId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.leaveGroup = leaveGroup;
const updateGroupInfo = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { groupName } = req.body;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId)
            throw new Error("give group id");
        const group = await chatService.updateGroupInfo(groupId, groupName, req.user.userId);
        res.json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.updateGroupInfo = updateGroupInfo;
const updateGroupImage = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        if (!req.file) {
            const error = new Error("No file uploaded");
            error.statusCode = 400;
            return next(error);
        }
        const imagePath = `../uploads/${req.file.filename}`;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId)
            throw new Error("give group id");
        const group = await chatService.updateGroupImage(groupId, imagePath, req.user.userId);
        res.json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.updateGroupImage = updateGroupImage;
const deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!groupId)
            throw new Error("give group id");
        const deleted = await chatService.deleteGroup(groupId, req.user.userId);
        res.json(deleted);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteGroup = deleteGroup;
const deleteMessageForMe = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!messageId)
            throw new Error("Message ID is required");
        const message = await chatService.deleteMessageForMe(messageId, req.user.userId);
        res.json({ message, type: "deletedForMe" });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteMessageForMe = deleteMessageForMe;
const deleteMessageForAll = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        if (!req.user)
            throw new Error("Unauthorized");
        if (!messageId)
            throw new Error("Message ID is required");
        const message = await chatService.deleteMessageForAll(messageId, req.user.userId);
        res.json({ message, type: "deletedForAll" });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteMessageForAll = deleteMessageForAll;
