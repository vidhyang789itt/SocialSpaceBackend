import express from "express";
import { upload } from "../Middlewares/PostsFileUploadMiddleware";
import {
  getProfile,
  updatePassword,
  updateProfile,
  getUserConnections,
  getSpecificUserProfile,
  addProfileImage,
  getAllUsers,
} from "../Controllers/UserController";

const router = express.Router();

router.get("/", getProfile);
router.put("/", updatePassword);
router.put("/password", updateProfile);
router.get("/users/:type", getUserConnections);
router.get("/user/:id", getSpecificUserProfile);
router.put("/image", upload.single("profilePic"), addProfileImage);
router.get("/users", getAllUsers);

export default router;
