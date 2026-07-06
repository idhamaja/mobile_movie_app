const mongoose = require("mongoose");

// Penting untuk serverless: cache koneksi supaya tidak buat koneksi baru
// di setiap invocation (bisa bikin "too many connections" di MongoDB Atlas).
let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI belum diset di environment variables");

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;