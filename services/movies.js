const express = require("express");
const requireAuth = require("../middleware/auth");
const SavedMovie = require("../models/SavedMovie");
const SearchTerm = require("../models/SearchTerm");
const Profile = require("../models/Profile");

const router = express.Router();

// ---------- SAVED MOVIES (butuh login) ----------

router.get("/saved", requireAuth, async (req, res) => {
  const docs = await SavedMovie.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(docs);
});

router.get("/saved/:movieId", requireAuth, async (req, res) => {
  const doc = await SavedMovie.findOne({
    userId: req.userId,
    movie_id: Number(req.params.movieId),
  });
  res.json(doc || null);
});

router.post("/saved", requireAuth, async (req, res) => {
  try {
    const { movie_id, title, poster_path } = req.body;
    const existing = await SavedMovie.findOne({ userId: req.userId, movie_id });
    if (existing) return res.json(existing);

    const doc = await SavedMovie.create({
      userId: req.userId,
      movie_id,
      title,
      poster_url: `https://image.tmdb.org/t/p/w500${poster_path}`,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan film" });
  }
});

router.patch("/saved/:id", requireAuth, async (req, res) => {
  const { note, rating } = req.body;
  const doc = await SavedMovie.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { note, rating } },
    { new: true },
  );
  if (!doc) return res.status(404).json({ message: "Data tidak ditemukan" });
  res.json(doc);
});

router.delete("/saved/:id", requireAuth, async (req, res) => {
  await SavedMovie.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
});

// ---------- PROFILE (butuh login) ----------

router.get("/profile", requireAuth, async (req, res) => {
  let profile = await Profile.findOne({ userId: req.userId });
  if (!profile) {
    profile = await Profile.create({ userId: req.userId, name: "", bio: "" });
  }
  res.json(profile);
});

router.patch("/profile", requireAuth, async (req, res) => {
  const { name, bio } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { userId: req.userId },
    { $set: { name, bio } },
    { new: true, upsert: true },
  );
  res.json(profile);
});

// ---------- SEARCH COUNT & TRENDING (tidak butuh login) ----------

router.post("/search-count", async (req, res) => {
  try {
    const { query, movie } = req.body;
    const existing = await SearchTerm.findOne({ searchTerm: query });

    if (existing) {
      existing.count += 1;
      await existing.save();
      return res.json(existing);
    }

    const created = await SearchTerm.create({
      searchTerm: query,
      movie_id: movie.id,
      title: movie.title,
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      count: 1,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update search count" });
  }
});

router.get("/trending", async (req, res) => {
  const docs = await SearchTerm.find().sort({ count: -1 }).limit(20);
  const seen = new Set();
  const unique = docs.filter((d) => {
    if (seen.has(d.movie_id)) return false;
    seen.add(d.movie_id);
    return true;
  });
  res.json(unique.slice(0, 5));
});

module.exports = router;