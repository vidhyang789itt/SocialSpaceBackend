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
exports.getUserFullProfileData = void 0;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.updatePassword = updatePassword;
exports.getUserConnections = getUserConnections;
exports.updateProfilePhoto = updateProfilePhoto;
exports.getAllUsers = getAllUsers;
const Users_1 = __importDefault(require("../Models/Users"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const postsService = __importStar(require("./PostService"));
async function getUserProfile(userId) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
}
async function updateUserProfile(userId, updates) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    if (updates.username)
        user.username = updates.username;
    if (updates.email)
        user.email = updates.email;
    await user.save();
    return user;
}
async function updatePassword(userId, currentPassword, newPassword) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
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
async function updateProfilePhoto(userId, imagePath) {
    const user = await Users_1.default.findOne({ userId });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const oldImageUrl = user.profileUrl;
    user.profileUrl = imagePath;
    if (oldImageUrl) {
        try {
            const fullPath = path_1.default.join(__dirname, oldImageUrl);
            await fs_1.default.promises.unlink(fullPath);
        }
        catch (err) {
        }
    }
    await user.save();
    return user;
}
async function getAllUsers() {
    const users = await Users_1.default.find({});
    return users;
}
const getUserFullProfileData = async (userId) => {
    const [userStats, posts, followers, following] = await Promise.all([
        getUserProfile(userId),
        postsService.getAllPosts(userId),
        getUserConnections(userId, "followers"),
        getUserConnections(userId, "following")
    ]);
    return {
        user: userStats,
        posts: posts.posts,
        followers: followers,
        following: following
    };
};
exports.getUserFullProfileData = getUserFullProfileData;
