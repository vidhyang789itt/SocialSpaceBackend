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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = likePost;
exports.unlikePost = unlikePost;
exports.getLikes = getLikes;
const likeService = __importStar(require("../Services/LikeService"));
const Users_1 = __importDefault(require("../Models/Users"));
const notificationHandler_1 = require("../Socket/notificationHandler");
const Notification_types_1 = require("../Types/Notification.types");
async function likePost(req, res, next) {
    try {
        const { postId } = req.params;
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            const error = new Error("User information missing");
            error.statusCode = 400;
            return next(error);
        }
        if (!postId) {
            const error = new Error("Post information missing");
            error.statusCode = 400;
            return next(error);
        }
        const { post, currentUser } = await likeService.likePost(postId, currentUserId);
        if (post.author.toString() !== currentUser._id.toString() && req.io && req.onlineUsers) {
            const user = await Users_1.default.findById(post.author);
            if (!user)
                throw new Error("user not found");
            await (0, notificationHandler_1.sendNotification)(req.io, req.onlineUsers, {
                recipientId: user.userId,
                senderId: currentUser._id.toString(),
                type: Notification_types_1.NotificationType.LIKE,
                referenceId: postId
            });
        }
        res.status(201).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function unlikePost(req, res, next) {
    try {
        const { postId } = req.params;
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            const error = new Error("User information missing");
            error.statusCode = 400;
            return next(error);
        }
        if (!postId) {
            const error = new Error("Post information missing");
            error.statusCode = 400;
            return next(error);
        }
        await likeService.unlikePost(postId, currentUserId);
        res.status(200).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getLikes(req, res, next) {
    try {
        const { postId } = req.params;
        if (!postId) {
            const error = new Error("Post information missing");
            error.statusCode = 400;
            return next(error);
        }
        const response = await likeService.getAllLike(postId);
        res.status(200).json({
            status: true,
            body: response,
        });
    }
    catch (err) {
        next(err);
    }
}
