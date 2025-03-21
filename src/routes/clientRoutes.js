import express from 'express';
import { createClient, deleteClient, getAllClients, getClientById, updateClient } from '../controllers/clientController.js';
import { ClientModel } from '../models/Client.js';
import { authenticate, checkRole, verifySeller, verifyToken } from '../Middleware/Middleware.js';
import { UserModel } from '../models/User.js';
const router = express.Router();


// إنشاء عميل جديد
router.post('/', createClient);

// عرض جميع العملاء
router.get('/', getAllClients);

// عرض عميل معين
router.get('/:id', getClientById);

// تحديث بيانات عميل
router.put('/:id', authenticate, updateClient);

// حذف عميل
router.delete('/:id', deleteClient);

router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const clients = await ClientModel.find({ assignedTo: sellerId });
        // console.log(clients)
        res.status(200).json(clients);
    } catch (error) {
        // console.log(sellerId)
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Error fetching clients' });
    }
});

export default router;
