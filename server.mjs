import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Initialize database
const dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database and create table
(async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL
    )
  `);
})();

// Route to shorten a URL
app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const id = nanoid(6);
  const db = await dbPromise;

  await db.run("INSERT INTO urls (id, original_url) VALUES (?, ?)", [id, url]);

  res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${id}` });
});

// Route to handle redirection
app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = await dbPromise;

  const row = await db.get("SELECT original_url FROM urls WHERE id = ?", [id]);

  if (row) {
    res.redirect(row.original_url);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
