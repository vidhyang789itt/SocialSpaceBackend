import express from "express";
import {
  followUser,
  unfollowUser,
  getConnections,
} from "../Controllers/socialFollowingController";

const router = express.Router();

router.post("/follow/:userId", followUser);
router.delete("/follow/:userId", unfollowUser);
router.get("/connections/:userId/:type", getConnections);

export default router;
