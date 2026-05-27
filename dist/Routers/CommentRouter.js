"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CommentController_1 = require("../Controllers/CommentController");
const authorizationCommentMidlleware_1 = require("../Middlewares/authorizationCommentMidlleware");
const router = express_1.default.Router();
router.post("/:postId", CommentController_1.CreateComment);
router.get("/post/comments/:postId", CommentController_1.getAllPostComments);
router.get("/user/comments", CommentController_1.getAllUserComments);
router.put("/:commentId", authorizationCommentMidlleware_1.checkOwnership, CommentController_1.editComment);
router.delete("/:commentId", authorizationCommentMidlleware_1.checkOwnership, CommentController_1.deleteComment);
exports.default = router;
