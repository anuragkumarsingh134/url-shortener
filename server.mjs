import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Database Connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render
});

// Initialize Database Table
async function initializeDB() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id SERIAL PRIMARY KEY,
        short TEXT UNIQUE NOT NULL,
        original TEXT NOT NULL
      );
    `);
    client.release();
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}
initializeDB();

// API to shorten URL
app.post("/shorten", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const shortId = nanoid(6);
    const client = await pool.connect();

    await client.query("INSERT INTO urls (short, original) VALUES ($1, $2)", [
      shortId,
      url,
    ]);
    client.release();

    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// API to redirect shortened URL
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const client = await pool.connect();

    const result = await client.query(
      "SELECT original FROM urls WHERE short = $1",
      [shortId]
    );
    client.release();

    if (result.rows.length > 0) {
      res.redirect(result.rows[0].original);
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
