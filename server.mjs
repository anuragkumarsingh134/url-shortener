import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import { nanoid } from "nanoid";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for frontend
app.use(cors({ origin: "https://url-shortener-8r1txm3h8-anuragkumarsingh134s-projects.vercel.app" }));

// Middleware for parsing JSON
app.use(express.json());

// Initialize SQLite database
const db = await open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

// Create table if not exists
await db.exec("CREATE TABLE IF NOT EXISTS urls (id TEXT PRIMARY KEY, originalUrl TEXT)");

// API route for shortening URLs
app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const id = nanoid(6);
  await db.run("INSERT INTO urls (id, originalUrl) VALUES (?, ?)", [id, url]);

  res.json({ shortUrl: `https://url-shortener-detk.onrender.com/${id}` });
});

// API route for redirecting
app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await db.get("SELECT originalUrl FROM urls WHERE id = ?", [id]);

  if (data) {
    res.redirect(data.originalUrl);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
