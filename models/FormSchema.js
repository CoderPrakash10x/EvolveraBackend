const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "email", "phone", "number", "textarea", "select", "radio", "checkbox", "url", "date"],
    required: true
  },
  placeholder: { type: String },
  options: [String],
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },

  // CONDITIONAL LOGIC
  showIf: {
    fieldName: { type: String, default: null },  // konsa field check karo
    value: { type: String, default: null }        // kis value pe dikhao
  }
});

const formSchemaSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true
    },
    fields: [fieldSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSchema", formSchemaSchema);