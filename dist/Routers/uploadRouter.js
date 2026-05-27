"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostsFileUploadMiddleware_1 = require("../Middlewares/PostsFileUploadMiddleware");
const uploadController_1 = require("../Controllers/uploadController");
const router = express_1.default.Router();
router.post("/", PostsFileUploadMiddleware_1.upload.single("file"), uploadController_1.uploadFile);
router.post("/upload-multiple", PostsFileUploadMiddleware_1.upload.array("files", 10), uploadController_1.uploadMultipleFiles);
exports.default = router;
