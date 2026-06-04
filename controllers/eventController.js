const Event = require("../models/Event");
const slugify = require("slugify");

/* ================= COMPUTED FIELDS ================= */
const getComputedFields = (event) => {
  const now = new Date();

  const eventStart = new Date(event.eventStartAt);
  const eventEnd = new Date(event.eventEndAt);

  const regStart = new Date(event.registrationStartAt);
  const regEnd = new Date(event.registrationEndAt);

  // Event status
  let status = "upcoming";
  if (now >= eventStart && now <= eventEnd) status = "live";
  if (now > eventEnd) status = "past";

  // Registration status
  let registrationStatus = "comingSoon";
  if (now >= regStart && now <= regEnd) registrationStatus = "open";
  if (now > regEnd) registrationStatus = "registrationClosed";

  return {
    status,
    registrationStatus,
    isRegistrationOpen: registrationStatus === "open"
  };
};

/* ================= CREATE EVENT ================= */
exports.createEvent = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : "";

    const {
      title,
      description,
      location,
      eventStartAt,
      eventEndAt,
      registrationStartAt,
      registrationEndAt,
      registrationMode,
      minTeamSize,
      maxTeamSize,
      skills,
      perks,
      rules
    } = req.body;

    const event = await Event.create({
      title,
      slug: slugify(title, { lower: true }),
      description,
      location,
      eventStartAt,
      eventEndAt,
      registrationStartAt,
      registrationEndAt,
      registrationMode,
      minTeamSize,
      maxTeamSize,
      skills: skills ? JSON.parse(skills) : [],
      perks: perks ? JSON.parse(perks) : [],
      rules: rules ? JSON.parse(rules) : [],
      coverImage: imageUrl,
      createdBy: req.admin._id
    });

    res.status(201).json({
      ...event.toObject(),
      ...getComputedFields(event)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= UPDATE EVENT ================= */
exports.updateEvent = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.title) {
      updates.slug = slugify(updates.title, { lower: true });
    }

    if (updates.skills) updates.skills = JSON.parse(updates.skills);
    if (updates.perks) updates.perks = JSON.parse(updates.perks);
    if (updates.rules) updates.rules = JSON.parse(updates.rules);

    if (req.file) {
      updates.coverImage = req.file.path;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      ...event.toObject(),
      ...getComputedFields(event)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= GET EVENTS ================= */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventStartAt: 1 });

    res.json(
      events.map((event) => ({
        ...event.toObject(),
        ...getComputedFields(event)
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET BY ID ================= */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      ...event.toObject(),
      ...getComputedFields(event)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET BY SLUG ================= */
exports.getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      ...event.toObject(),
      ...getComputedFields(event)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE EVENT ================= */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};