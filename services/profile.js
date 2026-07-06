const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Profile || mongoose.model("Profile", profileSchema);