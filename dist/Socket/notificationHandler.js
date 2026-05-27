"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notificationService_1 = require("../Services/notificationService");
const sendNotification = async (io, onlineUsers, data) => {
    try {
        const { notification: populatedNotify } = await (0, notificationService_1.createNotification)(data);
        if (!populatedNotify)
            return;
        io.to(data.recipientId).emit("newNotification", populatedNotify);
    }
    catch (error) {
        console.error("Notification Socket Handler Error:", error);
    }
};
exports.sendNotification = sendNotification;
