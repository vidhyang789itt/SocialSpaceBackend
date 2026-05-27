"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPost = getPost;
exports.updatePostMedia = updatePostMedia;
exports.getUsersPost = getUsersPost;
const Posts_1 = __importDefault(require("../Models/Posts"));
const Users_1 = __importDefault(require("../Models/Users"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
async function createPost(title, content, userId, mediaFiles) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("Cannot find user");
        error.statusCode = 400;
        throw error;
    }
    const media = [];
    if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
            const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
            media.push({
                type: fileType,
                url: `../uploads/${file.filename}`,
                filename: file.filename,
            });
        }
    }
    const newPost = await Posts_1.default.create({
        postId: (0, uuid_1.v4)(),
        author: user._id,
        title: title,
        content: content,
        media: media,
        imageUrl: media.length > 0 && media[0].type === "image" ? media[0].url : undefined,
    });
    return newPost.populate("author");
}
async function getAllPosts(userId, page = 1, limit = 10) {
    const user = await Users_1.default.findOne({ userId }, "_id following");
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const authorIds = [...user.following, user._id];
    const skip = (page - 1) * limit;
    const [posts, totalPosts] = await Promise.all([
        Posts_1.default.find({ author: { $in: authorIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author"),
        Posts_1.default.countDocuments({ author: { $in: authorIds } }),
    ]);
    return {
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
    };
}
async function updatePost(postId, updates) {
    const post = await Posts_1.default.findOne({ postId });
    if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }
    if (updates.title)
        post.title = updates.title;
    if (updates.content)
        post.content = updates.content;
    await post.save();
    return post.populate("author");
}
async function deletePost(postId) {
    const post = await Posts_1.default.findOne({ postId });
    if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }
    if (post.media && post.media.length > 0) {
        for (const media of post.media) {
            try {
                const fullPath = path_1.default.join(__dirname, media.url);
                await fs_1.default.promises.unlink(fullPath);
            }
            catch (err) {
                console.error(`Failed to delete media file: ${media.filename}`, err);
            }
        }
    }
    await Posts_1.default.findOneAndDelete({ postId });
    return true;
}
async function getPost(postId) {
    const post = await Posts_1.default.findOne({ postId }).populate("author");
    if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }
    return post;
}
async function updatePostMedia(postId, mediaFiles, removeMediaIds) {
    const post = await Posts_1.default.findOne({ postId });
    if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }
    if (removeMediaIds && removeMediaIds.length > 0) {
        for (const mediaId of removeMediaIds) {
            const mediaIndex = post.media.findIndex((m) => m._id.toString() === mediaId);
            if (mediaIndex !== -1) {
                const mediaItem = post.media[mediaIndex];
                try {
                    const fullPath = path_1.default.join(__dirname, mediaItem.url);
                    await fs_1.default.promises.unlink(fullPath);
                }
                catch (err) {
                    console.error(`Failed to delete media file: ${mediaItem.filename}`, err);
                }
                post.media.splice(mediaIndex, 1);
            }
        }
    }
    if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
            const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
            post.media.push({
                type: fileType,
                url: `../uploads/${file.filename}`,
                filename: file.filename,
            });
        }
    }
    if (post.media.length > 0) {
        const firstImageOrVideo = post.media.find((m) => m.type === "image") || post.media[0];
        post.imageUrl = firstImageOrVideo.url;
    }
    else {
        post.imageUrl = undefined;
    }
    await post.save();
    return post.populate("author");
}
async function getUsersPost(userId) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const posts = await Posts_1.default.find({ author: user._id })
        .sort({ createdAt: -1 })
        .populate("author");
    return posts;
}
