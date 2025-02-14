import { PropertyModel } from '../models/Property.js'


// إنشاء عقار جديد
export const createProperty = async (req, res) => {
    try {
        const newProperty = new PropertyModel(req.body);
        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// عرض جميع العقارات
export const getAllProperties = async (req, res) => {
    try {
        const properties = await PropertyModel.find();
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// عرض عقار واحد بالتفصيل
export const getPropertyById = async (req, res) => {
    try {
        const property = await PropertyModel.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تحديث بيانات عقار
export const updateProperty = async (req, res) => {
    try {
        const updatedProperty = await PropertyModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProperty) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json(updatedProperty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// حذف عقار
export const deleteProperty = async (req, res) => {
    try {
        const deletedProperty = await PropertyModel.findByIdAndDelete(req.params.id);
        if (!deletedProperty) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};