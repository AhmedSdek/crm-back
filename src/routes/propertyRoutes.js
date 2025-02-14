import express from 'express';
import { createProperty, deleteProperty, getAllProperties, getPropertyById, updateProperty } from '../controllers/propertyController.js';
const router = express.Router();


// إنشاء عقار جديد
router.post('/', createProperty);

// عرض جميع العقارات
router.get('/', getAllProperties);

// عرض عقار واحد بالتفصيل
router.get('/:id', getPropertyById);

// تحديث بيانات عقار
router.put('/:id', updateProperty);

// حذف عقار
router.delete('/:id', deleteProperty);

export default router;