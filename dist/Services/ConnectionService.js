"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.follow = follow;
exports.unfollow = unfollow;
exports.getUserConnections = getUserConnections;
const Users_1 = __importDefault(require("../Models/Users"));
const user_1 = require("../Utils/user");
async function follow(currentUserId, toFollowUserId) {
    const { currentUser, toFollowUser } = await (0, user_1.getBothUsers)(currentUserId, toFollowUserId);
    await Users_1.default.updateOne({ _id: toFollowUser._id }, { $addToSet: { followers: currentUser._id } });
    await Users_1.default.updateOne({ _id: currentUser._id }, { $addToSet: { following: toFollowUser._id } });
    return { currentUser, toFollowUser };
}
async function unfollow(currentUserId, toFollowUserId) {
    const { currentUser, toFollowUser } = await (0, user_1.getBothUsers)(currentUserId, toFollowUserId);
    await Users_1.default.updateOne({ _id: toFollowUser._id }, { $pull: { followers: currentUser._id } });
    await Users_1.default.updateOne({ _id: currentUser._id }, { $pull: { following: toFollowUser._id } });
    return true;
}
async function getUserConnections(userId, type) {
    const user = await Users_1.default.findOne({ userId }).populate(type);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user[type];
}
