const Event = require("../models/Event");
const Registration = require("../models/Registration");
const FormSubmission = require("../models/FormSubmission");

exports.getEventRegistrationCounts = async (req, res) => {
  try {
    const now = new Date();

    // Saare events fetch karo
    const events = await Event.find().sort({ eventStartAt: 1 }).lean();

    // Registration counts (old system)
    const regCounts = await Registration.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);

    // Form submission counts (new dynamic system)
    const subCounts = await FormSubmission.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);

    // Map karo counts
    const regMap = {};
    regCounts.forEach((r) => { regMap[r._id.toString()] = r.count; });

    const subMap = {};
    subCounts.forEach((s) => { subMap[s._id.toString()] = s.count; });

    // Stats banao
    const stats = events.map((e) => {
      const id = e._id.toString();

      const eventStart = new Date(e.eventStartAt);
      const eventEnd = new Date(e.eventEndAt);

      let status = "upcoming";
      if (now >= eventStart && now <= eventEnd) status = "live";
      if (now > eventEnd) status = "past";

      return {
        eventId: e._id,
        title: e.title,
        slug: e.slug,
        status,
        eventStartAt: e.eventStartAt,
        registrations: (regMap[id] || 0) + (subMap[id] || 0)
      };
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};