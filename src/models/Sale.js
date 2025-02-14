import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'], // تأكد من وجود هذا الحقل
    },
    saleDate: {
        type: Date,
        required: [true, 'Sale date is required'], // تأكد من وجود هذا الحقل
    },
    client: {
        type: mongoose.Schema.Types.ObjectId, // مرجع لعميل
        ref: 'Client',
        required: [true, 'Client is required'], // تأكد من وجود هذا الحقل
    },
    property: {
        type: mongoose.Schema.Types.ObjectId, // مرجع لعقار
        ref: 'Property',
        required: [true, 'Property is required'], // تأكد من وجود هذا الحقل
    },
    status: {
        type: String,
        enum: ['جارٍ', 'مكتمل', 'ملغى'], // تأكد أن هذه القيم موجودة
        default: 'جارٍ',
    },
});
export const SaleModel = mongoose.model('Sale', saleSchema);
