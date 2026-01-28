const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    description: String,
    location: String,
    price: { type: Number, default: 0 },

    eventDate: { type: Date, required: true },

    registrationStartDate: {
      type: Date,
      required: true
    },
    registrationEndDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["coming_soon", "open", "closed", "past"],
      default: "coming_soon"
    },

    isRegistrationOpen: {
      type: Boolean,
      default: false
    },

    coverImage: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);


eventSchema.pre("save", function () {
  const now = new Date();

  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }

  if (this.eventDate < now) {
    this.status = "past";
    this.isRegistrationOpen = false;
  }

  else if (now < this.registrationStartDate) {
    this.status = "coming_soon";
    this.isRegistrationOpen = false;
  }
 
  else if (
    now >= this.registrationStartDate &&
    now <= this.registrationEndDate
  ) {
    this.status = "open";
    this.isRegistrationOpen = true;
  }
  else {
    this.status = "closed";
    this.isRegistrationOpen = false;
  }
});

module.exports = mongoose.model("Event", eventSchema);
