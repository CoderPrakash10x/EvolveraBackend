const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin
} = require("../controllers/adminController");

const { getEventRegistrationCounts } =
  require("../controllers/adminStatsController");

const { exportRegistrationsExcel } =
  require("../controllers/adminExportController");

const { protectAdmin } =
  require("../middlewares/authMiddleware");

// 🔐 AUTH
router.post("/login", loginAdmin);

// ⚠️ OPTIONAL: disable later
router.post("/register", registerAdmin);

// 📊 STATS
router.get(
  "/event-registration-count",
  protectAdmin,
  getEventRegistrationCounts
);

// 📤 EXPORT
router.get(
  "/export/registrations/:eventId",
  protectAdmin,
  exportRegistrationsExcel
);

module.exports = router;
