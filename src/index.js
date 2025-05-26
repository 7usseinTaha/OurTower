
import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRouters.js";
import { connectDB } from "./lib/db.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import vatRoutes from "./routes/vatRoutes.js";
import protectRoute from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/invoices",  invoiceRoutes);
app.use("/api/vat",protectRoute,  vatRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();

});
