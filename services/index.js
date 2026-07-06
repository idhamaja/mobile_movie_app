require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");

const app = express();

app.use(cors());
app.use(express.json());

// Pastikan koneksi DB siap sebelum request diproses (penting di serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Gagal terhubung ke database" });
  }
});

app.get("/", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);

// Untuk deploy serverless (Vercel)
module.exports = app;
module.exports.handler = serverless(app);

// Untuk development lokal: `node index.js`
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server jalan di http://localhost:${PORT}`),
  );
}
