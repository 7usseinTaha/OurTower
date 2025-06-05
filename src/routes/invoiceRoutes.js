import express from "express";
import Invoice from "../models/Invoice.js";
import protectRoute from "../middleware/auth.middleware.js";
import puppeteer from "puppeteer";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesBetweenDates
} from "../controllers/invoiceController.js";

const app = express();
const router = express.Router();

router.post("/",protectRoute, createInvoice);

router.get("/",protectRoute, getInvoices);

router.get("/between",protectRoute, getInvoicesBetweenDates);

router.get("/:id",protectRoute, getInvoiceById);

router.put("/:id",protectRoute, updateInvoice);

router.delete("/:id",protectRoute, deleteInvoice);

router.get("/ShowInvoice/:id/pdf", async  (req, res) => {
  try {
      const { id } = req.params;
  
      // Find the invoice by ID
      const invoice = await Invoice.findOne({ invoiceNumber: id });
      // If no invoice is found   
      if (!invoice) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }
    
      const html = await new Promise((resolve, reject) => {
      app.render("showInvoices.ejs", { showInvoices :invoice }, (err, html) => {
        if (err) reject(err);
        else resolve(html);
      });
    });

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${id}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (err) {
      console.error("Error fetching invoice:", err);
    res.status(500).send("خطأ في إنشاء الفاتورة PDF");
  }
      

   
});

export default router;
