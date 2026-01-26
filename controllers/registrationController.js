const Registration = require("../models/Registration");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail"); // 👈 Email utility import karein

// POST /api/registrations
exports.createRegistration = async (req, res) => {
  try {
    const {
      event,
      registrationType,
      teamName,
      teamLeader,
      members
    } = req.body;

    // 1️⃣ Event exist?
    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 2️⃣ AUTO CLOSE if deadline crossed
    if (
      eventDoc.registrationDeadline &&
      new Date() > eventDoc.registrationDeadline
    ) {
      eventDoc.isRegistrationOpen = false;
      await eventDoc.save();

      return res.status(403).json({
        message: "Registration closed (deadline crossed)"
      });
    }

    if (!req.body.event) {
  return res.status(400).json({ message: "Event ID required" });
}

    // 3️⃣ Manual close / Coming soon
    if (!eventDoc.isRegistrationOpen) {
      return res.status(403).json({
        message: "Registration closed / Coming soon"
      });
    }

    // 4️⃣ Event already completed
    if (eventDoc.eventDate && eventDoc.eventDate < new Date()) {
      return res.status(403).json({
        message: "Event already completed"
      });
    }

    // 5️⃣ Team rules
    if (registrationType === "team") {
      if (!teamName) {
        return res.status(400).json({ message: "Team name is required" });
      }
      if (!members || members.length === 0) {
        return res.status(400).json({ message: "Team members required" });
      }
    }

    // 6️⃣ Create registration
    const registration = await Registration.create({
      event,
      registrationType,
      teamName,
      teamLeader,
      members: registrationType === "team" ? members : []
    });

    // 📧 7️⃣ EMAIL LOGIC START
    // Registration document se email nikalna (Model ke hisab se teamLeader.email check karein)
    const userEmail = teamLeader?.email; 
    const userName = teamLeader?.name || "Participant";

    if (userEmail) {
      const emailMessage = `
        <div style="font-family: sans-serif; border: 1px solid #e1e1e1; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">Registration Confirmed!</h2>
          <p>Hi <b>${userName}</b>,</p>
          <p>Aapka registration <b>${eventDoc.title}</b> ke liye successfully ho gaya hai.</p>
          <hr/>
          <p><b>Event Details:</b></p>
          <ul>
            <li><b>Event:</b> ${eventDoc.title}</li>
            <li><b>Location:</b> ${eventDoc.location}</li>
            <li><b>Type:</b> ${registrationType}</li>
            ${registrationType === 'team' ? `<li><b>Team Name:</b> ${teamName}</li>` : ''}
          </ul>
          <p>Hum aapse jald hi contact karenge. Best of luck!</p>
          <br/>
          <p style="font-size: 12px; color: #888;">Team Evolvera Club</p>
        </div>
      `;

      // Background mein bhejenge taaki response delay na ho
      sendEmail({
        email: userEmail,
        subject: `Confirmation: ${eventDoc.title} Registration`,
        message: emailMessage
      }).catch(err => console.log("Email error:", err.message));
    }
    // 📧 EMAIL LOGIC END

    return res.status(201).json({
        message: "Registration successful! Confirmation email has been sent.",
        registration
    });

  } catch (error) {
    // 8️⃣ Duplicate registration
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already registered for this event"
      });
    }
    return res.status(400).json({ message: error.message });
  }
};