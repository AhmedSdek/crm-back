import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['قيد التنفيذ', 'مكتملة', 'ملغاة'],
        default: 'قيد التنفيذ',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // مرجع لجدول المستخدمين 
        required: false
    },
    dueDate: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
});
export const TaskModel = mongoose.model('Task', taskSchema);
