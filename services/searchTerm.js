const mongoose = require("mongoose");

const searchTermSchema = new mongoose.Schema(
  {
    searchTerm: { type: String, required: true, unique: true },
    movie_id: { type: Number, required: true },
    title: { type: String, required: true },
    poster_url: { type: String },
    count: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.models.SearchTerm || mongoose.model("SearchTerm", searchTermSchema);