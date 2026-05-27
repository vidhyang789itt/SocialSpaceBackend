import express from "express";
import { upload } from "../Middlewares/PostsFileUploadMiddleware";
import {
  getUserFeed,
  createPost,
  updatePost,
  deletePost,
  getPost,
  updatePostMedia,
  getUserAllPost,
} from "../Controllers/PostController";
import { checkOwnership } from "../Middlewares/authorizationMiddleware";

const router = express.Router();

router.get("/feed", getUserFeed);
router.get("/myposts/:userId", getUserAllPost);

router.post("/", upload.array("media", 10), createPost);

router.put("/:id", checkOwnership, updatePost);

router.delete("/:id", checkOwnership, deletePost);

router.get("/:postId", getPost);

router.put(
  "/:id/media",
  checkOwnership,
  upload.array("media", 10),
  updatePostMedia,
);

export default router;