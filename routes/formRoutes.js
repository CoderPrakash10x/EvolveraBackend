const express = require("express");
const router = express.Router();
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

// PUBLIC
router.get("/:eventId/schema", getFormSchema);
router.post("/:eventId/submit", submitForm);

// ADMIN
router.post("/:eventId/schema", protectAdmin, saveFormSchema);
router.get("/:eventId/submissions", protectAdmin, getSubmissions);
router.delete("/submissions/:id", protectAdmin, deleteSubmission);
router.patch("/submissions/:id/approve", protectAdmin, toggleApproval);
router.get("/:eventId/submissions/export", protectAdmin, exportSubmissionsExcel);

module.exports = router;