const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middlewares/authMiddleware");
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");

router.post("/", createMessage); // user
router.get("/", protectAdmin, getMessages); // admin
router.delete("/:id", protectAdmin, deleteMessage); // admin

module.exports = router;
