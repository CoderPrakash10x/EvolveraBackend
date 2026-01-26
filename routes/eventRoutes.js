const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middlewares/authMiddleware");
const {
  getEventBySlug,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createEvent
} = require("../controllers/eventController");

const upload = require("../middlewares/uploadMiddleware");

// ✅ PUBLIC
router.get("/", getEvents);
router.get("/slug/:slug", getEventBySlug); // ⚠️ slug route FIRST
router.get("/:id", getEventById);

// ✅ ADMIN
router.post("/", protectAdmin, upload.single("coverImage"), createEvent);
router.put(
  "/:id",
  protectAdmin,
  upload.single("coverImage"),
  updateEvent
);

router.delete("/:id", protectAdmin, deleteEvent);

module.exports = router;
