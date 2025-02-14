import NotificationModel from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await NotificationModel.find({ userId })
            .populate('clientId') // جلب بيانات العميل بالكامل
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تحديث حالة الإشعار إلى "مقروء"
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};