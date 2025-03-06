import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    realemail: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'sales'], required: true, default: 'sales' },
    assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }] // العملاء المنسوبين للموظف
});


export const UserModel = mongoose.model('User', userSchema);
