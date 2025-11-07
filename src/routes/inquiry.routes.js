const express = require("express");
const {
  createInquiry,
  draftAIMessage,
} = require("../controller/inquiry.Controller");

const router = express.Router();

router.post("/", createInquiry);
router.post("/ai-message", draftAIMessage);

module.exports = router;
