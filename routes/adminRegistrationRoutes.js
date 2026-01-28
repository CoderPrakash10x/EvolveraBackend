const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middlewares/authMiddleware");

const {
  getRegistrationsByEvent,
  exportRegistrationsExcel,
  deleteRegistration,
  toggleApproval
} = require("../controllers/adminRegistrationController");

router.get(
  "/registrations/:eventId",
  protectAdmin,
  getRegistrationsByEvent
);

router.get(
  "/registrations/:eventId/export",
  protectAdmin,
  exportRegistrationsExcel
);

router.delete(
  "/registrations/:id",
  protectAdmin,
  deleteRegistration
);

router.patch(
  "/registrations/:id/approve",
  protectAdmin,
  toggleApproval
);

module.exports = router;
