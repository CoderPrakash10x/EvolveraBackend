const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    responses: {
      type: mongoose.Schema.Types.Mixed,         // { full_name: "John", email: "john@x.com", ... }
      required: true
    },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes
formSubmissionSchema.index({ event: 1, createdAt: -1 });
formSubmissionSchema.index({ "responses.email": 1, event: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);