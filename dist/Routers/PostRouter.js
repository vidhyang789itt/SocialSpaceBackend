"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostsFileUploadMiddleware_1 = require("../Middlewares/PostsFileUploadMiddleware");
const PostController_1 = require("../Controllers/PostController");
const authorizationMiddleware_1 = require("../Middlewares/authorizationMiddleware");
const router = express_1.default.Router();
router.get("/feed", PostController_1.getUserFeed);
router.get("/myposts/:userId", PostController_1.getUserAllPost);
router.post("/", PostsFileUploadMiddleware_1.upload.array("media", 10), PostController_1.createPost);
router.put("/:id", authorizationMiddleware_1.checkOwnership, PostController_1.updatePost);
router.delete("/:id", authorizationMiddleware_1.checkOwnership, PostController_1.deletePost);
router.get("/:postId", PostController_1.getPost);
router.put("/:id/media", authorizationMiddleware_1.checkOwnership, PostsFileUploadMiddleware_1.upload.array("media", 10), PostController_1.updatePostMedia);
exports.default = router;
