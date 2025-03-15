import { ClientModel } from '../models/Client.js'
import NotificationModel from '../models/Notification.js';
import { UserModel } from '../models/User.js';
import cron from "node-cron";
import { sendEmail } from '../utils/mailer.js';
import dayjs from 'dayjs';

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
            // if (seller && seller.email) {
            //     scheduleInactivityCheck(req.io);
            //     // scheduleInactivityEmail(seller.realemail, newClient, newClient.createdAt, req.io);
            //     // // setTimeout(() => {
            //     // // }, 60 * 1000); // تأخير لمدة دقيقة
            // }
        }
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// تحديث بيانات عميل
// export const updateClient = async (req, res) => {
//     try {
//         const { status, callBackDate, assignedTo, meetingDate } = req.body;
//         const currentUser = req.user;

//         const updatedClient = await ClientModel.findByIdAndUpdate(
//             req.params.id,
//             { ...req.body, lastUpdated: Date.now() },
//             { new: true }
//         );

//         if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

//         // 🔹 جلب ID الأدمن من قاعدة البيانات
//         const admin = await UserModel.findOne({ role: "admin" });

//         // 🟢 إذا كان البائع هو من قام بالتعديل، يتم إرسال إشعار إلى الأدمن فقط
//         if (currentUser.role === 'sales') {
//             const adminNotification = new NotificationModel({
//                 userId: admin._id,
//                 message: `Client ${updatedClient.firstName} ${updatedClient.lastName} has been updated by ${currentUser.name}.`,
//                 clientId: updatedClient._id
//             });
//             await adminNotification.save();
//             req.io.to(admin._id.toString()).emit('newActionNotification', adminNotification);
//             // ✅ إذا تم تحديد callBackDate، جدولة الإيميل للبائع
//             if (status === "Follow Up" && callBackDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
//                 }
//             }
//             // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
//             if (meetingDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
//                 }
//             }
//         }

//         // 🟢 إذا كان الأدمن هو من قام بالتعديل، يتم تنفيذ شرط `if (assignedTo)`
//         if (currentUser.role === 'admin' && assignedTo) {
//             const notification = new NotificationModel({
//                 userId: assignedTo._id,
//                 message: `New client assigned by Admin: ${updatedClient._id}`,
//                 clientId: updatedClient._id
//             });
//             await notification.save();

//             req.io.to(assignedTo._id).emit('newClientNotification', notification);
//         }

//         res.status(200).json(updatedClient);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// export const updateClient = async (req, res) => {
//     try {
//         const { status, callBackDate, assignedTo, meetingDate } = req.body;
//         const currentUser = req.user;

//         const updatedClient = await ClientModel.findByIdAndUpdate(
//             req.params.id,
//             { ...req.body, lastUpdated: Date.now() },
//             { new: true }
//         );

//         if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

//         // 🔹 جلب ID الأدمن من قاعدة البيانات
//         const admin = await UserModel.findOne({ role: "admin" });

//         // 🟢 إذا كان البائع هو من قام بالتعديل، يتم إرسال إشعار إلى الأدمن فقط
//         if (currentUser.role === 'sales') {
//             const adminNotification = new NotificationModel({
//                 userId: admin._id,
//                 message: `Client ${updatedClient.firstName} ${updatedClient.lastName} has been updated by ${currentUser.name}.`,
//                 clientId: updatedClient._id
//             });
//             await adminNotification.save();
//             req.io.to(admin._id.toString()).emit('newActionNotification', adminNotification);

//             // ✅ إذا تم تحديد callBackDate، جدولة الإيميل للبائع
//             if (status === "Follow Up" && callBackDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
//                 }
//             }
//             // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
//             if (meetingDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
//                 }
//             }
//         }

//         // 🟢 إذا كان الأدمن هو من قام بالتعديل، يتم تنفيذ شرط `if (assignedTo)`
//         if (currentUser.role === 'admin' && assignedTo) {
//             const newSeller = await UserModel.findById(assignedTo); // جلب بيانات البائع الجديد
//             if (!newSeller) {
//                 return res.status(404).json({ message: 'Sales user not found' });
//             }

//             // 🔹 إزالة العميل من قائمة `assignedClients` للبائع القديم
//             const oldSeller = await UserModel.findOne({ assignedClients: updatedClient._id });
//             if (oldSeller) {
//                 oldSeller.assignedClients = oldSeller.assignedClients.filter(
//                     (clientId) => clientId.toString() !== updatedClient._id.toString()
//                 );
//                 await oldSeller.save();
//             }

//             // 🔹 إضافة العميل إلى `assignedClients` للبائع الجديد
//             newSeller.assignedClients.push(updatedClient._id);
//             await newSeller.save();

//             const notification = new NotificationModel({
//                 userId: assignedTo,
//                 message: `New client assigned by Admin: ${updatedClient._id}`,
//                 clientId: updatedClient._id
//             });
//             await notification.save();

//             req.io.to(assignedTo.toString()).emit('newClientNotification', notification);
//         }

//         res.status(200).json(updatedClient);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// export const updateClient = async (req, res) => {
//     try {
//         const { status, callBackDate, assignedTo, meetingDate } = req.body;
//         console.log(req.body)
//         const currentUser = req.user;

//         let updateData = { ...req.body, lastUpdated: Date.now() }; // تحديث `lastUpdated` دائماً

//         // 🟢 إذا كان الأدمن هو من قام بتغيير البائع (`assignedTo`)، يتم تحديث `modifiedTime`
//         if (currentUser.role === 'admin' && assignedTo) {
//             updateData.modifiedTime = Date.now(); // تحديث `modifiedTime` عند تغيير البائع
//         }

//         const updatedClient = await ClientModel.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true }
//         );

//         if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

//         // 🔹 جلب ID الأدمن من قاعدة البيانات
//         const admin = await UserModel.findOne({ role: "admin" });

//         // 🟢 إذا كان البائع هو من قام بالتعديل، يتم إرسال إشعار إلى الأدمن فقط
//         if (currentUser.role === 'sales') {
//             const adminNotification = new NotificationModel({
//                 userId: admin._id,
//                 message: `Client ${updatedClient.firstName} ${updatedClient.lastName} has been updated by ${currentUser.name}.`,
//                 clientId: updatedClient._id
//             });
//             await adminNotification.save();
//             req.io.to(admin._id.toString()).emit('newActionNotification', adminNotification);

//             // ✅ إذا تم تحديد callBackDate، جدولة الإيميل للبائع
//             if (status === "Follow Up" && callBackDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
//                 }
//             }
//             // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
//             if (meetingDate) {
//                 const seller = await UserModel.findById(currentUser.id);
//                 if (seller && seller.email) {
//                     scheduleEmail(seller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
//                 }
//             }
//         }

//         // 🟢 إذا كان الأدمن هو من قام بالتعديل، يتم تنفيذ شرط `if (assignedTo)`
//         if (currentUser.role === 'admin' && assignedTo) {
//             const newSeller = await UserModel.findById(assignedTo); // جلب بيانات البائع الجديد
//             if (!newSeller) {
//                 return res.status(404).json({ message: 'Sales user not found' });
//             }

//             // 🔹 إزالة العميل من قائمة `assignedClients` للبائع القديم
//             const oldSeller = await UserModel.findOne({ assignedClients: updatedClient._id });
//             if (oldSeller) {
//                 oldSeller.assignedClients = oldSeller.assignedClients.filter(
//                     (clientId) => clientId.toString() !== updatedClient._id.toString()
//                 );
//                 await oldSeller.save();
//             }

//             // 🔹 إضافة العميل إلى `assignedClients` للبائع الجديد
//             newSeller.assignedClients.push(updatedClient._id);
//             await newSeller.save();

//             const notification = new NotificationModel({
//                 userId: assignedTo,
//                 message: `New client assigned by Admin: ${updatedClient._id}`,
//                 clientId: updatedClient._id
//             });
//             await notification.save();

//             req.io.to(assignedTo.toString()).emit('newClientNotification', notification);
//         }

//         res.status(200).json(updatedClient);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const updateClient = async (req, res) => {
    try {
        const { status, callBackDate, assignedTo, meetingDate, attendDate } = req.body;
        console.log(req.body)
        const currentUser = req.user;
        console.log(currentUser)

        // 🟢 إعداد بيانات التحديث بناءً على دور المستخدم
        let updateData = { ...req.body };

        // ✅ إذا كان الذي يقوم بالتحديث هو البائع، يتم تحديث `lastUpdated`
        if (currentUser.role === 'sales') {
            updateData.lastUpdated = Date.now();
        }

        // ✅ إذا كان الأدمن هو من قام بتغيير البائع (`assignedTo`)، يتم تحديث `modifiedTime`
        if (currentUser.role === 'admin' && assignedTo) {
            updateData.modifiedTime = Date.now();
        }

        const updatedClient = await ClientModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // console.log(updatedClient)
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
            if (callBackDate) {
                const seller = await UserModel.findById(currentUser.id);
                if (seller && seller.realemail) {
                    scheduleEmail(seller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
                }
            }
            // ✅ إذا تم تحديد attendDate جدولة الإيميل للبائع
            if (attendDate) {
                const seller = await UserModel.findById(currentUser.id);
                if (seller && seller.realemail) {
                    scheduleEmail(seller.realemail, updatedClient, attendDate, "Client Attend Visit Reminder");
                }
            }
            // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
            if (meetingDate) {
                const seller = await UserModel.findById(currentUser.id);
                if (seller && seller.realemail) {
                    scheduleEmail(seller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
                }
            }
        }

        // 🟢 إذا كان الأدمن هو من قام بالتعديل، يتم تنفيذ شرط `if (assignedTo)`
        if (currentUser.role === 'admin' && assignedTo) {
            // console.log(callBackDate)
            const newSeller = await UserModel.findById(assignedTo); // جلب بيانات البائع الجديد
            // console.log(newSeller)
            if (!newSeller) {
                return res.status(404).json({ message: 'Sales user not found' });
            }
            // // ✅ إذا تم تحديد callBackDate، جدولة الإيميل للبائع
            // if (callBackDate) {
            //     // console.log(callBackDate)
            //     // const seller = await UserModel.findById(currentUser.id);
            //     if (newSeller && newSeller.realemail) {
            //         scheduleEmail(newSeller.realemail, updatedClient, callBackDate, "Client Follow-Up Reminder");
            //     }
            // }
            // // ✅ إذا تم تحديد attendDate جدولة الإيميل للبائع
            // if (attendDate) {
            //     // const seller = await UserModel.findById(currentUser.id);
            //     if (newSeller && newSeller.realemail) {
            //         scheduleEmail(newSeller.realemail, updatedClient, attendDate, "Client Attend Visit Reminder");
            //     }
            // }
            // // ✅ إذا تم تحديد meetingDate، جدولة إيميل للبائع
            // if (meetingDate) {
            //     // const seller = await UserModel.findById(currentUser.id);
            //     if (newSeller && newSeller.realemail) {
            //         scheduleEmail(newSeller.realemail, updatedClient, meetingDate, "Client Meeting Reminder");
            //     }
            // }



            // 🔹 إزالة العميل من قائمة `assignedClients` للبائع القديم
            const oldSeller = await UserModel.findOne({ assignedClients: updatedClient._id });
            // console.log(oldSeller)
            if (oldSeller) {
                oldSeller.assignedClients = oldSeller.assignedClients.filter(
                    (clientId) => clientId.toString() !== updatedClient._id.toString()
                );
                await oldSeller.save();
            }

            // 🔹 إضافة العميل إلى `assignedClients` للبائع الجديد
            newSeller.assignedClients.push(updatedClient._id);
            await newSeller.save();

            const notification = new NotificationModel({
                userId: assignedTo,
                message: `New client assigned by Admin: ${updatedClient._id}`,
                clientId: updatedClient._id
            });
            await notification.save();

            req.io.to(assignedTo.toString()).emit('newClientNotification', notification);
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
// ✅ دالة جدولة الإيميل باستخدام node-cron meetingDate
const scheduleEmail = (realemail, client, date, subject) => {
    const scheduledDate = new Date(date);
    const cronTime = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;

    console.log(`⏳ تم جدولة إيميل للبائع (${realemail}) في ${date} - الموضوع: ${subject}`);

    cron.schedule(cronTime, async () => {
        const message = `Reminder: You have a scheduled event for client ${client.firstName} ${client.lastName} : ${date}. Please check your CRM system.`;
        await sendEmail(realemail, subject, message);
        console.log(`✅ تم إرسال الإيميل للبائع (${realemail}) بخصوص: ${subject}.`);
    });
};

export const scheduleInactivityCheck = async (io) => {
    cron.schedule('* * * * *', async () => { // تشغيل كل دقيقة
        try {
            // console.log('🔍 Checking client updates...');
            const clients = await ClientModel.find({});

            for (const client of clients) {
                try {
                    const assignedSeller = await UserModel.findById(client.assignedTo);
                    if (!assignedSeller) continue;

                    const modifiedTime = dayjs(client.modifiedTime);
                    const lastUpdated = client.lastUpdated ? dayjs(client.lastUpdated) : null;

                    // ✅ إذا كان lastUpdated متأخراً عن modifiedTime ولو بثانية واحدة، يتم إلغاء الجدولة تمامًا
                    if (lastUpdated && lastUpdated.diff(modifiedTime, 'second') > 0) {
                        console.log(`✅ Client ${client._id} was updated after modifiedTime. Skipping all actions.`);
                        continue;
                    }

                    const now = dayjs();
                    const timeSinceUpdated = now.diff(modifiedTime, 'hour', true);
                    // console.log(timeSinceUpdated);

                    // ✅ إرسال الإيميل مرة واحدة فقط، إذا لم يتم إرساله من قبل
                    if (timeSinceUpdated >= 24 && !client.warningEmailSent) {
                        await sendEmail(
                            assignedSeller.realemail,
                            'Client Inactivity Warning',
                            `⚠️ Warning: You haven't updated client ${client.firstName} ${client.lastName}.
                            If no action is taken in the next 24 hours, the client will be reassigned.`
                        );
                        console.log(`📧 Sent warning email to seller (${assignedSeller.realemail}) for client ${client._id}`);

                        // ✅ تحديث العميل في قاعدة البيانات ليتم تسجيل أنه تم إرسال الإيميل
                        await ClientModel.findByIdAndUpdate(client._id, { warningEmailSent: true });
                        continue;
                    }

                    // ✅ إذا لم يتم تحديث العميل خلال 48 ساعة، يتم نقله إلى سيلز آخر
                    if (timeSinceUpdated >= 48) {
                        await transferClientToNextSeller(client, io);
                        // ✅ إعادة تعيين `warningEmailSent` إلى `false` عند نقل العميل لبائع جديد
                        await ClientModel.findByIdAndUpdate(client._id, { warningEmailSent: false });
                    }
                } catch (clientError) {
                    console.error(`❌ Error processing client ${client._id}:`, clientError.message);
                }
            }
        } catch (error) {
            console.error('❌ Error in scheduleInactivityCheck:', error.message);
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
        const currentSeller = await UserModel.findById(currentSellerId);

        if (currentSeller) {
            currentSeller.assignedClients = currentSeller.assignedClients.filter(id => id.toString() !== latestClient._id.toString());
            await currentSeller.save();
            console.log(`❌ Removed client (${latestClient._id}) from seller (${currentSeller.realemail})`);
        }

        nextSeller.assignedClients.push(latestClient._id);
        await nextSeller.save();

        latestClient.assignedTo = nextSeller._id.toString();
        latestClient.modifiedTime = new Date();
        await latestClient.save();

        console.log(`✅ Transferred client (${latestClient._id}) to new seller (${nextSeller.realemail})`);

        const notification = new NotificationModel({
            userId: nextSeller._id.toString(),
            message: `New client assigned to you: ${latestClient._id}`,
            clientId: latestClient._id
        });
        await notification.save();

        io.to(nextSeller._id.toString()).emit('newClientNotification', notification);
    } else {
        console.log(`❌ No next seller available for transfer.`);
    }
};