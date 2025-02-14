import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
    name: { type: String, required: true }, // اسم العقار
    price: { type: Number, required: true }, // السعر
    description: { type: String }, // وصف العقار
    createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
    address: { type: String, required: true },
    status: {
        type: String,
        enum: ['متاح', 'تم البيع', 'تحت العرض'],
        default: 'متاح'
    },
});

export const PropertyModel = mongoose.model('Property', PropertySchema);
