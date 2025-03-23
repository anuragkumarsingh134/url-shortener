import { useState } from "react";
import "./App.css"; // ✅ Ensure this is at the top of App.jsx


const backendURL = "https://url-shortener-3r4x.onrender.com"; // ✅ Backend URL

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shortenURL = async () => {
    if (!longUrl) {
      setError("❌ Please enter a valid URL!");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const response = await fetch(`${backendURL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl }),
      });

      const data = await response.json();

      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        setError("❌ Error shortening URL!");
      }
    } catch (error) {
      setError("❌ Failed to connect to the server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">🔗 URL Shortener</h1>
        <p className="text-gray-500 text-sm mb-4">Paste a long URL and get a short one instantly!</p>

        <input
          type="text"
          placeholder="Enter your long URL"
          className="w-full p-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />

        <button
          onClick={shortenURL}
          className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold p-3 rounded-md transition-all"
          disabled={loading}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </button>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {shortUrl && (
          <div className="mt-4 bg-indigo-100 text-indigo-700 p-3 rounded-md">
            ✅ Shortened URL:{" "}
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
