"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.createNotification = void 0;
exports.getAllNotification = getAllNotification;
exports.markAsRead = markAsRead;
const Notifications_1 = __importDefault(require("../Models/Notifications"));
const Posts_1 = __importDefault(require("../Models/Posts"));
const Users_1 = __importDefault(require("../Models/Users"));
const Notification_types_1 = require("../Types/Notification.types");
async function getAllNotification(userId) {
    try {
        const user = await Users_1.default.findOne({ userId }, "_id");
        if (!user)
            throw new Error("USER not found");
        return await Notifications_1.default.find({ recipient: user._id })
            .populate('sender', 'username profileUrl userId')
            .populate('referenceId', 'title postId imageUrl content username profileUrl')
            .sort({ createdAt: -1 });
    }
    catch (err) {
        throw err;
    }
}
async function markAsRead(userId) {
    try {
        const user = await Users_1.default.findOne({ userId }, "_id");
        if (!user)
            throw new Error("USER not found");
        await Notifications_1.default.updateMany({ recipient: user._id, isRead: false }, { isRead: true });
    }
    catch (err) {
        throw err;
    }
}
const createNotification = async (data) => {
    try {
        const recipient = await Users_1.default.findOne({ userId: data.recipientId });
        if (!recipient)
            throw new Error("Recipient not found");
        let referenceDocId = null;
        let onModel = "";
        if (data.type === Notification_types_1.NotificationType.FOLLOW) {
            referenceDocId = data.senderId;
            onModel = "User";
        }
        else {
            const post = await Posts_1.default.findOne({ postId: data.referenceId });
            if (!post)
                throw new Error("Post not found");
            referenceDocId = post._id;
            onModel = "Post";
        }
        const newNotification = new Notifications_1.default({
            recipient: recipient._id,
            sender: data.senderId,
            type: data.type,
            content: data.content,
            referenceId: referenceDocId,
            onModel: onModel
        });
        await newNotification.save();
        const populatedNotification = await Notifications_1.default.findById(newNotification._id)
            .populate('sender', 'username profileUrl userId')
            .populate('referenceId');
        return { notification: populatedNotification };
    }
    catch (error) {
        throw error;
    }
};
exports.createNotification = createNotification;
const markNotificationRead = async (notificationId, userId) => {
    const notification = await Notifications_1.default.findById(notificationId);
    const user = await Users_1.default.findOne({ userId });
    if (!notification) {
        throw new Error("Notification not found");
    }
    if (!user) {
        throw new Error("user not found");
    }
    notification.isRead = true;
    await notification.save();
    const updatedNotification = await Notifications_1.default.findById(notificationId)
        .populate('sender', 'username profileUrl userId')
        .populate('referenceId', 'title _id postId imageUrl content');
    return updatedNotification;
};
exports.markNotificationRead = markNotificationRead;
