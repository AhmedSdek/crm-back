import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
export const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // جاي من الـ JWT أو الجلسة
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        next();
    };
};
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // استخدم التوكن المرسل من الفرونت
    // console.log(token)
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // تخزين بيانات المستخدم في الطلب
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// التحقق من التوكن
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// التحقق من أن المستخدم هو بائع
export const verifySeller = async (req, res, next) => {
    // console.log(req.user)
    try {
        const user = await UserModel.findById(req.user.id);
        // console.log(user)
        if (user.role !== 'sales') {
            return res.status(403).json({ message: 'Access forbidden: Not a seller' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};