import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true, unique: true },
    whatsapp: { type: String },
    developer: { type: String },
    project: { type: String },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leadSource: { type: String },
    description: { type: String },
    meetingDate: { type: Date },
    isBuyer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedTime: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }, // ✅ وقت آخر تعديل
    status: { type: String, default: 'New Lead' }, // مهتم أو غير مهتم
    salesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sales' }, // لربط العميل بـ Sales
    feedback: { // الفيدباك الذي يقدمه البائع بعد التعامل مع العميل
        feedbackText: { type: String },
        feedbackDate: { type: Date, default: Date.now },
    },
    callBackDate: { type: Date },
    attendDate: { type: Date },
    warningEmailSent: { type: Boolean },
});


export const ClientModel = mongoose.model('Client', ClientSchema);