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


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Event submissions sorting
formSubmissionSchema.index({
  event: 1,
  createdAt: -1
});


// Same email can register for multiple events.
// But same email cannot register twice for the SAME event.
formSubmissionSchema.index(
  {
    "responses.email": 1,
    event: 1
  },
  {
    unique: true,
    sparse: true
  }
);


module.exports = mongoose.model(
  "FormSubmission",
  formSubmissionSchema
);