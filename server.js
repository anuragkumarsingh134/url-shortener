const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { nanoid } = require("nanoid");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error opening database", err);
    } else {
        db.run(
            `CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shortUrl TEXT UNIQUE,
                originalUrl TEXT
            )`
        );
    }
});

// API to shorten URL
app.post("/shorten", (req, res) => {
    let { originalUrl } = req.body;

    // Ensure the URL has a valid protocol
    if (!/^https?:\/\//i.test(originalUrl)) {
        originalUrl = `http://${originalUrl}`;
    }

    const shortUrl = nanoid(6);

    db.run("INSERT INTO urls (shortUrl, originalUrl) VALUES (?, ?)", [shortUrl, originalUrl], (err) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
        } else {
            res.json({ shortUrl });
        }
    });
});

// API to handle redirection
app.get("/:shortUrl", (req, res) => {
    const { shortUrl } = req.params;

    db.get("SELECT originalUrl FROM urls WHERE shortUrl = ?", [shortUrl], (err, row) => {
        if (err) {
            res.status(500).send("Database error");
        } else if (row) {
            res.redirect(row.originalUrl); // Redirect to the original URL
        } else {
            res.status(404).send("Short URL not found");
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
