import express from "express";
import {
  CreateComment,
  deleteComment,
  editComment,
  getAllPostComments,
  getAllUserComments,
} from "../Controllers/CommentController";
import { checkOwnership } from "../Middlewares/authorizationCommentMidlleware";

const router = express.Router();

router.post("/:postId", CreateComment);
router.get("/post/comments/:postId", getAllPostComments);
router.get("/user/comments", getAllUserComments);
router.put("/:commentId", checkOwnership, editComment);
router.delete("/:commentId", checkOwnership, deleteComment);

export default router;
