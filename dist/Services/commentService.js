"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postComment = postComment;
exports.getPostComments = getPostComments;
exports.getUserComments = getUserComments;
exports.editComment = editComment;
exports.deleteComment = deleteComment;
const Comments_1 = require("../Models/Comments");
const Posts_1 = __importDefault(require("../Models/Posts"));
const Users_1 = __importDefault(require("../Models/Users"));
const user_1 = require("../Utils/user");
async function postComment(userId, postId, content) {
    try {
        const { currentUser, post } = await (0, user_1.checkForUserAndPost)(userId, postId);
        const newComment = await Comments_1.Comment.create({
            user: currentUser._id,
            post: post._id,
            content: content,
        });
        await newComment.populate({
            path: "user",
        });
        return { newComment, post, currentUser };
    }
    catch (err) {
        throw err;
    }
}
async function getPostComments(postId) {
    const post = await Posts_1.default.findOne({ postId });
    if (!post) {
        throw new Error("post not found");
    }
    const postComments = Comments_1.Comment.find({
        post: post._id,
    })
        .populate("user")
        .sort({ createdAt: -1 });
    return postComments;
}
async function getUserComments(userId) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        throw new Error("user not found");
    }
    const userComments = Comments_1.Comment.find({
        user: user._id,
    }).populate("user");
    return userComments;
}
async function editComment(commentId, content) {
    await Comments_1.Comment.findByIdAndUpdate(commentId, {
        content: content,
    });
    const updatedComment = await Comments_1.Comment.findById(commentId).populate("user");
    return updatedComment;
}
async function deleteComment(commentId) {
    const comment = await Comments_1.Comment.findById(commentId);
    if (!comment) {
        throw new Error("Comment not found");
    }
    await Comments_1.Comment.findByIdAndDelete(commentId);
    return true;
}
