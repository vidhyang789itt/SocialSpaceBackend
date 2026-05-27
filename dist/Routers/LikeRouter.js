"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LikeController_1 = require("../Controllers/LikeController");
const router = express_1.default.Router();
router.post("/:postId", LikeController_1.likePost);
router.delete("/:postId", LikeController_1.unlikePost);
router.get("/:postId", LikeController_1.getLikes);
exports.default = router;
