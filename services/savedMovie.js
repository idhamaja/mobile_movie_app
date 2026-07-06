const mongoose = require("mongoose");

const savedMovieSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie_id: { type: Number, required: true },
    title: { type: String, required: true },
    poster_url: { type: String },
    note: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true },
);

// Satu user tidak bisa menyimpan movie yang sama dua kali
savedMovieSchema.index({ userId: 1, movie_id: 1 }, { unique: true });

module.exports = mongoose.models.SavedMovie || mongoose.model("SavedMovie", savedMovieSchema);