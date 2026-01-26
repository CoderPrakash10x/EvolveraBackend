const Registration = require("../models/Registration");

// GET /api/admin/registrations/:eventId
// controllers/adminRegistrationController.js

exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // 1. Query params se page aur limit lo (defaults ke saath)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Parallel mein data fetch karna aur total count nikalna
    const [registrations, total] = await Promise.all([
      Registration.find({ event: eventId })
        .populate("event", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments({ event: eventId })
    ]);

    res.json({
      success: true,
      count: registrations.length,
      totalRegistrations: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      registrations
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};