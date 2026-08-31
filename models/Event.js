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
     googleFormUrl: { type: String, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

/* ========= SLUG AUTO-GENERATE ========= */
eventSchema.pre("save", function (next) {
  if (!this.slug) {
    // base slug + short random suffix so duplicate titles never collide
    const base = slugify(this.title, { lower: true, strict: true });
    const suffix = Math.random().toString(36).slice(2, 7); // e.g. "a1b2c"
    this.slug = `${base}-${suffix}`;
  }
  next();
});

/* ========= FRIENDLY ERROR ON DUPLICATE SLUG (just in case) ========= */
eventSchema.post("save", function (error, doc, next) {
  if (error && error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("An event with a similar title already exists. Try a slightly different title."));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("Event", eventSchema);