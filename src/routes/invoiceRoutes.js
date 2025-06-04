import express from "express";
import Invoice from "../models/Invoice.js";
import protectRoute from "../middleware/auth.middleware.js";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesBetweenDates
} from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/",protectRoute, createInvoice);

router.get("/",protectRoute, getInvoices);

router.get("/between",protectRoute, getInvoicesBetweenDates);

router.get("/:id",protectRoute, getInvoiceById);

router.put("/:id",protectRoute, updateInvoice);

router.delete("/:id",protectRoute, deleteInvoice);

router.post("/ShowInvoice/:id", async  (req, res) => {
  try {
      const { id } = req.params;
  
      // Find the invoice by ID
      const invoice = await Invoice.findById({ invoiceNumber: id });
      // If no invoice is found   
      if (!invoice) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }
    
       res.render("showInvoices.ejs",{
        showInvoices :invoice,
       })

    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "خطأ في جلب الفاتورة" });
    }
});

export default router;
