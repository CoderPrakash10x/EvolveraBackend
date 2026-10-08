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
      name: {
        type: String,
        required: true
      },

      email: {
        type: String,
        required: true
      },

      phone: {
        type: String
      },

      college: {
        type: String
      }
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    members: [
      {
        name: String,
        email: String,
        phone: String
      }
    ]
  },

  {
    timestamps: true
  }
);


/*
|--------------------------------------------------------------------------
| REGISTRATION UNIQUENESS
|--------------------------------------------------------------------------
|
| Same person:
|
| Event A → allowed
| Event B → allowed
| Event C → allowed
|
| Event A again → blocked
|
|--------------------------------------------------------------------------
*/

registrationSchema.index(
  {
    "teamLeader.email": 1,
    event: 1
  },
  {
    unique: true
  }
);


module.exports = mongoose.model(
  "Registration",
  registrationSchema
);