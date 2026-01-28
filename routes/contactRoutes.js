const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middlewares/authMiddleware");
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");

router.post("/", createMessage); 
router.get("/", protectAdmin, getMessages); 
router.delete("/:id", protectAdmin, deleteMessage); 

module.exports = router;
