import mongoose from 'mongoose';


// Invoice model for managing invoices in the application
const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    taxNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },

  invoiceDetails: [itemSchema],

  totalAmount: {
    type: Number,
    required: true
  },
  vatAmount: {
    type: Number,
    required: true
  },
  totalWithVat: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String,
  default: ""
  }
 

}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;