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
exports.CreateComment = CreateComment;
exports.getAllPostComments = getAllPostComments;
exports.getAllUserComments = getAllUserComments;
exports.editComment = editComment;
exports.deleteComment = deleteComment;
const commentService = __importStar(require("../Services/commentService"));
const notificationHandler_1 = require("../Socket/notificationHandler");
const Notification_types_1 = require("../Types/Notification.types");
const Users_1 = __importDefault(require("../Models/Users"));
async function CreateComment(req, res, next) {
    try {
        const { postId } = req.params;
        const currentUserId = req.user?.userId;
        const { content } = req.body;
        if (!postId || !currentUserId) {
            const error = new Error("post id is not there");
            error.statusCode = 400;
            return next(error);
        }
        if (!content) {
            const error = new Error("content should not be empty");
            error.statusCode = 400;
            return next(error);
        }
        const { newComment, post, currentUser } = await commentService.postComment(currentUserId, postId, content);
        if (post.author.toString() !== currentUser._id.toString() && req.io && req.onlineUsers) {
            const user = await Users_1.default.findById(post.author);
            if (!user)
                throw new Error("user not found");
            await (0, notificationHandler_1.sendNotification)(req.io, req.onlineUsers, {
                recipientId: user.userId,
                senderId: currentUser._id.toString(),
                type: Notification_types_1.NotificationType.COMMENT,
                content: content,
                referenceId: postId
            });
        }
        res.status(201).json({
            newComment,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAllPostComments(req, res, next) {
    try {
        const { postId } = req.params;
        if (!postId) {
            const error = new Error("post id is not there");
            error.statusCode = 400;
            return next(error);
        }
        const comments = await commentService.getPostComments(postId);
        res.status(201).json({
            comments,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAllUserComments(req, res, next) {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            const error = new Error("user id is not there");
            error.statusCode = 400;
            return next(error);
        }
        const comments = await commentService.getUserComments(currentUserId);
        res.status(201).json({
            comments,
        });
    }
    catch (err) {
        next(err);
    }
}
async function editComment(req, res, next) {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        if (!commentId) {
            const error = new Error("comment id is not there");
            error.statusCode = 400;
            return next(error);
        }
        if (!content) {
            const error = new Error("content should not be empty");
            error.statusCode = 400;
            return next(error);
        }
        const newComment = await commentService.editComment(commentId, content);
        res.status(201).json({
            newComment,
        });
    }
    catch (err) {
        next(err);
    }
}
async function deleteComment(req, res, next) {
    try {
        const { commentId } = req.params;
        if (!commentId) {
            const error = new Error("comment id is not there");
            error.statusCode = 400;
            return next(error);
        }
        await commentService.deleteComment(commentId);
        res.status(200).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
