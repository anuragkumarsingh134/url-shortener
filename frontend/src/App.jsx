import { useState } from "react";

const API_URL = "https://url-shortener-detk.onrender.com";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleShorten = async () => {
    setError("");
    setShortUrl("");

    try {
      const res = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!res.ok) throw new Error("Failed to shorten URL");

      const data = await res.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      setError("Error shortening URL");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>URL Shortener</h1>
      <input
        type="text"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={handleShorten}>Shorten</button>
      {shortUrl && <p>Short URL: <a href={shortUrl} target="_blank">{shortUrl}</a></p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
