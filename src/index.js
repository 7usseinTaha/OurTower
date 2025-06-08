
import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRouters.js";
import { connectDB } from "./lib/db.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import vatRoutes from "./routes/vatRoutes.js";
import protectRoute from "./middleware/auth.middleware.js";
import job from "./lib/cron.js";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 4000;

job.start();
app.use(express.json());
app.use(cors());

app.use(express.static('public'));

app.use("/api/auth", authRoutes);
app.use("/api/invoices",  invoiceRoutes);
app.use("/api/vat",protectRoute,  vatRoutes);

console.log("Puppeteer Chrome path:", puppeteer.executablePath());


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();

});
