const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    registrationType: {
      type: String,
      enum: ["individual", "team"],
      required: true
    },

    teamName: {
      type: String
    },

    teamLeader: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      college: { type: String }
    },

    members: [
      {
        name: String,
        email: String,
        phone: String
      }
    ]
  },
  { timestamps: true }
);

// same leader + same event = duplicate block
registrationSchema.index(
  { "teamLeader.email": 1, event: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
