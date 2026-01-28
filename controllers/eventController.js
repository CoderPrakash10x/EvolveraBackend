const Event = require("../models/Event");
const slugify = require("slugify");

/* ================= NORMALIZE DATE ================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ================= COMPUTED FIELDS ================= */
/*
  status:
    past      -> eventDate < today
    live      -> eventDate === today
    upcoming  -> eventDate > today

  isRegistrationOpen:
    true  -> today between registrationStartDate & registrationEndDate
*/
const getComputedFields = (event) => {
  const today = normalizeDate(new Date());
  const eventDate = normalizeDate(event.eventDate);

  const regStart = event.registrationStartDate
    ? normalizeDate(event.registrationStartDate)
    : null;

  const regEnd = event.registrationEndDate
    ? normalizeDate(event.registrationEndDate)
    : null;

  let status = "upcoming";
  if (eventDate < today) status = "past";
  else if (eventDate.getTime() === today.getTime()) status = "live";

  let isRegistrationOpen = false;
  if (regStart && regEnd && today >= regStart && today <= regEnd) {
    isRegistrationOpen = true;
  }

  return { status, isRegistrationOpen };
};

/* ================= CREATE EVENT ================= */
exports.createEvent = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : "";

    const {
      title,
      description,
      location,
      eventDate,
      registrationStartDate,
      registrationEndDate,
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
      eventDate,
      registrationStartDate,
      registrationEndDate,

      // 🔥 NEW POWER FIELDS
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
    const events = await Event.find().sort({ eventDate: 1 });

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
