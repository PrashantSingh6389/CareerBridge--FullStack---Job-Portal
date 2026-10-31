const express = require("express");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

// Submit an application
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { jobId, jobTitle, company } = req.body;

    if (
      !jobId ||
      !jobTitle?.trim() ||
      !company?.trim()
    ) {
      return res.status(400).json({
        message: "Job ID, title and company are required",
      });
    }

    const application = await Application.create({
      userId: req.userId,
      jobId,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this job",
      });
    }

    console.error("Application error:", error.message);
    res.status(500).json({
      message: "Could not submit application",
    });
  }
});

// Track applications for the logged-in user
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.userId,
    }).sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Tracking error:", error.message);
    res.status(500).json({
      message: "Could not fetch applications",
    });
  }
});

module.exports = router;