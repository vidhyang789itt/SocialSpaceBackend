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
exports.getUserFeed = getUserFeed;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPost = getPost;
exports.updatePostMedia = updatePostMedia;
exports.getUserAllPost = getUserAllPost;
const postsService = __importStar(require("../Services/PostService"));
async function getUserFeed(req, res, next) {
    try {
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "10");
        if (!req.user)
            throw new Error("Unauthorized");
        const result = await postsService.getAllPosts(req.user.userId, page, limit);
        res.status(200).json({
            success: true,
            body: result.posts,
            pagination: {
                totalPosts: result.totalPosts,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function createPost(req, res, next) {
    try {
        let { title, content } = req.body;
        if (!title && req.body.title) {
            title = req.body.title;
        }
        if (!content && req.body.content) {
            content = req.body.content;
        }
        if (!title || !content) {
            const error = new Error("title and content should not be empty");
            error.statusCode = 400;
            return next(error);
        }
        if (!req.user)
            throw new Error("Unauthorized");
        const mediaFiles = req.files || [];
        const newPost = await postsService.createPost(title, content, req.user.userId, mediaFiles.length > 0 ? mediaFiles : undefined);
        res.status(201).json({
            success: true,
            data: newPost,
        });
    }
    catch (err) {
        next(err);
    }
}
async function updatePost(req, res, next) {
    try {
        if (req.params.id) {
            const { title, content } = req.body;
            if (!title || !content) {
                const error = new Error("title and content should not be empty");
                error.statusCode = 400;
                return next(error);
            }
            const updatedPost = await postsService.updatePost(req.params.id, {
                title,
                content,
            });
            res.status(200).json({
                success: true,
                data: updatedPost,
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function deletePost(req, res, next) {
    try {
        if (req.params.id) {
            await postsService.deletePost(req.params.id);
            res.status(200).json({
                success: true,
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function getPost(req, res, next) {
    try {
        if (req.params.postId) {
            const post = await postsService.getPost(req.params.postId);
            return res.status(200).json({
                success: true,
                data: post,
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function updatePostMedia(req, res, next) {
    try {
        if (req.params.id) {
            const mediaFiles = req.files || [];
            let { removeMediaIds } = req.body;
            if (removeMediaIds && typeof removeMediaIds === "string") {
                try {
                    removeMediaIds = JSON.parse(removeMediaIds);
                }
                catch (e) {
                    console.error("Failed to parse removeMediaIds:", e);
                }
            }
            if (mediaFiles.length === 0 && !removeMediaIds) {
                const error = new Error("Media files or removeMediaIds must be provided");
                error.statusCode = 400;
                return next(error);
            }
            const updatedPost = await postsService.updatePostMedia(req.params.id, mediaFiles.length > 0 ? mediaFiles : [], removeMediaIds);
            res.status(200).json({
                success: true,
                data: updatedPost,
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function getUserAllPost(req, res, next) {
    try {
        if (req.params.userId) {
            const posts = await postsService.getUsersPost(req.params.userId);
            res.status(200).json({
                success: true,
                body: posts,
            });
        }
    }
    catch (err) {
        next(err);
    }
}
