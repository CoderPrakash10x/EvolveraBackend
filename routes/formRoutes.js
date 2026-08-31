const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protectAdmin } = require("../middlewares/authMiddleware");
const {
  saveFormSchema,
  getFormSchema,
  submitForm,
  getSubmissions,
  deleteSubmission,
  toggleApproval,
  exportSubmissionsExcel
} = require("../controllers/formController");

// ✅ Prevent spam / accidental double-submits on the public registration route
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." }
});

// PUBLIC
router.get("/:eventId/schema", getFormSchema);
router.post("/:eventId/submit", submitLimiter, submitForm);

// ADMIN
router.post("/:eventId/schema", protectAdmin, saveFormSchema);
router.get("/:eventId/submissions", protectAdmin, getSubmissions);
router.delete("/submissions/:id", protectAdmin, deleteSubmission);
router.patch("/submissions/:id/approve", protectAdmin, toggleApproval);
router.get("/:eventId/submissions/export", protectAdmin, exportSubmissionsExcel);

module.exports = router;