const Registration = require("../models/Registration");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail");

/* ================= UTIL ================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

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

    const today = normalizeDate(new Date());
    const regStart = normalizeDate(eventDoc.registrationStartDate);
    const regEnd = normalizeDate(eventDoc.registrationEndDate);
    regEnd.setHours(23, 59, 59, 999);

    if (today < regStart) {
      return res.status(403).json({
        message: "Registration coming soon"
      });
    }

    if (today > regEnd) {
      return res.status(403).json({
        message: "Registration closed"
      });
    }


    const eventDate = normalizeDate(eventDoc.eventDate);
    if (eventDate < today) {
      return res.status(403).json({
        message: "Event already completed"
      });
    }

    if (registrationType === "team") {
      if (!teamName) {
        return res.status(400).json({ message: "Team name is required" });
      }
      if (!members || members.length === 0) {
        return res.status(400).json({ message: "Team members required" });
      }
    }

   
    const registration = await Registration.create({
      event,
      registrationType,
      teamName,
      teamLeader,
      members: registrationType === "team" ? members : []
    });

    /* EMAIL */
    const userEmail = teamLeader?.email;
    const userName = teamLeader?.name || "Participant";

    if (userEmail) {
      sendEmail({
        email: userEmail,
        subject: `Registration Confirmed – ${eventDoc.title}`,
        message: `
          <h2 style="color:#f97316;">Registration Confirmed</h2>
          <p>Hi <b>${userName}</b>,</p>
          <p>You are successfully registered for <b>${eventDoc.title}</b>.</p>
          <p><b>Event Date:</b> ${eventDoc.eventDate.toDateString()}</p>
          <p>— Team Evolvera Club</p>
        `
      }).catch(() => {});
    }

    return res.status(201).json({
      message: "Registration successful",
      registration
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already registered for this event"
      });
    }
    return res.status(400).json({ message: error.message });
  }
};
