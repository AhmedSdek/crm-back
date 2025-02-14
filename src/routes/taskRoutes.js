import express from 'express';
import { TaskModel } from '../models/Task.js';
const router = express.Router();


// إنشاء مهمة جديدة
router.post('/', async (req, res) => {
    try {
        const newTask = new TaskModel(req.body);
        const savedTask = await newTask.save();

        // إرسال إشعار للمستخدم
        if (savedTask.assignedTo) {
            req.io.emit('taskAssigned', {
                message: `تم تعيين مهمة جديدة لك: ${savedTask.title}`,
                task: savedTask,
            });
        }

        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// جلب جميع المهام
router.get('/', async (req, res) => {
    try {
        const tasks = await TaskModel.find().populate('assignedTo', 'name email'); // جلب اسم وإيميل المستخدم
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// تحديث مهمة
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// حذف مهمة
router.delete('/:id', async (req, res) => {
    try {
        await TaskModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف المهمة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;