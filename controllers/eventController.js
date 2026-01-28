const Event = require("../models/Event");
const slugify = require("slugify");

/* ================= NORMALIZE DATE ================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ================= UTIL: STATUS + REGISTRATION LOGIC ================= */
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

  // EVENT STATUS
  let status = "upcoming";
  if (eventDate < today) status = "past";
  else if (eventDate.getTime() === today.getTime()) status = "live";

  // REGISTRATION STATUS
  let isRegistrationOpen = false;
  if (regStart && regEnd) {
    if (today >= regStart && today <= regEnd) {
      isRegistrationOpen = true;
    }
  }

  return { status, isRegistrationOpen };
};

/* ================= CREATE EVENT ================= */
exports.createEvent = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : "";

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      eventDate: req.body.eventDate,
      registrationStartDate: req.body.registrationStartDate,
      registrationEndDate: req.body.registrationEndDate,
      slug: slugify(req.body.title, { lower: true }),
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
    let updates = { ...req.body };

    if (req.file) updates.coverImage = req.file.path;
    if (updates.title)
      updates.slug = slugify(updates.title, { lower: true });

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
