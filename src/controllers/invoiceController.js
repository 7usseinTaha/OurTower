import Invoice from "../models/Invoice.js";
import QRCode from 'qrcode';


// Function to get All Invoices
export const getInvoices = async (req, res) => {  
  try {

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalInvoices = await Invoice.countDocuments();

    res.status(200).json(
      invoices,
      {
        page: page,
        limit: limit,
        totalInvoices,
      }
    );
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "خطأ في جلب الفواتير" });
  }
}

// Function to get a single invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the invoice by ID
    const invoice = await Invoice.findOne({ invoiceNumber: id });
    // If no invoice is found   
    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    // if (invoice.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذه الفاتورة" });
    // }
    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "خطأ في جلب الفاتورة" });
  }
};

// Function to get a Invoice between two dates
export const getInvoicesBetweenDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; 
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "يرجى إدخال تاريخ البداية والنهاية" });
    } 
    const invoices = await Invoice.find({
      invoiceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ invoiceDate: -1 });


    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "خطأ في جلب الفواتير" });
  }
};

// Function to create a new invoice
export const createInvoice = async (req, res) => {
  try {
let invoiceNumber;
let isUnique = false;
let attempts = 0;


    const {
      invoiceDate,
      customer,
      invoiceDetails,
      totalAmount,
      vatAmount,
      totalWithVat,
      qrCode,

    } = req.body;



      // customer data should be an object 

    const { name, taxNumber, address, phone } = customer;

    
while (!isUnique && attempts < 10) {
  attempts++;

  const yearSuffix = new Date(invoiceDate).getFullYear().toString().slice(-2);

  // جلب آخر رقم مشابه
  const lastInvoice = await Invoice
    .find({ invoiceNumber: new RegExp(`^INV-${yearSuffix}\\d{5}$`) })
    .sort({ invoiceNumber: -1 })
    .limit(1);

  let newNumber = 1;

  if (lastInvoice.length > 0) {
    const last = lastInvoice[0].invoiceNumber;
    const lastNumber = parseInt(last.replace(/^INV-\d{2}/, '')); // استخرج الرقم فقط
    newNumber = lastNumber + 1;
  }

  // توليد الرقم
  invoiceNumber = `INV-${yearSuffix}${String(newNumber).padStart(5, "0")}`;

  // التحقق من أن الرقم غير موجود فعلياً
  const exists = await Invoice.findOne({ invoiceNumber });
  if (!exists) {
    isUnique = true;
  }
}

if (!isUnique) {
  return res.status(500).json({ message: "تعذر توليد رقم فاتورة فريد، الرجاء المحاولة لاحقًا." });
}
// 1. توليد QR Code
const qrData = `رقم الفاتورة: ${invoiceNumber}`;
const qrCodeImage = await QRCode.toDataURL(qrData); 
  const newInvoice = new Invoice({
    invoiceNumber,
    invoiceDate,
    customer: {
      name,
      taxNumber,
      address,
      phone,
      },
      invoiceDetails, // مصفوفة كاملة يتم حفظها كما هي
      totalAmount,
      vatAmount,
      totalWithVat,
      qrCode: qrCodeImage, // 👈 هنا نضيف صورة QR

      // user: req.user._id // Assuming req.user is set by the auth middleware
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);

  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "خطأ في إنشاء الفاتورة" });
  }
};

// Function to update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoiceDate,
      customer,
      invoiceDetails,
      totalAmount,
      vatAmount,
      totalWithVat,
      qrCode,
    } = req.body;

    // Find the invoice by ID and update it
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoiceNumber: id },
      {
        invoiceDate,
        customer,
        invoiceDetails,
        totalAmount,
        vatAmount,
        totalWithVat,
        qrCode,
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    //update the invoice
    await updatedInvoice.save();
    res.status(200).json({
      message: "تم تحديث الفاتورة بنجاح",
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "خطأ في تحديث الفاتورة" });
  }
};

// Function to delete an invoice by ID

export const deleteInvoice = async (req, res) => {
  try {
    const  {id}  = req.params;
    console.log("Deleting invoice with ID:", id);
    // Find the invoice by ID and delete it
    const deletedInvoice = await Invoice.findOne({ invoiceNumber: id });
    // If no invoice is found
    if (!deletedInvoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    // if (deletedInvoice.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "ليس لديك صلاحية لحذف هذه الفاتورة" });
    // }
    await Invoice.deleteOne({ invoiceNumber: id });

   res.status(200).json({ message: "تم حذف الفاتورة بنجاح" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "خطأ في حذف الفاتورة" });
   }
}


