import express from 'express'
import { createSale, deleteSale, getAllSales, getSaleById, updateSaleStatus } from '../controllers/saleController.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'
import { UserModel } from '../models/User.js';
const router = express.Router();


// router.post('/', createSale);

// router.get('/', getAllSales);

// router.get('/:id', getSaleById);

// router.put('/:id', updateSaleStatus);

// router.delete('/:id', deleteSale);


// إعداد الـ transporter لإرسال الإيميلات
const transporter = nodemailer.createTransport({
    service: 'gmail', // استخدم خدمة بريد مثل Gmail
    auth: {
        user: process.env.EMAIL, // بريد الأدمن (يجب وضعه في ملف .env)
        pass: process.env.EMAIL_PASSWORD, // كلمة المرور أو App Password
    },
});

// Route لإنشاء حساب سيلز
// router.post('/create-sales', async (req, res) => {
//     const { name, email, phone } = req.body;
//     try {
//         // إنشاء الإيميل تلقائيًا
//         const generatemail = `${name.replace(/\s+/g, '.').toLowerCase()}@maverick.com`;
//         // التحقق إذا كان الإيميل موجودًا بالفعل
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'الإيميل الخاص بهذا المستخدم موجود مسبقًا.' });
//         }
//         // إنشاء كلمة مرور عشوائية
//         const password = Math.random().toString(36).slice(-8); // كلمة مرور عشوائية من 8 حروف
//         const hashedPassword = await bcrypt.hash(password, 10);
//         // إنشاء المستخدم الجديد
//         const newUser = new UserModel({
//             name,
//             email: generatemail,
//             phone: phone,
//             password: hashedPassword,
//             realemail: email,
//             role: 'sales', // تحديد الدور كـ سيلز
//         });
//         await newUser.save();
//         // إعداد رسالة الإيميل
//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'حساب جديد في شركة Maverick',
//             text: `مرحبًا ${name},\n\nتم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول باستخدام البيانات التالية:\n\nالبريد الإلكتروني: ${generatemail}\nكلمة المرور: ${password}\n\nيرجى تغيير كلمة المرور بعد تسجيل الدخول.\n\nشكرًا!`,
//         };
//         // إرسال الإيميل
//         await transporter.sendMail(mailOptions);
//         res.status(201).json({
//             message: 'تم إنشاء حساب السيلز بنجاح وتم إرسال الإيميل.',
//             email: generatemail,
//             password, // فقط أثناء التطوير
//         });
//         // res.status(201).json({ message: 'تم إنشاء حساب السيلز بنجاح وتم إرسال الإيميل.' });
//     } catch (error) {
//         console.error('Error creating sales account:', error.message);
//         res.status(500).json({ message: 'حدث خطأ أثناء إنشاء حساب السيلز.', error: error.message });
//     }
// });
router.post('/create-sales', async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        // التحقق مما إذا كان الإيميل أو رقم الهاتف مسجلين مسبقًا
        const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            return res.status(400).json({ message: 'الإيميل أو رقم الهاتف مسجل بالفعل.' });
        }

        // إنشاء إيميل فريد تلقائيًا
        let generatemail = `${name.replace(/\s+/g, '.').toLowerCase()}@maverick.com`;

        // التحقق مما إذا كان الإيميل الجديد موجودًا بالفعل
        let emailExists = await UserModel.findOne({ email: generatemail });

        if (emailExists) {
            const randomNumber = Math.floor(1000 + Math.random() * 900000); // رقم عشوائي 4 أرقام
            generatemail = `${name.replace(/\s+/g, '.').toLowerCase()}${randomNumber}@maverick.com`;
        }

        // إنشاء كلمة مرور عشوائية
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم الجديد
        const newUser = new UserModel({
            name,
            email: generatemail,
            phone,
            password: hashedPassword,
            realemail: email,
            role: 'sales',
        });

        await newUser.save();

        // إعداد رسالة الإيميل
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'حساب جديد في شركة Maverick',
            text: `مرحبًا ${name},\n\nتم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول باستخدام البيانات التالية:\n\nالبريد الإلكتروني: ${generatemail}\nكلمة المرور: ${password}\n\nيرجى تغيير كلمة المرور بعد تسجيل الدخول.\n\nشكرًا!`,
        };

        // إرسال الإيميل
        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'تم إنشاء حساب السيلز بنجاح وتم إرسال الإيميل.',
            email: generatemail,
            password, // فقط أثناء التطوير
        });

    } catch (error) {
        console.error('Error creating sales account:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء إنشاء حساب السيلز.', error: error.message });
    }
});


export default router;