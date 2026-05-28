"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.deleteMessageForAll = exports.deleteMessageForMe = exports.deleteGroup = exports.updateGroupImage = exports.updateGroupInfo = exports.leaveGroup = exports.removeGroupMember = exports.addGroupMember = exports.createGroupChat = exports.getUnreadChatCount = exports.markAsRead = exports.getConversationById = exports.getUserConversations = exports.sendMessage = exports.createOrGetConversation = void 0;
const Conversations_1 = __importDefault(require("../Models/Conversations"));
const Messages_1 = __importDefault(require("../Models/Messages"));
const mongoose_1 = __importDefault(require("mongoose"));
const Users_1 = __importDefault(require("../Models/Users"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_1 = require("../Utils/user");
const isIdEqual = (id1, id2) => {
    if (!id1 || !id2)
        return false;
    return id1.toString() === id2.toString();
};
const createOrGetConversation = async (userId1, userId2) => {
    try {
        const userA = await Users_1.default.findOne({ userId: userId1 }).select("_id");
        const userB = await Users_1.default.findOne({ userId: userId2 }).select("_id");
        if (!userA || !userB) {
            throw new Error("User not found");
        }
        const [id1, id2] = userA._id.toString() < userB._id.toString()
            ? [userA._id, userB._id]
            : [userB._id, userA._id];
        let conversation = await Conversations_1.default.findOne({
            type: "direct",
            user1: id1,
            user2: id2,
        }).populate("user1 user2", "username profileUrl userId");
        if (!conversation) {
            const newConversation = await Conversations_1.default.create({
                type: "direct",
                user1: id1,
                user2: id2,
            });
            conversation = await newConversation.populate("user1 user2", "username profileUrl userId");
        }
        return conversation;
    }
    catch (error) {
        console.error("❌ Error creating/getting conversation:", error);
        throw error;
    }
};
exports.createOrGetConversation = createOrGetConversation;
const sendMessage = async (conversationId, senderId, receiverId, content, media, replyTo) => {
    try {
        const sender = await Users_1.default.findOne({ userId: senderId });
        if (!sender)
            throw new Error("User not found");
        const conversation = await Conversations_1.default.findById(conversationId);
        if (!conversation)
            throw new Error("Conversation not found");
        if (conversation.type === "direct" && receiverId) {
            const isFollowing = await (0, user_1.isUserFollowing)(senderId, receiverId);
            if (!isFollowing) {
                const error = new Error("You must follow this user to send messages");
                error.statusCode = 403;
                throw error;
            }
        }
        let messageType = "text";
        if (media && media.length > 0) {
            if (content && content.trim()) {
                messageType = "mixed";
            }
            else {
                messageType = media[0].type;
            }
        }
        const messageData = {
            conversationId,
            senderId: sender._id,
            receiverId: receiverId
                ? (await Users_1.default.findOne({ userId: receiverId }))?._id
                : null,
            content,
            media: media || [],
            messageType,
        };
        if (replyTo && replyTo.messageId) {
            messageData.replyTo = {
                messageId: new mongoose_1.default.Types.ObjectId(replyTo.messageId),
                content: replyTo.content,
                senderName: replyTo.senderName,
                media: replyTo.media || [],
            };
        }
        const message = await Messages_1.default.create(messageData);
        conversation.lastMessage = content || `[${messageType.toUpperCase()}]`;
        conversation.lastMessageSender = sender._id;
        conversation.lastMessageTime = new Date();
        if (conversation.type === "direct") {
            if (isIdEqual(conversation.user1, sender._id)) {
                conversation.unreadCountUser2 =
                    (conversation.unreadCountUser2 || 0) + 1;
            }
            else {
                conversation.unreadCountUser1 =
                    (conversation.unreadCountUser1 || 0) + 1;
            }
        }
        else if (conversation.type === "group" && conversation.groupUnreadCounts) {
            const updatedCounts = conversation.groupUnreadCounts.map((item) => {
                if (item && item._id && !isIdEqual(item._id, sender._id)) {
                    return {
                        _id: item._id,
                        unreadCount: (item.unreadCount || 0) + 1,
                    };
                }
                return {
                    _id: item?._id,
                    unreadCount: item?.unreadCount || 0,
                };
            });
            conversation.groupUnreadCounts = updatedCounts;
        }
        await conversation.save();
        const populatedMessage = await message.populate("senderId receiverId", "username profileUrl userId");
        return populatedMessage;
    }
    catch (error) {
        console.error("❌ Error saving message:", error);
        throw error;
    }
};
exports.sendMessage = sendMessage;
const getUserConversations = async (userId) => {
    try {
        const user = await Users_1.default.findOne({ userId }).select("_id");
        if (!user) {
            throw new Error("User not found");
        }
        const conversations = await Conversations_1.default.find({
            $or: [
                { type: "direct", user1: user._id },
                { type: "direct", user2: user._id },
                { "groupMembers.userId": user._id },
            ],
        })
            .sort({ updatedAt: -1 })
            .populate("user1 user2 groupAdmin", "username profileUrl userId followers")
            .populate("groupMembers.userId", "username profileUrl userId");
        return conversations;
    }
    catch (error) {
        console.error("❌ Error fetching conversations:", error);
        throw error;
    }
};
exports.getUserConversations = getUserConversations;
const getConversationById = async (conversationId) => {
    try {
        const conversation = await Conversations_1.default.findById(conversationId)
            .populate("user1 user2 groupAdmin", "username profileUrl userId")
            .populate("groupMembers.userId", "username profileUrl userId");
        if (!conversation) {
            console.warn("⚠️ Conversation not found:", conversationId);
            return null;
        }
        return conversation;
    }
    catch (error) {
        console.error("❌ Error fetching conversation:", error);
        throw error;
    }
};
exports.getConversationById = getConversationById;
const markAsRead = async (conversationId, userId) => {
    try {
        const conversation = await Conversations_1.default.findById(conversationId);
        const user = await Users_1.default.findById(userId);
        if (!conversation)
            throw new Error("Conversation not found");
        if (!user)
            throw new Error("User not found");
        if (conversation.type === "direct") {
            await Messages_1.default.updateMany({
                conversationId: conversation._id,
                receiverId: user._id,
                isRead: false,
            }, { $set: { isRead: true } });
            if (isIdEqual(user._id, conversation.user1)) {
                conversation.unreadCountUser1 = 0;
            }
            else {
                conversation.unreadCountUser2 = 0;
            }
        }
        else if (conversation.type === "group" && conversation.groupUnreadCounts) {
            await Messages_1.default.updateMany({
                conversationId: conversation._id,
                senderId: { $ne: user._id },
            }, {
                $addToSet: {
                    readBy: {
                        userId: user._id,
                        readAt: new Date(),
                    },
                },
            });
            const updatedCounts = conversation.groupUnreadCounts.map((item) => {
                if (item && item._id && isIdEqual(item._id, user._id)) {
                    return {
                        _id: item._id,
                        unreadCount: 0,
                    };
                }
                return {
                    _id: item?._id,
                    unreadCount: item?.unreadCount || 0,
                };
            });
            conversation.groupUnreadCounts = updatedCounts;
        }
        await conversation.save();
    }
    catch (error) {
        console.error("❌ Error marking as read:", error);
        throw error;
    }
};
exports.markAsRead = markAsRead;
const getUnreadChatCount = async (userId, isOriginal) => {
    try {
        const user = isOriginal
            ? await Users_1.default.findById(userId).select("_id userId")
            : await Users_1.default.findOne({ userId }).select("_id userId");
        if (!user) {
            throw new Error("User not found");
        }
        const mongoUserId = new mongoose_1.default.Types.ObjectId(user._id);
        const result = await Conversations_1.default.aggregate([
            {
                $match: {
                    $or: [
                        {
                            type: "direct",
                            user1: mongoUserId,
                            unreadCountUser1: { $gt: 0 },
                        },
                        {
                            type: "direct",
                            user2: mongoUserId,
                            unreadCountUser2: { $gt: 0 },
                        },
                        {
                            type: "group",
                            groupUnreadCounts: {
                                $elemMatch: {
                                    _id: mongoUserId,
                                    unreadCount: { $gt: 0 },
                                },
                            },
                        },
                    ],
                },
            },
            {
                $group: {
                    _id: "$_id",
                },
            },
            {
                $count: "totalUnreadConversations",
            },
        ]);
        const totalUnread = result?.[0]?.totalUnreadConversations || 0;
        return {
            totalUnread,
            userId: user.userId,
        };
    }
    catch (error) {
        console.error("❌ Error fetching unread chat count:", error);
        throw error;
    }
};
exports.getUnreadChatCount = getUnreadChatCount;
const createGroupChat = async (groupName, memberUserIds, groupImage, adminUserId) => {
    try {
        const adminId = adminUserId;
        if (!adminId)
            throw new Error("Admin user ID is required");
        const admin = await Users_1.default.findOne({ userId: adminId });
        if (!admin)
            throw new Error("Admin user not found");
        let allMemberIds = [];
        if (memberUserIds) {
            allMemberIds = Array.isArray(memberUserIds)
                ? memberUserIds
                : [memberUserIds];
        }
        const uniqueMemberIds = Array.from(new Set([adminId, ...allMemberIds]));
        const members = await Users_1.default.find({ userId: { $in: uniqueMemberIds } });
        if (members.length === 0)
            throw new Error("No valid members found");
        const groupMembersData = members.map((member) => ({
            userId: member._id,
            role: isIdEqual(member._id, admin._id)
                ? "admin"
                : "member",
        }));
        const groupUnreadCountsData = groupMembersData.map((member) => ({
            _id: member.userId,
            unreadCount: 0,
        }));
        const conversation = await Conversations_1.default.create({
            type: "group",
            groupName,
            groupImage: groupImage || undefined,
            groupAdmin: admin._id,
            groupMembers: groupMembersData,
            groupUnreadCounts: groupUnreadCountsData,
            updatedAt: new Date(),
        });
        const populated = await conversation.populate([
            { path: "groupAdmin", select: "username profileUrl userId" },
            { path: "groupMembers.userId", select: "username profileUrl userId" },
            { path: "groupUnreadCounts._id", select: "username profileUrl userId" },
        ]);
        return populated;
    }
    catch (error) {
        console.error("❌ Error creating group chat:", error);
        throw error;
    }
};
exports.createGroupChat = createGroupChat;
const addGroupMember = async (groupId, newUserIds, requesterUserId) => {
    try {
        const conversation = await Conversations_1.default.findById(groupId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Group not found");
        }
        const requester = await Users_1.default.findOne({ userId: requesterUserId });
        if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
            throw new Error("Only group admin can add members");
        }
        const userIdsArray = Array.isArray(newUserIds) ? newUserIds : [newUserIds];
        const newUsers = await Users_1.default.find({ userId: { $in: userIdsArray } });
        if (newUsers.length === 0)
            throw new Error("No valid users found");
        newUsers.forEach((user) => {
            const isMember = conversation.groupMembers &&
                conversation.groupMembers.some((m) => m && m.userId && isIdEqual(m.userId, user._id));
            if (!isMember) {
                conversation.groupMembers?.push({
                    userId: user._id,
                    role: "member",
                });
                conversation.groupUnreadCounts?.push({
                    _id: user._id,
                    unreadCount: 0,
                });
            }
        });
        await conversation.save();
        return (await conversation.populate("groupAdmin groupMembers.userId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error adding members:", error);
        throw error;
    }
};
exports.addGroupMember = addGroupMember;
const removeGroupMember = async (groupId, memberUserIdToRemove, requesterUserId) => {
    try {
        const conversation = await Conversations_1.default.findById(groupId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Group not found");
        }
        const requester = await Users_1.default.findOne({ userId: requesterUserId });
        if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
            throw new Error("Only group admin can remove members");
        }
        const memberToRemove = await Users_1.default.findOne({
            userId: memberUserIdToRemove,
        });
        if (!memberToRemove)
            throw new Error("User not found");
        if (conversation.groupMembers && Array.isArray(conversation.groupMembers)) {
            const filteredMembers = conversation.groupMembers.filter((m) => !m || !m.userId || !isIdEqual(m.userId, memberToRemove._id));
            conversation.groupMembers = filteredMembers;
        }
        if (conversation.groupUnreadCounts &&
            Array.isArray(conversation.groupUnreadCounts)) {
            const filteredCounts = conversation.groupUnreadCounts.filter((c) => !c || !c._id || !isIdEqual(c._id, memberToRemove._id));
            conversation.groupUnreadCounts = filteredCounts;
        }
        await conversation.save();
        return (await conversation.populate("groupAdmin groupMembers.userId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error removing member:", error);
        throw error;
    }
};
exports.removeGroupMember = removeGroupMember;
const leaveGroup = async (groupId, userIdToRemove) => {
    try {
        const conversation = await Conversations_1.default.findById(groupId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Group not found");
        }
        const user = await Users_1.default.findOne({ userId: userIdToRemove });
        if (!user)
            throw new Error("User not found");
        if (conversation.groupMembers && Array.isArray(conversation.groupMembers)) {
            const filteredMembers = conversation.groupMembers.filter((m) => !m || !m.userId || !isIdEqual(m.userId, user._id));
            conversation.groupMembers = filteredMembers;
        }
        if (conversation.groupUnreadCounts &&
            Array.isArray(conversation.groupUnreadCounts)) {
            const filteredCounts = conversation.groupUnreadCounts.filter((c) => !c || !c._id || !isIdEqual(c._id, user._id));
            conversation.groupUnreadCounts = filteredCounts;
        }
        await conversation.save();
        return (await conversation.populate("groupAdmin groupMembers.userId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error leaving group:", error);
        throw error;
    }
};
exports.leaveGroup = leaveGroup;
const updateGroupInfo = async (groupId, groupName, requesterUserId) => {
    try {
        const conversation = await Conversations_1.default.findById(groupId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Group not found");
        }
        const requester = await Users_1.default.findOne({ userId: requesterUserId });
        if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
            throw new Error("Only group admin can update group info");
        }
        if (groupName)
            conversation.groupName = groupName;
        await conversation.save();
        return (await conversation.populate("groupAdmin groupMembers.userId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error updating group info:", error);
        throw error;
    }
};
exports.updateGroupInfo = updateGroupInfo;
const updateGroupImage = async (groupId, imagePath, requesterUserId) => {
    try {
        const conversation = await Conversations_1.default.findById(groupId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Group not found");
        }
        const requester = await Users_1.default.findOne({ userId: requesterUserId });
        if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
            throw new Error("Only group admin can update group info");
        }
        const oldImageUrl = conversation.groupImage;
        conversation.groupImage = imagePath;
        if (oldImageUrl) {
            try {
                const fullPath = path_1.default.join(__dirname, oldImageUrl);
                await fs_1.default.promises.unlink(fullPath);
            }
            catch (err) {
            }
        }
        await conversation.save();
        return (await conversation.populate("groupAdmin groupMembers.userId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error updating group info:", error);
        throw error;
    }
};
exports.updateGroupImage = updateGroupImage;
const deleteGroup = async (groupId, requesterUserId) => {
    const conversation = await Conversations_1.default.findById(groupId);
    if (!conversation || conversation.type !== "group") {
        throw new Error("Group not found or is not a group conversation");
    }
    const result = await Conversations_1.default.findByIdAndDelete(groupId);
    return !!result;
};
exports.deleteGroup = deleteGroup;
const deleteMessageForMe = async (messageId, userId) => {
    try {
        const user = await Users_1.default.findOne({ userId }).select("_id");
        if (!user)
            throw new Error("User not found");
        const message = await Messages_1.default.findById(messageId);
        if (!message)
            throw new Error("Message not found");
        const alreadyDeleted = message.deletedForMe?.some((item) => isIdEqual(item.userId, user._id));
        if (alreadyDeleted) {
            throw new Error("Message already deleted for you");
        }
        if (!message.deletedForMe)
            message.deletedForMe = [];
        message.deletedForMe.push({
            userId: user._id,
        });
        await message.save();
        return (await message.populate("senderId receiverId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error deleting message for me:", error);
        throw error;
    }
};
exports.deleteMessageForMe = deleteMessageForMe;
const deleteMessageForAll = async (messageId, userId) => {
    try {
        const user = await Users_1.default.findOne({ userId }).select("_id");
        if (!user)
            throw new Error("User not found");
        const message = await Messages_1.default.findById(messageId);
        if (!message)
            throw new Error("Message not found");
        if (!isIdEqual(message.senderId, user._id)) {
            const error = new Error("Only message sender can delete for everyone");
            error.statusCode = 403;
            throw error;
        }
        const messageAge = Date.now() - message.createdAt.getTime();
        const fifteenMinutes = 15 * 60 * 1000;
        if (messageAge > fifteenMinutes) {
            const error = new Error("Can only delete messages sent within last 15 minutes");
            error.statusCode = 400;
            throw error;
        }
        message.originalContent = message.content;
        message.isDeletedForAll = true;
        message.content = "";
        message.media = [];
        message.messageType = "text";
        await message.save();
        return (await message.populate("senderId receiverId", "username profileUrl userId"));
    }
    catch (error) {
        console.error("❌ Error deleting message for all:", error);
        throw error;
    }
};
exports.deleteMessageForAll = deleteMessageForAll;
const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    try {
        let user = null;
        if (userId) {
            user = await Users_1.default.findOne({ userId }).select("_id");
        }
        const skip = (page - 1) * limit;
        const totalMessages = await Messages_1.default.countDocuments({ conversationId });
        const messages = await Messages_1.default.find({ conversationId })
            .populate("senderId receiverId", "username profileUrl userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const sortedMessages = messages.reverse();
        if (!user) {
            return {
                messages: sortedMessages,
                totalMessages,
                totalPages: Math.ceil(totalMessages / limit),
                currentPage: page,
                hasNextPage: skip + limit < totalMessages,
                hasPreviousPage: page > 1,
            };
        }
        const filteredMessages = messages
            .map((msg) => {
                const isDeletedForUser = msg.deletedForMe?.some((item) => isIdEqual(item.userId, user._id));
                if (isDeletedForUser) {
                    return null;
                }
                return msg;
            })
            .filter((msg) => msg !== null);
        return {
            messages: filteredMessages,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: page,
            hasNextPage: skip + limit < totalMessages,
            hasPreviousPage: page > 1,
        };
    }
    catch (error) {
        console.error("❌ Error fetching messages:", error);
        throw error;
    }
};
exports.getMessages = getMessages;
