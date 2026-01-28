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


router.get("/", getEvents);
router.get("/slug/:slug", getEventBySlug); 
router.get("/:id", getEventById);


router.post("/", protectAdmin, upload.single("coverImage"), createEvent);
router.put(
  "/:id",
  protectAdmin,
  upload.single("coverImage"),
  updateEvent
);

router.delete("/:id", protectAdmin, deleteEvent);

module.exports = router;
