const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    location: String,
    price: { type: Number, default: 0 },
    eventDate: { type: Date },
    coverImage: String,
    registrationDeadline: Date,
    isRegistrationOpen: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

// auto slug + auto close registration
eventSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }

  if (this.eventDate && this.eventDate < new Date()) {
    this.isRegistrationOpen = false;
  }
});

module.exports = mongoose.model("Event", eventSchema);
