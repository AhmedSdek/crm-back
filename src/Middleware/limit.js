import rateLimit from 'express-rate-limit'
// تحديد الحد الأقصى لمحاولات تسجيل الدخول (5 محاولات خلال 15 دقيقة)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // أقصى عدد للمحاولات
    message: { error: 'Too many login attempts, please try again later.' },
    standardHeaders: true, // إرجاع الهيدر المعياري
    legacyHeaders: false, // إلغاء الهيدر القديم
});

export default loginLimiter;