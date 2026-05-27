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
exports.registerSocketHandlers = void 0;
const chatService = __importStar(require("../Services/chatService"));
const socketServer_1 = require("./socketServer");
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const registerSocketHandlers = (socket) => {
    socket.on("join", (userId) => {
        socket.join(userId);
        socketServer_1.userSocketMap.set(userId, socket.id);
    });
    socket.on("sendMessage", async (data) => {
        try {
            const { conversationId, senderId, receiverId, content, media, replyTo } = data;
            if (!conversationId || !senderId) {
                console.error("❌ Missing required fields");
                socket.emit("error", { message: "Missing required fields" });
                return;
            }
            const message = await chatService.sendMessage(conversationId, senderId, receiverId || null, content, media || [], replyTo || null);
            console.log(message);
            const conversation = await chatService.getConversationById(conversationId);
            if (!conversation) {
                console.warn("⚠️ Conversation not found:", conversationId);
                return;
            }
            if (conversation.type === "group") {
                if (conversation.groupMembers &&
                    Array.isArray(conversation.groupMembers) &&
                    conversation.groupMembers.length > 0) {
                    for (const member of conversation.groupMembers) {
                        if (!member ||
                            !member.userId ||
                            typeof member.userId !== "object") {
                            console.warn("⚠️ Invalid member data:", member);
                            continue;
                        }
                        const memberId = member.userId.userId;
                        if (!memberId) {
                            console.warn("⚠️ Could not extract userId from member");
                            continue;
                        }
                        try {
                            if (memberId) {
                                const recipientSocketId = socketServer_1.userSocketMap.get(memberId);
                                if (recipientSocketId) {
                                    socketServer_1.io.to(recipientSocketId).emit("receiveMessage", message);
                                }
                            }
                        }
                        catch (error) {
                            console.error(`❌ Error processing member ${memberId}:`, error);
                        }
                    }
                }
            }
            else {
                if (receiverId) {
                    const recipientSocketId = socketServer_1.userSocketMap.get(receiverId);
                    const senderSocketId = socketServer_1.userSocketMap.get(senderId);
                    if (recipientSocketId && senderSocketId) {
                        socketServer_1.io.to(recipientSocketId).emit("receiveMessage", message);
                        socketServer_1.io.to(senderSocketId).emit("receiveMessage", message);
                    }
                }
            }
            socket.emit("messageSent", message);
        }
        catch (error) {
            console.error("❌ Socket sendMessage error:", error);
            socket.emit("error", {
                message: "Failed to send message",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("markAsRead", async (data) => {
        try {
            const { conversationId, userId, senderId } = data;
            if (!conversationId || !userId) {
                console.error("❌ Missing required fields");
                socket.emit("error", { message: "Missing required fields" });
                return;
            }
            await chatService.markAsRead(conversationId, userId);
            const conversation = await chatService.getConversationById(conversationId);
            if (!conversation) {
                console.warn("⚠️ Conversation not found:", conversationId);
                return;
            }
            if (conversation.type === "group") {
                if (conversation.groupMembers &&
                    Array.isArray(conversation.groupMembers) &&
                    conversation.groupMembers.length > 0) {
                    for (const member of conversation.groupMembers) {
                        if (!member ||
                            !member.userId ||
                            typeof member.userId !== "object") {
                            console.warn("⚠️ Invalid member data:", member);
                            continue;
                        }
                        const memberId = member.userId.userId;
                        if (!memberId) {
                            console.warn("⚠️ Could not extract userId from member");
                            continue;
                        }
                        try {
                            if (memberId) {
                                const recipientSocketId = socketServer_1.userSocketMap.get(memberId);
                                if (recipientSocketId) {
                                    socketServer_1.io.to(recipientSocketId).emit("messagesRead", {
                                        conversationId,
                                        readBy: userId,
                                    });
                                }
                            }
                        }
                        catch (error) {
                            console.error(`❌ Error processing member ${memberId}:`, error);
                        }
                    }
                }
            }
            else {
                if (senderId && senderId !== userId) {
                    socketServer_1.io.to(senderId).emit("messagesRead", {
                        conversationId,
                        readBy: userId,
                    });
                }
            }
        }
        catch (error) {
            console.error("❌ Socket markAsRead error:", error);
            socket.emit("error", {
                message: "Failed to mark as read",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("joinConversation", (conversationId) => {
        if (!conversationId) {
            console.warn("⚠️ Invalid conversationId");
            return;
        }
        socket.join(conversationId);
    });
    socket.on("leaveConversation", (conversationId) => {
        if (!conversationId) {
            console.warn("⚠️ Invalid conversationId");
            return;
        }
        socket.leave(conversationId);
    });
    socket.on("groupCreated", async (groupData) => {
        try {
            const group = await chatService.getConversationById(groupData.groupId);
            if (!group) {
                return null;
            }
            if (group.groupMembers) {
                for (const member of group.groupMembers) {
                    if (!member ||
                        !member.userId ||
                        typeof member.userId !== "object") {
                        console.warn("⚠️ Invalid member data:", member);
                        continue;
                    }
                    const memberId = member.userId.userId;
                    if (!memberId) {
                        console.warn("⚠️ Could not extract userId from member");
                        continue;
                    }
                    if (group.groupAdmin && memberId === group.groupAdmin._id.toString()) {
                        return null;
                    }
                    try {
                        if (memberId) {
                            const recipientSocketId = socketServer_1.userSocketMap.get(memberId);
                            if (recipientSocketId) {
                                socketServer_1.io.to(recipientSocketId).emit("newGroupCreated", group);
                            }
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing member ${memberId}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error("❌ Socket creating group error:", error);
            socket.emit("error", {
                message: "Failed to send message",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("typing", (data) => {
        const { conversationId, userId, isTyping } = data;
        if (!conversationId || !userId) {
            console.warn("⚠️ Missing typing event data");
            return;
        }
        socket.to(conversationId).emit("userTyping", {
            userId,
            isTyping,
        });
    });
    socket.on("userConnected", (userId) => {
        if (!userId || userId === "undefined") {
            console.warn("⚠️ Invalid userId");
            return;
        }
        socket.join(userId);
        socketServer_1.userSocketMap.set(userId, socket.id);
        const onlineUsers = Array.from(socketServer_1.userSocketMap.keys());
        socketServer_1.io.emit("getOnlineUsers", onlineUsers);
    });
    socket.on("disconnect", (reason) => {
        for (const [userId, socketId] of socketServer_1.userSocketMap.entries()) {
            if (socketId === socket.id) {
                socketServer_1.userSocketMap.delete(userId);
                const onlineUsers = Array.from(socketServer_1.userSocketMap.keys());
                socketServer_1.io.emit("getOnlineUsers", onlineUsers);
                break;
            }
        }
    });
    socket.on("deleteMessage", async (data) => {
        try {
            const { messageId, conversationId, userId, deleteForAll } = data;
            if (!messageId || !conversationId) {
                console.error("❌ Missing required fields");
                socket.emit("error", { message: "Missing required fields" });
                return;
            }
            let message;
            if (deleteForAll) {
                message = await chatService.deleteMessageForAll(messageId, userId);
                console.log(`🗑️ Message ${messageId} deleted for all`);
                const conversation = await chatService.getConversationById(conversationId);
                if (!conversation) {
                    console.warn("⚠️ Conversation not found:", conversationId);
                    return;
                }
                if (conversation.type === "group") {
                    if (conversation.groupMembers &&
                        Array.isArray(conversation.groupMembers) &&
                        conversation.groupMembers.length > 0) {
                        for (const member of conversation.groupMembers) {
                            if (!member ||
                                !member.userId ||
                                typeof member.userId !== "object") {
                                console.warn("⚠️ Invalid member data:", member);
                                continue;
                            }
                            const memberId = member.userId.userId;
                            if (!memberId) {
                                console.warn("⚠️ Could not extract userId from member");
                                continue;
                            }
                            try {
                                if (memberId) {
                                    const recipientSocketId = socketServer_1.userSocketMap.get(memberId);
                                    if (recipientSocketId) {
                                        socketServer_1.io.to(recipientSocketId).emit("messageDeleted", {
                                            messageId,
                                            conversationId,
                                            deletedBy: userId,
                                            deleteForAll,
                                            message,
                                        });
                                    }
                                }
                            }
                            catch (error) {
                                console.error(`❌ Error processing member ${memberId}:`, error);
                            }
                        }
                    }
                }
                else {
                    if (conversation.user1?.userId && conversation.user2?.userId) {
                        const recipientSocketId = socketServer_1.userSocketMap.get(conversation.user1?.userId);
                        const senderSocketId = socketServer_1.userSocketMap.get(conversation.user2?.userId);
                        if (recipientSocketId && senderSocketId) {
                            socketServer_1.io.to(recipientSocketId).emit("messageDeleted", {
                                messageId,
                                conversationId,
                                deletedBy: userId,
                                deleteForAll,
                                message,
                            });
                            socketServer_1.io.to(senderSocketId).emit("messageDeleted", {
                                messageId,
                                conversationId,
                                deletedBy: userId,
                                deleteForAll,
                                message,
                            });
                        }
                    }
                }
            }
            else {
                message = await chatService.deleteMessageForMe(messageId, userId);
            }
            socket.emit("deleteSuccess", { messageId });
        }
        catch (error) {
            console.error("❌ Socket deleteMessage error:", error);
            socket.emit("error", {
                message: "Failed to delete message",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
    });
    socket.on("user:call", ({ to, offer, conversationId, userName }) => {
        console.log(`📞 user:call received - from ${socket.id} to ${to}`);
        const recipientSocketId = socketServer_1.userSocketMap.get(to);
        if (!recipientSocketId) {
            console.warn("⚠️ Recipient not online:", to);
            socket.emit("call:error", { message: "User is not online" });
            return;
        }
        const fromUser = Array.from(socketServer_1.userSocketMap.entries()).find(([_, id]) => id === socket.id)?.[0];
        console.log(`✅ Forwarding incomming:call to ${to}`);
        socketServer_1.io.to(recipientSocketId).emit("incomming:call", {
            from: socket.id,
            offer: offer,
            fromUsername: userName,
            conversationId: conversationId
        });
        socket.emit("call-initiated", {
            remoteSocketId: recipientSocketId
        });
        console.log(`✅ Sent call-initiated to caller with remoteSocketId: ${recipientSocketId}`);
    });
    socket.on("call-answer", ({ to, answer }) => {
        console.log(`✅ call-answer received - from ${socket.id} to ${to}`);
        socketServer_1.io.to(to).emit("call-answer", {
            answer: answer,
            from: socket.id,
        });
    });
    socket.on("ice-candidate", ({ to, candidate }) => {
        if (!to || !candidate) {
            console.warn("⚠️ Invalid ice-candidate data");
            return;
        }
        socketServer_1.io.to(to).emit("ice-candidate", {
            candidate: candidate,
        });
    });
    socket.on("call-reject", ({ to }) => {
        console.log(`❌ call-reject from ${socket.id} to ${to}`);
        socketServer_1.io.to(to).emit("call-rejected");
    });
    socket.on("call-ended", ({ to }) => {
        console.log(`📴 call-ended from ${socket.id} to ${to}`);
        if (to) {
            socketServer_1.io.to(to).emit("call-ended");
        }
    });
    socket.on("call:initiate", async (data) => {
        try {
            const { to, from, fromEmail, fromUsername, conversationId, callType } = data;
            console.log(`📞 call:initiate from ${fromUsername} to ${to}, Type: ${callType}`);
            const recipientSocketId = socketServer_1.userSocketMap.get(to);
            if (!recipientSocketId) {
                console.warn("⚠️ Recipient not online");
                socketServer_1.io.to(socket.id).emit("call:error", {
                    message: "User is not online",
                });
                return;
            }
            // Send notification to receiver
            socketServer_1.io.to(recipientSocketId).emit("incomming:call", {
                from: socket.id,
                fromEmail,
                fromUsername,
                conversationId,
                callType,
            });
            console.log(`✅ call:incoming notification sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Error initiating call:", error);
            socket.emit("error", {
                message: "Failed to initiate call",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("call:accept", async (data) => {
        try {
            const { to } = data;
            console.log(`✅ call:accept from ${socket.id} to ${to}`);
            socketServer_1.io.to(to).emit("call:accepted", { from: socket.id });
            console.log(`✅ Acceptance notification sent to caller`);
        }
        catch (error) {
            console.error("❌ Error accepting call:", error);
            socket.emit("error", {
                message: "Failed to accept call",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed");
        socketServer_1.io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done");
        socketServer_1.io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("room:join", async (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        socket.join(room);
        socketServer_1.io.to(room).emit("user:joined", { email, room: socket.id });
        socket.emit("room:join", data);
    });
    socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
    });
    socket.on("user-status-change", ({ to, type, state }) => {
        console.log(`📤 Status change - ${type}: ${state} to ${to}`);
        socketServer_1.io.to(to).emit("user-status-change", {
            type: type,
            state: state,
        });
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
