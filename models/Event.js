const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    description: String,
    location: String,

    eventDate: { type: Date, required: true },
    registrationStartDate: { type: Date, required: true },
    registrationEndDate: { type: Date, required: true },

    // 🔥 IMPORTANT
    registrationMode: {
      type: String,
      enum: ["individual", "team", "both"],
      required: true,
      default: "individual"
    },

    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 5 },

    skills: [String],
    perks: [String],
    rules: [String],

    coverImage: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

eventSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
});

module.exports = mongoose.model("Event", eventSchema);
