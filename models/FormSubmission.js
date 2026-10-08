const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    responses: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    isApproved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


// Same email + same event = duplicate
// Same email + different event = allowed

formSubmissionSchema.index(
  {
    "responses.email": 1,
    event: 1
  },
  {
    sparse: true,
    name: "unique_email_per_event"
  }
);


formSubmissionSchema.index({
  event: 1,
  createdAt: -1
});


module.exports = mongoose.model(
  "FormSubmission",
  formSubmissionSchema
);