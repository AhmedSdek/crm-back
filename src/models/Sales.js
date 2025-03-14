// import mongoose from "mongoose";

// const SalesSchema = new mongoose.Schema({
//     clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // ربط العميل
//     assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // البائع المسؤول
//     saleStatus: { type: String, enum: ['completed', 'pending'], default: 'pending' }, // حالة البيع
//     outcome: { type: String, enum: ['interested', 'not-interested'], required: true }, // نتائج العميل (مهتم أو غير مهتم)
//     feedback: { type: String }, // الفيدباك الذي يقدمه البائع
//     saleDate: { type: Date, default: Date.now }, // تاريخ البيع
// });


// export const SalesModel = mongoose.model('Sales', SalesSchema);