import { useState } from "react";
import "./App.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleShorten = async () => {
    try {
      setError("");
      const response = await fetch("https://url-shortener-detk.onrender.com/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (response.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error || "Error shortening URL");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL" />
      <button onClick={handleShorten}>Shorten</button>
      {shortUrl && <p>Shortened URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a></p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
