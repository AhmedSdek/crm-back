import express from 'express';
import { UserModel } from '../models/User.js';
import { authenticate } from '../Middleware/Middleware.js';
import bcrypt from 'bcrypt'
const router = express.Router();

// عرض جميع العملاء
router.get('/', async (req, res) => {
    try {
        const users = await UserModel.find().populate('assignedClients');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // 🔹 جلب الـ ID من الباراميتر
        const user = await UserModel.findById(id).populate("assignedClients"); // ✅ البحث عن المستخدم بالـ ID
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // 🛑 إذا لم يتم العثور على المستخدم
        }
        res.status(200).json(user); // ✅ إرجاع بيانات المستخدم
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // جلب الـ ID من الباراميتر
        const updateData = req.body; // جلب البيانات الجديدة من الجسم (req.body)

        const user = await UserModel.findById(id); // البحث عن المستخدم بالـ ID
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تحديث كلمة المرور إذا كانت موجودة
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10); // إنشاء "Salt" لتشفير كلمة المرور
            updateData.password = await bcrypt.hash(updateData.password, salt); // تشفير كلمة المرور
        }

        // تحديث باقي البيانات
        Object.keys(updateData).forEach(key => {
            user[key] = updateData[key];
        });
        await user.save(); // حفظ التعديلات في قاعدة البيانات
        res.status(200).json(user); // إرجاع بيانات المستخدم بعد التحديث
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;