const Event = require("../models/Event");
const Registration = require("../models/Registration");


exports.getEventRegistrationCounts = async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: "$event",
          registrationsCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "events", 
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          eventId: "$_id",
          registrations: "$registrationsCount",
          title: "$eventDetails.title",
          slug: "$eventDetails.slug"
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};