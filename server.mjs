import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import shortid from "shortid";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// 🟢 Shorten URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: "URL is required" });

  const shortCode = shortid.generate();
  const shortUrl = `${BASE_URL}/${shortCode}`;

  try {
    await pool.query("INSERT INTO urls (short_code, original_url) VALUES ($1, $2)", [shortCode, originalUrl]);
    res.json({ shortUrl });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// 🟢 Redirect & Expire After One Use
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const result = await pool.query("SELECT original_url FROM urls WHERE short_code = $1", [shortCode]);

    if (result.rows.length === 0) return res.status(404).json({ error: "URL not found or expired" });

    const originalUrl = result.rows[0].original_url;

    // 🛑 Delete the URL after one use
    await pool.query("DELETE FROM urls WHERE short_code = $1", [shortCode]);

    res.redirect(originalUrl);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// 🟢 API Endpoint to Get Shortened URL via GET request
app.get("/api/shorten", async (req, res) => {
  const { originalUrl } = req.query;
  if (!originalUrl) return res.status(400).json({ error: "URL is required" });

  const shortCode = shortid.generate();
  const shortUrl = `${BASE_URL}/${shortCode}`;

  try {
    await pool.query("INSERT INTO urls (short_code, original_url) VALUES ($1, $2)", [shortCode, originalUrl]);
    res.json({ shortUrl });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
