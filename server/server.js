
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// MongoDB connection cache
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Main route
app.get("/", (req, res) => {
  res.json({
    message: "CareerBridge API is running!",
    status: "success",
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.json({
      status: "OK",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Ensure MongoDB is connected before database routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(503).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// API routes
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`CareerBridge API running on port ${PORT}`);
  });
}

// Vercel
module.exports = app;
