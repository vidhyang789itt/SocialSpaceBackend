"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostsFileUploadMiddleware_1 = require("../Middlewares/PostsFileUploadMiddleware");
const UserController_1 = require("../Controllers/UserController");
const router = express_1.default.Router();
router.get("/", UserController_1.getProfile);
router.put("/", UserController_1.updatePassword);
router.put("/password", UserController_1.updateProfile);
router.get("/users/:type", UserController_1.getUserConnections);
router.get("/user/:id", UserController_1.getSpecificUserProfile);
router.put("/image", PostsFileUploadMiddleware_1.upload.single("profilePic"), UserController_1.addProfileImage);
router.get("/users", UserController_1.getAllUsers);
exports.default = router;
