"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NotificationController_1 = require("../Controllers/NotificationController");
const router = express_1.default.Router();
router.get('/', NotificationController_1.getAllNotification);
router.patch('/mark-read', NotificationController_1.markAsRead);
router.put('/:notificationId/read', NotificationController_1.markNotificationRead);
exports.default = router;
