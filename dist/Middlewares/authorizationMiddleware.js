"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = void 0;
const Posts_1 = __importDefault(require("../Models/Posts"));
const Users_1 = __importDefault(require("../Models/Users"));
const checkOwnership = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(404).json({ message: "unauthenticated" });
        const resourceId = req.params.id;
        const userId = req.user.userId;
        const resource = await Posts_1.default.findOne({ postId: resourceId });
        const user = await Users_1.default.findOne({ userId });
        if (!resource || !user) {
            return res.status(404).json({ message: "Resource not found" });
        }
        const isOwner = resource.author.toString() === user._id.toString();
        if (!isOwner) {
            return res.status(403).json({
                message: "Access denied: You do not own this resource.",
            });
        }
        req.resource = resource;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Authorization check failed", error });
    }
};
exports.checkOwnership = checkOwnership;
