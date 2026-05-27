"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserFollowing = void 0;
exports.getBothUsers = getBothUsers;
exports.checkForUserAndPost = checkForUserAndPost;
exports.checkForUserAndPostForLike = checkForUserAndPostForLike;
const Likes_1 = require("../Models/Likes");
const Posts_1 = __importDefault(require("../Models/Posts"));
const Users_1 = __importDefault(require("../Models/Users"));
async function getBothUsers(currentUserId, toFollowUserId) {
    const currentUser = await Users_1.default.findOne({ userId: currentUserId });
    const toFollowUser = await Users_1.default.findOne({ userId: toFollowUserId });
    if (!currentUser || !toFollowUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    if (currentUser._id.equals(toFollowUser._id)) {
        const error = new Error("You cannot follow yourself");
        error.statusCode = 400;
        throw error;
    }
    return { currentUser, toFollowUser };
}
async function checkForUserAndPost(userId, postId) {
    const currentUser = await Users_1.default.findOne({ userId: userId }, "_id");
    const post = await Posts_1.default.findOne({ postId });
    if (!currentUser) {
        throw new Error("User not found");
    }
    if (!post) {
        throw new Error("Cannot find post");
    }
    return {
        currentUser,
        post,
    };
}
async function checkForUserAndPostForLike(userId, postId) {
    const currentUser = await Users_1.default.findOne({ userId: userId }, "_id");
    const post = await Posts_1.default.findOne({ postId });
    if (!currentUser) {
        throw new Error("User not found");
    }
    if (!post) {
        throw new Error("Cannot find post");
    }
    const alreadyExist = await Likes_1.Like.findOne({
        user: currentUser._id,
        post: post._id,
    });
    return {
        currentUser,
        post,
        alreadyExist,
    };
}
const isUserFollowing = async (senderId, recipientId) => {
    try {
        const sender = await Users_1.default.findOne({ userId: senderId }).select("following");
        if (!sender)
            return false;
        const recipient = await Users_1.default.findOne({ userId: recipientId }).select("_id");
        if (!recipient)
            return false;
        const isFollowing = sender.following?.some((follow) => follow._id.toString() === recipient._id.toString());
        return !!isFollowing;
    }
    catch (error) {
        return false;
    }
};
exports.isUserFollowing = isUserFollowing;
