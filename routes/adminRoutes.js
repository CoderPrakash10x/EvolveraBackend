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


router.post("/login", loginAdmin);


router.get(
  "/event-registration-count",
  protectAdmin,
  getEventRegistrationCounts
);

router.get(
  "/export/registrations/:eventId",
  protectAdmin,
  exportRegistrationsExcel
);

module.exports = router;
