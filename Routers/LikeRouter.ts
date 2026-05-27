import express from "express";
import {
  getLikes,
  likePost,
  unlikePost,
} from "../Controllers/LikeController";

const router = express.Router();

router.post("/:postId", likePost);
router.delete("/:postId", unlikePost);
router.get("/:postId", getLikes);

export default router;
