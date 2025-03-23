import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const shortenUrl = async () => {
    if (!originalUrl) {
      toast.error("Please enter a URL!");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/shorten`, { originalUrl });
      setShortUrl(res.data.shortUrl);
      toast.success("URL Shortened Successfully!");
    } catch (error) {
      toast.error("Error shortening URL");
    }
  };

  return (
    <div className="container">
      <h2>URL Shortener</h2>
      <input type="text" placeholder="Enter URL" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
      <button onClick={shortenUrl}>Shorten</button>
      {shortUrl && (
        <p>
          Short URL: <a href={shortUrl} target="_blank">{shortUrl}</a>
        </p>
      )}
      <ToastContainer />
    </div>
  );
}

export default App;
