import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesBetweenDates
} from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/", createInvoice);

router.get("/", getInvoices);

router.get("/between", getInvoicesBetweenDates);

router.get("/:id", getInvoiceById);

router.put("/:id", updateInvoice);

router.delete("/:id", deleteInvoice);

export default router;
