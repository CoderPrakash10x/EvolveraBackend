const express = require("express");
const router = express.Router();

const {
  getRegistrationsByEvent
} = require("../controllers/adminRegistrationController");

const { protectAdmin } = require("../middlewares/authMiddleware");

router.get(
  "/registrations/:eventId",
  protectAdmin,
  getRegistrationsByEvent
);

module.exports = router;
