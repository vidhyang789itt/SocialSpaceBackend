"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path_1.default.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|webm|ogg|mov|avi|mkv/;
    const extname = allowedImageTypes.test(path_1.default.extname(file.originalname).toLowerCase())
        ? "image"
        : allowedVideoTypes.test(path_1.default.extname(file.originalname).toLowerCase())
            ? "video"
            : null;
    const mimetype = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
            ? "video"
            : null;
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        return cb(new Error("Only image and video files are allowed"), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});
