import express from 'express';
import Vat from '../models/Vat.js'; 
const router = express.Router();

// Function to create a new VAT
export const createVat =async (req, res) => {
try {
      const {  vat } = req.body;

  // Validate input
  if (!vat) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  const newVat = new Vat({
    vat,
  });
    // Save the new VAT to the database
    await newVat.save();
  res.status(201).json({
    message: "تم إضافة ضريبة القيمة المضافة بنجاح",
    vat: {
      vat,
    },
  });
} catch (error) {
  res.status(500).json({ message: "حدث خطأ أثناء إضافة ضريبة القيمة المضافة" });
}
}

// Function to get all VAT records
export const getVats = async (req, res) => {
  try {
    // Fetch all VAT records from the database
    const vats = await Vat.find();
    res.status(200).json(vats);
  } catch (error) {
    console.error("Error fetching VATs:", error);
    res.status(500).json({ message: "خطأ في جلب ضريبة القيمة المضافة" });
  }
};

// Function to Update a VAT record
export const updateVat = async (req, res) => {
  try {
    const { id } = req.params;
    const { vat } = req.body;

    // Validate input
    if (!vat) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // Find the VAT record by ID and update it
    const updatedVat = await Vat.findByIdAndUpdate(id, { vat }, { new: true });

    if (!updatedVat) {
      return res.status(404).json({ message: "ضريبة القيمة المضافة غير موجودة" });
    }
    //update the vat value
    await updatedVat.save();
    res.status(200).json({
      message: "تم تحديث ضريبة القيمة المضافة بنجاح",
      vat: updatedVat,
    });
  } catch (error) {
    console.error("Error updating VAT:", error);
    res.status(500).json({ message: "خطأ في تحديث ضريبة القيمة المضافة" });
  }
};