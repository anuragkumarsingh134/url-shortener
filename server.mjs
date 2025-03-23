import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { nanoid } from "nanoid";

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allow requests from any origin (needed for Vercel frontend)
app.use(cors());
app.use(express.json());

// ✅ SQLite Database
const db = new sqlite3.Database("urls.db");

// ✅ Shorten URL API
app.post("/shorten", (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = nanoid(6);

    db.run("INSERT INTO urls (shortUrl, originalUrl) VALUES (?, ?)", [shortUrl, originalUrl], (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ shortUrl });
    });
});

// ✅ Redirect API
app.get("/:shortUrl", (req, res) => {
    const { shortUrl } = req.params;

    db.get("SELECT originalUrl FROM urls WHERE shortUrl = ?", [shortUrl], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "URL not found" });
        res.redirect(row.originalUrl);
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
