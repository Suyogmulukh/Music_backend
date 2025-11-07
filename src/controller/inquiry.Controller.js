const Inquiry = require("../models/inquiry");
const { generateAImessage } = require("../utils/geminiApi");

// Add nodemailer for sending emails
const nodemailer = require("nodemailer");

// Configure transporter (use your email credentials or environment variables)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL || "motivationsm14@gmail.com",
    pass: process.env.ADMIN_EMAIL_PASS, // Set this in your .env file
  },
});

// Create Inquiry
const createInquiry = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    const inquiry = await Inquiry.create(req.body);

    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.ADMIN_EMAIL || "motivationsm14@gmail.com",
        to: "motivationsm14@gmail.com",
        subject: "New Event Inquiry Received",
        text: `A new inquiry has been submitted:\n\n${JSON.stringify(
          req.body,
          null,
          2
        )}`,
        html: `<h3>New Inquiry Details</h3>
          <ul>
            <li><strong>Name:</strong> ${req.body.name}</li>
            <li><strong>Phone:</strong> ${req.body.phone}</li>
            <li><strong>Message:</strong> ${req.body.message}</li>
            <li><strong>Event Type:</strong> ${req.body.eventType}</li>
            <li><strong>Location:</strong> ${req.body.location}</li>
            <li><strong>Guests:</strong> ${req.body.guests}</li>
            <li><strong>Date:</strong> ${req.body.date}</li>
          </ul>`,
      });
    } catch (emailErr) {
      console.error("Failed to send inquiry email:", emailErr);
      // Optionally, you can notify the client about email failure, but still return success for inquiry creation
    }

    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    console.error("Create inquiry error:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        
        success: false,
        error: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create inquiry",
    });
  }
};

// Draft AI Message
const draftAIMessage = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const message = await generateAImessage(req.body);

    // Check if message was generated
    if (!message) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate AI message",
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (err) {
    console.error("Draft AI message error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI message",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  createInquiry,
  draftAIMessage,
};
