const express = require("express");
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

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

/*
|--------------------------------------------------------------------------
| PUBLIC REGISTRATION RATE LIMIT
|--------------------------------------------------------------------------
| IMPORTANT:
| Limit is now applied per IP + EVENT.
|
| Event A registration attempts will NOT affect Event B.
|--------------------------------------------------------------------------
*/

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // 8 attempts per event per IP in 15 minutes
  max: 8,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const eventId = req.params.eventId || "unknown-event";

    const ip = ipKeyGenerator(
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown-ip"
    );

    return `${ip}:${eventId}`;
  },

  message: {
    message:
      "Too many attempts for this event. Please try again in a few minutes."
  }
});


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
  "/:eventId/schema",
  getFormSchema
);

router.post(
  "/:eventId/submit",
  submitLimiter,
  submitForm
);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.post(
  "/:eventId/schema",
  protectAdmin,
  saveFormSchema
);

router.get(
  "/:eventId/submissions",
  protectAdmin,
  getSubmissions
);

router.delete(
  "/submissions/:id",
  protectAdmin,
  deleteSubmission
);

router.patch(
  "/submissions/:id/approve",
  protectAdmin,
  toggleApproval
);

router.get(
  "/:eventId/submissions/export",
  protectAdmin,
  exportSubmissionsExcel
);


module.exports = router;