const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const users = (process.env.ADMIN_USERS || "").split(",");
    const passwords = (process.env.ADMIN_PASSWORDS || "").split(",");

    const idx = users.findIndex((u) => u.trim() === username.trim());
    if (idx === -1 || passwords[idx].trim() !== password.trim()) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      username,
      expiresIn: 3600, // 1 hour in seconds
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
});

module.exports = router;
