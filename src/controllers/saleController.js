
import { SaleModel } from '../models/Sale.js'

// تسجيل عملية بيع جديدة
export const createSale = async (req, res) => {
    try {
        const newSale = new SaleModel(req.body);
        await newSale.save();
        res.status(201).json(newSale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// عرض جميع المبيعات
export const getAllSales = async (req, res) => {
    try {
        const sales = await SaleModel.find().populate('property client');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// عرض عملية بيع معينة
export const getSaleById = async (req, res) => {
    try {
        const sale = await SaleModel.findById(req.params.id).populate('property client');
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تحديث حالة البيع
export const updateSaleStatus = async (req, res) => {
    try {
        const updatedSale = await SaleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSale) return res.status(404).json({ message: 'Sale not found' });
        res.status(200).json(updatedSale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// حذف عملية بيع
export const deleteSale = async (req, res) => {
    try {
        const deletedSale = await SaleModel.findByIdAndDelete(req.params.id);
        if (!deletedSale) return res.status(404).json({ message: 'Sale not found' });
        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};