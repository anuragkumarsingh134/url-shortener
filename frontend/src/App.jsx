import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function App() {
    const [originalUrl, setOriginalUrl] = useState("");
    const [shortUrl, setShortUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = "http://localhost:3000";

    const handleShorten = async () => {
        if (!originalUrl) return;
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/shorten`, { originalUrl });
            setShortUrl(`${API_URL}/${response.data.shortUrl}`); // Updated to use backend URL
        } catch (error) {
            alert("Error shortening URL");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <motion.div 
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-4">URL Shortener</h1>
                <p className="text-gray-600 mb-6">Enter a URL to shorten</p>
                <input
                    type="text"
                    placeholder="Paste your URL here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                />
                <motion.button
                    onClick={handleShorten}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg mt-4 hover:bg-blue-700 transition"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                >
                    {loading ? "Shortening..." : "Shorten URL"}
                </motion.button>
                {shortUrl && (
                    <motion.div 
                        className="mt-4 p-3 bg-gray-200 text-center rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-sm text-gray-600">Shortened URL:</p>
                        <a 
                            href={shortUrl} 
                            className="text-blue-600 font-semibold hover:underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {shortUrl}
                        </a>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
