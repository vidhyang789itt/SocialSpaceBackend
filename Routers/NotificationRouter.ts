import express from 'express';
import { getAllNotification, markAsRead, markNotificationRead } from '../Controllers/NotificationController';

const router = express.Router();

router.get('/', getAllNotification);

router.patch('/mark-read', markAsRead);

router.put('/:notificationId/read', markNotificationRead);

export default router;