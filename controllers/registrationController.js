const Registration = require("../models/Registration");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail");

/* ================= UTIL ================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ================= CREATE REGISTRATION ================= */
exports.createRegistration = async (req, res) => {
  try {
    const {
      event,
      registrationType,
      teamName,
      teamLeader,
      members
    } = req.body;

    if (!event) {
      return res.status(400).json({ message: "Event ID required" });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({ message: "Event not found" });
    }

    /* ================= DATE CHECK ================= */
    const today = normalizeDate(new Date());
    const regStart = normalizeDate(eventDoc.registrationStartDate);
    const regEnd = normalizeDate(eventDoc.registrationEndDate);
    regEnd.setHours(23, 59, 59, 999);

    if (today < regStart) {
      return res.status(403).json({ message: "Registration coming soon" });
    }

    if (today > regEnd) {
      return res.status(403).json({ message: "Registration closed" });
    }

    /* ================= MODE VALIDATION ================= */
    if (
      eventDoc.registrationMode === "team" &&
      registrationType !== "team"
    ) {
      return res.status(400).json({
        message: "This event allows only team registration"
      });
    }

    if (
      eventDoc.registrationMode === "individual" &&
      registrationType !== "individual"
    ) {
      return res.status(400).json({
        message: "This event allows only individual registration"
      });
    }

    /* ================= TEAM VALIDATION ================= */
    if (registrationType === "team") {
      if (!teamName) {
        return res.status(400).json({ message: "Team name is required" });
      }

      const totalMembers = 1 + (members?.length || 0);

      if (
        eventDoc.minTeamSize &&
        totalMembers < eventDoc.minTeamSize
      ) {
        return res.status(400).json({
          message: `Minimum ${eventDoc.minTeamSize} members required`
        });
      }

      if (
        eventDoc.maxTeamSize &&
        totalMembers > eventDoc.maxTeamSize
      ) {
        return res.status(400).json({
          message: `Maximum ${eventDoc.maxTeamSize} members allowed`
        });
      }
    }

    /* ================= CREATE ================= */
    const registration = await Registration.create({
      event,
      registrationType,
      teamName: registrationType === "team" ? teamName : undefined,
      teamLeader,
      members: registrationType === "team" ? members : []
    });

    /* ================= EMAIL ================= */
    if (teamLeader?.email) {
      sendEmail({
        email: teamLeader.email,
        subject: `Registration Confirmed – ${eventDoc.title}`,
        message: `
          <h2 style="color:#f97316;">Registration Confirmed</h2>
          <p>Hi <b>${teamLeader.name}</b>,</p>
          <p>You are successfully registered for <b>${eventDoc.title}</b>.</p>
          <p><b>Event Date:</b> ${eventDoc.eventDate.toDateString()}</p>
          <p>— Team Evolvera Club</p>
        `
      }).catch((err) => {
  console.error("❌ Email send failed:", err.message);
});

    }

    res.status(201).json({
      message: "Registration successful",
      registration
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already registered for this event"
      });
    }

    res.status(400).json({ message: error.message });
  }
};

