const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    description: String,
    location: String,

    /* ========= EVENT TIMING ========= */
    eventStartAt: { type: Date, required: true },
    eventEndAt: { type: Date },

    /* ========= REGISTRATION WINDOW ========= */
    registrationStartAt: { type: Date, required: true },
    registrationEndAt: { type: Date, required: true },

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

/* ========= SLUG AUTO-GENERATE ========= */
eventSchema.pre("save", function(next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
});

module.exports = mongoose.model("Event", eventSchema);