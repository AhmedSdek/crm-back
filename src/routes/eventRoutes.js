import express from 'express';
import { EventModel } from '../models/Event.js';
import nodemailer from "nodemailer";
import cron from 'node-cron'
const router = express.Router();


// إضافة حدث جديد
router.post("/", async (req, res) => {
    try {
        const event = new EventModel(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// جلب جميع الأحداث
router.get("/", async (req, res) => {
    try {
        const events = await EventModel.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// إعداد البريد الإلكتروني
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// وظيفة للتحقق من الأحداث القادمة وإرسال الإيميلات
cron.schedule("* * * * *", async () => {
    const now = new Date();
    const events = await EventModel.find();

    events.forEach((event) => {
        const eventTime = new Date(event.start);
        if (
            eventTime.getFullYear() === now.getFullYear() &&
            eventTime.getMonth() === now.getMonth() &&
            eventTime.getDate() === now.getDate() &&
            eventTime.getHours() === now.getHours() &&
            eventTime.getMinutes() === now.getMinutes()
        ) {
            // إرسال إيميل تنبيه
            transporter.sendMail(
                {
                    from: process.env.EMAIL,
                    to: process.env.EMAIL,
                    subject: `Reminder: ${event.title}`,
                    text: `Don't forget your event "${event.title}" at ${event.start}`,
                },
                (error, info) => {
                    if (error) console.log("Error sending email:", error);
                    else console.log("Email sent:", info.response);
                }
            );
        }
    });
});
export default router;
