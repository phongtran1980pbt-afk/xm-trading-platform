import express from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getNotifications);
router.post('/:userId/read', markNotificationsAsRead);

export default router;
