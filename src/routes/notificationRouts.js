import express from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationCont.js';

const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/mark-as-read/:notificationId', markNotificationAsRead);

export default router;