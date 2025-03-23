import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { nanoid } from "nanoid"; // ✅ Use ESM import

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("urls.db");

// Create table if not exists
db.run(
    "CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY, short TEXT UNIQUE, original TEXT)"
);

// API to shorten URLs
app.post("/shorten", (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) return res.status(400).json({ error: "Invalid URL" });

    const shortUrl = nanoid(6);
    db.run(
        "INSERT INTO urls (short, original) VALUES (?, ?)",
        [shortUrl, originalUrl],
        (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ shortUrl });
        }
    );
});

// Redirect short URLs to the original URL
app.get("/:shortUrl", (req, res) => {
    const { shortUrl } = req.params;
    db.get(
        "SELECT original FROM urls WHERE short = ?",
        [shortUrl],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: "URL not found" });
            res.redirect(row.original);
        }
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
