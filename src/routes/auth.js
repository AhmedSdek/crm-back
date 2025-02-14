import express from 'express';
import bcrypt from 'bcrypt'
import { UserModel } from '../models/User.js';
import jwt from 'jsonwebtoken'
import 'dotenv/config';
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // التحقق من البيانات
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        // تشفير الباسورد
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم
        const newUser = new UserModel({
            name,
            email,
            realemail: email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(password)

    try {
        const user = await UserModel.findOne({ email });
        // console.log(user.password)
        if (!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name }, // إضافة ID و Role للمستخدم
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});
export default router;