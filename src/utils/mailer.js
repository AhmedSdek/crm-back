import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // يمكنك استخدام أي خدمة بريد أخرى
            auth: {
                user: process.env.EMAIL, // بريد المرسل
                pass: process.env.EMAIL_PASSWORD, // كلمة المرور أو App Password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 تم إرسال الإيميل إلى: ${to}`);
    } catch (error) {
        console.error("❌ فشل إرسال الإيميل:", error);
    }
};

