import { ClientModel } from '../models/Client.js'
import NotificationModel from '../models/Notification.js';
import { UserModel } from '../models/User.js';
import cron from "node-cron";
import { sendEmail } from '../utils/mailer.js';
// إنشاء عميل جديد
export const createClient = async (req, res, next) => {
    try {
        const { assignedTo } = req.body; // جلب ID الموظف المعين له العميل الجديد
        const newClient = new ClientModel(req.body);
        await newClient.save();

        // إرسال إشعار للموظف المسؤول عن العميل الجديد
        if (assignedTo) {
            const seller = await UserModel.findById(assignedTo);
            if (seller) {
                seller.assignedClients.push(newClient._id); // 🟢 إضافة العميل إلى قائمة البائع
                await seller.save(); // ✅ حفظ التعديلات
            }
            const notification = new NotificationModel({
                userId: assignedTo,
                message: `New client assigned:`,
                clientId: newClient._id
            });
            await notification.save();
            req.io.to(assignedTo).emit('newClientNotification', notification);

            // const seller = await UserModel.findById(assignedTo);
            if (seller && seller.email) {
                // ✅ **إضافة تأخير لمدة دقيقة قبل جدولة البريد الإلكتروني**
                scheduleInactivityEmail(seller.realemail, newClient, newClient.createdAt, req.io);
                // setTimeout(() => {
                // }, 60 * 1000); // تأخير لمدة دقيقة
            }
        }
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// تحديث بيانات عميل
export const updateClient = async (req, res) => {
    try {
        const { status, callBackDate, assignedTo, meetingDate } = req.body;
        const currentUser = req.user;

        const updatedClient = await ClientModel.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdated: Date.now() },
            { new: true }
        );

        if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

        // 🔹 جلب ID الأدمن من قاعدة البيانات
        const admin = await UserModel.findOne({ role: "admin" });

        // 🟢 إذا كان البائع هو من قام بالتعديل، يتم إرسال إشعار إلى الأدمن فقط
        if (currentUser.role === 'sales') {
            const adminNotification = new NotificationModel({
                userId: admin._id,
                message: `Client ${updatedClient.firstName} ${updatedClient.lastName} has been updated by ${currentUser.name}.`,
                clientId: updatedClient._id
            });
            await adminNotification.save();
            req.io.to(admin._id.toString()).emit('newActionNotification', adminNotification);
            // ✅ إذا تم تحديد callBackDate، جدولة الإيميل للبائع
            if (status === "Follow Up" && callBackDate) {
                const seller = await UserModel.findById(currentUser.id);
                if (seller && seller.email) {
                    scheduleEmail(seller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
                }
            }
            // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
            if (meetingDate) {
                const seller = await UserModel.findById(currentUser.id);
                if (seller && seller.email) {
                    scheduleEmail(seller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
                }
            }
        }

        // 🟢 إذا كان الأدمن هو من قام بالتعديل، يتم تنفيذ شرط `if (assignedTo)`
        if (currentUser.role === 'admin' && assignedTo) {
            const notification = new NotificationModel({
                userId: assignedTo._id,
                message: `New client assigned by Admin: ${updatedClient._id}`,
                clientId: updatedClient._id
            });
            await notification.save();
            req.io.to(assignedTo._id).emit('newClientNotification', notification);
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//عرض  كل العملا
export const getAllClients = async (req, res) => {
    try {
        // الحصول على الفلاتر من query parameters
        const { status } = req.query;

        // إنشاء شرط البحث
        const query = {};
        if (status) {
            query.status = status; // إذا كان هناك فلتر لحالة معينة
        }

        // جلب العملاء بناءً على الشرط
        const clients = await ClientModel.find(query).populate('assignedTo');

        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// عرض عميل معين
export const getClientById = async (req, res) => {
    // console.log(req.params.id)
    try {
        const client = await ClientModel.findById(req.params.id).populate('assignedTo');
        // console.log(client)
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;
        // البحث عن العميل قبل حذفه لمعرفة البائع المعين له
        const client = await ClientModel.findById(clientId);
        if (!client) return res.status(404).json({ message: 'Client not found' });
        // حذف العميل من قاعدة البيانات
        await ClientModel.findByIdAndDelete(clientId);
        // إزالة العميل من قائمة assignedClients للبائع
        if (client.assignedTo) {
            await UserModel.findByIdAndUpdate(
                client.assignedTo,
                { $pull: { assignedClients: clientId } } // إزالة الـ clientId من القائمة
            );
        }
        res.status(200).json({ message: 'Client deleted successfully and removed from assigned seller' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ✅ دالة جدولة الإيميل باستخدام node-cron
const scheduleEmail = (realemail, client, date, subject) => {
    const scheduledDate = new Date(date);
    const cronTime = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;

    // console.log(`⏳ تم جدولة إيميل للبائع (${realemail}) في ${date} - الموضوع: ${subject}`);

    cron.schedule(cronTime, async () => {
        const message = `Reminder: You have a scheduled event for client ${client.firstName} ${client.lastName}. Please check your CRM system.`;
        await sendEmail(realemail, subject, message);
        console.log(`✅ تم إرسال الإيميل للبائع (${realemail}) بخصوص: ${subject}.`);
    });
};

const scheduleInactivityEmail = async (email, client, transferTime, io) => {
    const warningTime = new Date();
    warningTime.setHours(warningTime.getHours() + 24); // إرسال الإيميل بعد 24 ساعة
    // warningTime.setMinutes(warningTime.getMinutes() + 1); // بعد دقيقة واحدة
    const cronWarningTime = `${warningTime.getMinutes()} ${warningTime.getHours()} ${warningTime.getDate()} ${warningTime.getMonth() + 1} *`;

    console.log(`⏳ تم جدولة تحذير للبائع (${email}) بخصوص العميل (${client._id}) في ${warningTime}`);

    cron.schedule(cronWarningTime, async () => {
        const latestClient = await ClientModel.findById(client._id);
        if (latestClient) {
            if (!latestClient.lastUpdated || new Date(latestClient.lastUpdated) <= transferTime) {
                const message = `⚠️ Warning: You haven't updated client ${client.firstName} ${client.lastName}. 
                If no action is taken in the next 24 hours, the client will be reassigned.`;
                await sendEmail(email, "Client Inactivity Warning", message);
                console.log(`✅ تم إرسال إيميل تحذير للبائع (${email}) بشأن عدم تحديث العميل.`);
            } else {
                console.log(`✅ تم إلغاء الإيميل للبائع (${email}) لأنه قام بالتعديل.`);
            }
        }
    });

    // ✅ **جدولة النقل بعد 48 ساعة**
    const transferTimeLimit = new Date(transferTime);
    transferTimeLimit.setHours(transferTimeLimit.getHours() + 48); // نقل العميل بعد 48 ساعة
    // transferTimeLimit.setMinutes(transferTimeLimit.getMinutes() + 2); // بعد دقيقة واحدة

    const cronTransferTime = `${transferTimeLimit.getMinutes()} ${transferTimeLimit.getHours()} ${transferTimeLimit.getDate()} ${transferTimeLimit.getMonth() + 1} *`;

    console.log(`⏳ تم جدولة نقل العميل (${client._id}) بعد 48 ساعة (${transferTimeLimit})`);

    cron.schedule(cronTransferTime, async () => {
        const latestClient = await ClientModel.findById(client._id);
        if (latestClient) {
            if (!latestClient.lastUpdated || new Date(latestClient.lastUpdated) <= transferTime) {
                await transferClientToNextSeller(latestClient, io);
            } else {
                console.log(`✅ تم إلغاء نقل العميل (${client._id}) لأنه تم التعديل عليه.`);
            }
        }
    });
};

const transferClientToNextSeller = async (client, io) => {
    const latestClient = await ClientModel.findById(client._id);
    if (!latestClient) return;

    const currentSellerId = latestClient.assignedTo;
    const allSellers = await UserModel.find({ role: 'sales' });

    const currentIndex = allSellers.findIndex(seller => seller._id.toString() === currentSellerId.toString());

    if (currentIndex + 1 < allSellers.length) {
        const nextSeller = allSellers[currentIndex + 1];

        const transferTime = new Date(); // ✅ حفظ وقت النقل
        // ✅ **إزالة العميل من البائع الحالي**
        const currentSeller = await UserModel.findById(currentSellerId);
        if (currentSeller) {
            currentSeller.assignedClients = currentSeller.assignedClients.filter(
                (id) => id.toString() !== latestClient._id.toString()
            );
            await currentSeller.save();
            console.log(`❌ تم إزالة العميل (${latestClient._id}) من ${currentSeller.realemail}`);
        }

        // ✅ **إضافة العميل إلى البائع الجديد**
        nextSeller.assignedClients.push(latestClient._id);
        await nextSeller.save();

        latestClient.assignedTo = nextSeller._id.toString();
        await latestClient.save();

        console.log(`✅ تم نقل العميل (${latestClient._id}) إلى البائع الجديد (${nextSeller.realemail})`);

        // إرسال إشعار للبائع الجديد
        const notification = new NotificationModel({
            userId: nextSeller._id.toString(),
            message: `New client assigned to you: ${latestClient._id}`,
            clientId: latestClient._id
        });
        await notification.save();
        // ✅ إعادة تشغيل `scheduleInactivityEmail` للبائع الجديد
        scheduleInactivityEmail(nextSeller.realemail, latestClient, transferTime);
        // console.log(nextSeller._id.toString())
        io.to(nextSeller._id.toString()).emit('newClientNotification', notification);
        // console.log(nextSeller._id.toString())
    } else {
        console.log(`❌ لا يوجد بائع آخر لنقل العميل إليه.`);
    }
};