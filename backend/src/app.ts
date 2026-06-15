import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes will be imported here
import authRoutes from "./routes/auth";
import tenantRoutes from "./routes/tenant";
import memberRoutes from "./routes/member";
import paymentRoutes from "./routes/payment";
import cashRoutes from "./routes/cash";
import expenseRoutes from "./routes/expense";
import vendorRoutes from "./routes/vendor";
import subscriptionRoutes from "./routes/subscription";
import reportRoutes from "./routes/report";
import platformRoutes from "./routes/platform";
import staffRoutes from "./routes/staff";
import masterDataRoutes from "./routes/masterData";
import ticketRoutes from "./routes/ticket";
import uploadRoutes from "./routes/upload";

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/master-data", masterDataRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Society Management API is running...");
});

export default app;
