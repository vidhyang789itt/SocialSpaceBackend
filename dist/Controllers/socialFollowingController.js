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
exports.followUser = followUser;
exports.unfollowUser = unfollowUser;
exports.getConnections = getConnections;
const connectionService = __importStar(require("../Services/ConnectionService"));
const notificationHandler_1 = require("../Socket/notificationHandler");
const Notification_types_1 = require("../Types/Notification.types");
async function followUser(req, res, next) {
    try {
        const { userId: targetUserId } = req.params;
        const currentUserId = req.user?.userId;
        if (!currentUserId || !targetUserId) {
            const error = new Error("User information missing");
            error.statusCode = 400;
            return next(error);
        }
        if (currentUserId === targetUserId) {
            const error = new Error("You cannot follow yourself");
            error.statusCode = 400;
            return next(error);
        }
        const { currentUser, toFollowUser } = await connectionService.follow(currentUserId, targetUserId);
        if (req.io && req.onlineUsers) {
            await (0, notificationHandler_1.sendNotification)(req.io, req.onlineUsers, {
                recipientId: toFollowUser.userId,
                senderId: currentUser._id.toString(),
                type: Notification_types_1.NotificationType.FOLLOW,
            });
        }
        res.status(200).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function unfollowUser(req, res, next) {
    try {
        const { userId: targetUserId } = req.params;
        const currentUserId = req.user?.userId;
        if (!currentUserId || !targetUserId) {
            const error = new Error("User information missing");
            error.statusCode = 400;
            return next(error);
        }
        if (currentUserId === targetUserId) {
            const error = new Error("You cannot unfollow yourself");
            error.statusCode = 400;
            return next(error);
        }
        await connectionService.unfollow(currentUserId, targetUserId);
        res.status(200).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getConnections(req, res, next) {
    try {
        const { userId, type } = req.params;
        if (!userId || !type) {
            const error = new Error("User ID and connection type are required");
            error.statusCode = 400;
            return next(error);
        }
        if (!["followers", "following"].includes(type)) {
            const error = new Error("Invalid connection type");
            error.statusCode = 400;
            return next(error);
        }
        const users = await connectionService.getUserConnections(userId, type);
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
}
