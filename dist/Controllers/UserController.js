"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
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
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updatePassword = updatePassword;
exports.getUserConnections = getUserConnections;
exports.getSpecificUserProfile = getSpecificUserProfile;
exports.addProfileImage = addProfileImage;
exports.getAllUsers = getAllUsers;
const userService = __importStar(require("../Services/userService"));
async function getProfile(req, res, next) {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        const user = await userService.getUserProfile(req.user.userId);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateProfile(req, res, next) {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        const updatedUser = await userService.updateUserProfile(req.user.userId, req.body);
        res.status(200).json({
            success: true,
            data: updatedUser,
        });
    }
    catch (err) {
        next(err);
    }
}
async function updatePassword(req, res, next) {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        const { currentPassword, newPassword } = req.body;
        await userService.updatePassword(req.user.userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getUserConnections(req, res, next) {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        const { type } = req.params;
        if (!type || !["followers", "following"].includes(type)) {
            const error = new Error("Invalid connection type");
            error.statusCode = 400;
            return next(error);
        }
        const users = await userService.getUserConnections(req.user.userId, type);
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getSpecificUserProfile(req, res, next) {
    try {
        const { id } = req.params;
        if (!id) {
            const error = new Error("User ID is required");
            error.statusCode = 400;
            return next(error);
        }
        const user = await userService.getUserProfile(id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
}
async function addProfileImage(req, res, next) {
    try {
        if (!req.user)
            throw new Error("Unauthorized");
        if (!req.file) {
            const error = new Error("No file uploaded");
            error.statusCode = 400;
            return next(error);
        }
        const imagePath = `../uploads/${req.file.filename}`;
        const user = await userService.updateProfilePhoto(req.user.userId, imagePath);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAllUsers(_req, res, next) {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getFullUserProfile(req, res, next) {
    try {
        const userId = req.params.id ?? req.user?.userId;
        if (!userId) {
            const error = new Error("User ID is required");
            error.statusCode = 400;
            return next(error);
        }
        const profileData = await userService.getUserFullProfileData(userId);
        res.status(200).json({
            success: true,
            data: profileData,
        });
    }
    catch (err) {
        next(err);
    }
}
