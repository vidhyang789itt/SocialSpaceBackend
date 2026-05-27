"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = likePost;
exports.unlikePost = unlikePost;
exports.getAllLike = getAllLike;
const Likes_1 = require("../Models/Likes");
const Posts_1 = __importDefault(require("../Models/Posts"));
const user_1 = require("../Utils/user");
async function likePost(postId, currentUserId) {
    try {
        const { currentUser, post, alreadyExist } = await (0, user_1.checkForUserAndPostForLike)(currentUserId, postId);
        if (alreadyExist) {
            throw new Error("Like already exist");
        }
        await Likes_1.Like.create({
            user: currentUser._id,
            post: post._id,
        });
        return { post, currentUser };
    }
    catch (err) {
        throw err;
    }
}
async function unlikePost(postId, currentUserId) {
    try {
        const { currentUser, post, alreadyExist } = await (0, user_1.checkForUserAndPostForLike)(currentUserId, postId);
        if (!alreadyExist) {
            throw new Error("like the post First");
        }
        const like = await Likes_1.Like.deleteOne({
            user: currentUser._id,
            post: post._id,
        });
        return true;
    }
    catch (err) {
        throw err;
    }
}
async function getAllLike(postId) {
    const post = await Posts_1.default.findOne({ postId });
    if (!post) {
        throw new Error("post not exist");
    }
    const totalLikes = await Likes_1.Like.find({ post: post._id });
    return totalLikes;
}
