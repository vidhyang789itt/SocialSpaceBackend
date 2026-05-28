import { NextFunction, Request, Response } from "express";
import * as chatService from "../Services/chatService";
import { CustomRequest } from "../Types/CustomRequestType";

export const createConversation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { otherUserId } = req.body;
        if (!req.user) throw new Error("Unauthorized");
        const currentUserId = req.user.userId;

        const conversation = await chatService.createOrGetConversation(
            currentUserId,
            otherUserId
        );

        res.json(conversation);
    } catch (err) {
        next(err);
    }
};

export const getMessages = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const conversationId = req.params.conversationId;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const userId = req.user?.userId;

        if (!conversationId) throw new Error("Conversation not found");

        const result = await chatService.getMessages(
            conversationId,
            userId,
            page,
            limit
        );

        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getUserConversations = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error("Unauthorized");

        const userId = req.user.userId;

        const conversations = await chatService.getUserConversations(userId);

        res.json(conversations);
    } catch (err) {
        next(err);
    }
};

export const getUnreadCount = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const count = await chatService.getUnreadChatCount(userId, false);

        res.status(200).json({ count });
    } catch (error: any) {
        next(error);
    }
};

export const createGroupChat = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) throw new Error("Unauthorized");

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

        const group = await chatService.createGroupChat(
            groupName,
            memberIdsArray,
            groupImage,
            adminId
        );

        res.json(group);
    } catch (err) {
        console.error("❌ Controller error:", err);
        next(err);
    }
};

export const addGroupMember = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId) throw new Error("give group id");

        const group = await chatService.addGroupMember(groupId, userId, req.user.userId);

        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const removeGroupMember = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId, userId } = req.params;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId || !userId) throw new Error("give group id");

        const group = await chatService.removeGroupMember(groupId, userId, req.user.userId);

        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const leaveGroup = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId) throw new Error("give group id");

        const result = await chatService.leaveGroup(groupId, req.user.userId);

        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const updateGroupInfo = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;
        const { groupName } = req.body;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId) throw new Error("give group id");

        const group = await chatService.updateGroupInfo(groupId, groupName, req.user.userId);

        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const updateGroupImage = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;

        if (!req.file) {
            const error = new Error("No file uploaded") as any;
            error.statusCode = 400;
            return next(error);
        }

        const imagePath = `../uploads/${req.file.filename}`;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId) throw new Error("give group id");

        const group = await chatService.updateGroupImage(groupId, imagePath, req.user.userId);

        res.json(group);
    } catch (err) {
        next(err);
    }
};

export const deleteGroup = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;

        if (!req.user) throw new Error("Unauthorized");
        if (!groupId) throw new Error("give group id");

        const deleted = await chatService.deleteGroup(groupId, req.user.userId);

        res.json(deleted);
    }
    catch (err) {
        next(err);
    }
}

export const deleteMessageForMe = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { messageId } = req.params;

        if (!req.user) throw new Error("Unauthorized");
        if (!messageId) throw new Error("Message ID is required");

        const message = await chatService.deleteMessageForMe(
            messageId,
            req.user.userId
        );


        res.json({ message, type: "deletedForMe" });
    } catch (err) {
        next(err);
    }
};

export const deleteMessageForAll = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { messageId } = req.params;

        if (!req.user) throw new Error("Unauthorized");
        if (!messageId) throw new Error("Message ID is required");

        const message = await chatService.deleteMessageForAll(
            messageId,
            req.user.userId
        );

        res.json({ message, type: "deletedForAll" });
    } catch (err) {
        next(err);
    }
};
