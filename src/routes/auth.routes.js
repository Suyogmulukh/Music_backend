const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = process.env.ADMIN_USERS.split(",");
  const passwords = process.env.ADMIN_PASSWORDS.split(",");

  const idx = users.findIndex((u) => u === username);
  if (idx === -1 || passwords[idx] !== password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, "your_jwt_secret", { expiresIn: "1h" });

  res.json({ token, username });
});

module.exports = router;
