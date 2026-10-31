const applicationRoutes = require("./routes/applications");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "CareerBridge API is running!",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
  });
});
const applications = [];

app.post("/api/applications", (req, res) => {
  const { jobId, jobTitle, company } = req.body;

  if (!jobId || !jobTitle || !company) {
    return res.status(400).json({
      message: "Job details are required",
    });
  }

  const application = {
    id: Date.now().toString(),
    jobId,
    jobTitle,
    company,
    status: "Applied",
    appliedAt: new Date(),
  };

  applications.push(application);

  res.status(201).json({
    message: "Application submitted successfully",
    application,
  });
});

app.get("/api/applications", (req, res) => {
  res.json(applications);
});
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`CareerBridge API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();