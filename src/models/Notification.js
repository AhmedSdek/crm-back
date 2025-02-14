import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // الموظف المستلم
    message: { type: String, required: true }, // نص الإشعار
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: false }, // إذا كان متعلقًا بعميل
    isRead: { type: Boolean, default: false }, // حالة القراءة
    createdAt: { type: Date, default: Date.now } // تاريخ الإضافة
});

const NotificationModel = mongoose.model('Notification', notificationSchema);
export default NotificationModel;