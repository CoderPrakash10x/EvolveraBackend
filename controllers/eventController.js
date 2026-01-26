const Event = require('../models/Event');
const slugify = require("slugify");

// CREATE EVENT
exports.createEvent = async (req, res) => {
  console.log("Body Data:", req.body); // Check karein ye terminal mein dikh raha hai?
  console.log("File Data:", req.file);
  try {
    // req.file humein uploadMiddleware se milta hai
    // Agar image upload hui hai, toh uska secure_url use karenge
    const imageUrl = req.file ? req.file.path : ""; 

    const eventData = {
      ...req.body,
      coverImage: imageUrl, // Database mein Cloudinary ka URL jayega
      createdBy: req.admin._id
    };

    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE EVENT
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    if (req.file) {
      updates.coverImage = req.file.path;
    }

    if (updates.title) {
      updates.slug = slugify(updates.title, { lower: true });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      event
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL EVENTS (For Admin Table and User Page)
exports.getEvents = async (req, res) => {
  try {
    // .sort({ createdAt: -1 }) se naye events sabse upar dikhenge
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Events fetch karne mein error: " + err.message });
  }
};

// GET SINGLE EVENT BY ID (For Edit Form or Details Page)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event nahi mila" });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET EVENT BY SLUG (For Public Event Details Page)
exports.getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
