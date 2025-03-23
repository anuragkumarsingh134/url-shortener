import express from "express";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import cors from "cors";

const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(express.json());
app.use(cors());

// API to shorten a given URL (POST)
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: "URL is required" });

  try {
    const shortId = nanoid(6);
    await pool.query("INSERT INTO urls (short, original) VALUES ($1, $2)", [
      shortId,
      originalUrl,
    ]);
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// API to shorten a URL using GET
app.get("/shorten", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const shortId = nanoid(6);
    await pool.query("INSERT INTO urls (short, original) VALUES ($1, $2)", [
      shortId,
      url,
    ]);
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Redirect short URL to original URL (and delete after one use)
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    const result = await pool.query("SELECT original FROM urls WHERE short = $1", [
      shortId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found or expired" });
    }

    const originalUrl = result.rows[0].original;

    // Delete the link after it's used once
    await pool.query("DELETE FROM urls WHERE short = $1", [shortId]);

    res.redirect(originalUrl);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
