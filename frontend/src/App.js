import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState("Initializing scan…");

  const scanMessages = [
    "Scanning URL fingerprint…",
    "Verifying digital signature…",
    "Analyzing URL structure…",
    "Inspecting domain history…",
    "Cross-referencing threat models…",
    "Finalizing AI assessment…",
  ];

  const cycleMessages = () => {
    let index = 0;
    const interval = setInterval(() => {
      setScanMessage(scanMessages[index % scanMessages.length]);
      index++;
    }, 900);
    return interval;
  };

  const scanUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    const interval = cycleMessages();

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        setResult(data);
        setLoading(false);
      }, 3500);

    } catch (error) {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const getConfidence = () => {
    if (!result) return 0;
    return result.prediction === "phishing"
      ? result.confidence * 100
      : (1 - result.confidence) * 100;
  };

  const getRiskLevel = () => {
    const c = result.confidence;
    if (c < 0.20) return "Low Risk";
    if (c < 0.65) return "Medium Risk";
    return "High Risk";
  };

  
  useEffect(() => {
    const canvas = document.getElementById("matrixCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01";
    const columns = canvas.width / 20;
    const drops = [];

    for (let i = 0; i < columns; i++) drops[i] = 1;

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff9d";
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height || Math.random() > 0.95)
          drops[i] = 0;

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 55);
    return () => clearInterval(interval);
  }, []);

  
  const SafeIcon = () => (
    <motion.svg
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00ff9d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-glow"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </motion.svg>
  );

  const PhishIcon = () => (
  <motion.svg
    width="42"
    height="42"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ff3b3b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="drop-shadow-red"
    animate={{
      scale: [1, 1.15, 1],
      rotate: [0, -3, 3, 0],
    }}
    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
  >
   
    <path d="M12 2l9 18H3L12 2z" />

  
    <line x1="12" y1="8" x2="12" y2="13" />

   
    <circle cx="12" cy="16.5" r="1.3" fill="#ff3b3b" stroke="none" />
  </motion.svg>
);


  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <canvas
        id="matrixCanvas"
        className="absolute inset-0 opacity-25 pointer-events-none"
      ></canvas>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">

        <motion.h1
          className="text-5xl font-extrabold text-center mb-4 tracking-wide text-emerald-400 drop-shadow-glow"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          AI Phishy URL Detector🔍
        </motion.h1>

        <p className="text-slate-400 mb-12 text-center text-lg">
          A Machine Learning–Enabled Platform for Cyber-Grade Threat URLs Detection.
        </p>

        
        <motion.div
          className="flex w-full max-w-3xl gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            className="flex-1 px-5 py-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 
                       text-slate-200 backdrop-blur-xl neon-input focus:border-emerald-400 
                       focus:ring-4 focus:ring-emerald-500/25 transition-all duration-300"
            placeholder="Enter URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <motion.button
            onClick={scanUrl}
            disabled={loading}
            whileHover={{ scale: 1.05, boxShadow: "0 0 18px #00ff9d" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-black font-bold shadow-green-glow transition-all duration-300 disabled:bg-slate-600"
          >
            {loading ? "Scanning…" : "Scan"}
          </motion.button>
        </motion.div>

     
        {loading && (
          <div className="flex flex-col items-center mt-16">
            <motion.div
              className="radar-container mb-6"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="radar"></div>
            </motion.div>

            <motion.p
              key={scanMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-emerald-300 text-xl tracking-wide"
            >
              {scanMessage}
            </motion.p>
          </div>
        )}

        
        {result && !loading && (
          <motion.div
            className="mt-12 p-8 rounded-2xl border border-emerald-400/40 bg-white/10 
                       backdrop-blur-xl shadow-2xl hologram-card w-full max-w-3xl relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="border-trace"></span>

           
            <div className="flex items-center gap-4 mb-4">
              {result.prediction === "phishing" ? <PhishIcon /> : <SafeIcon />}
              
              <h2
                className={`text-3xl font-bold ${
                  result.prediction === "phishing" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {result.prediction === "phishing"
                  ? "PHISHING — Malicious URL Detected"
                  : "SAFE — No Threat Detected"}
              </h2>
            </div>

            <p className="text-slate-300 mb-4 break-all text-lg">{result.url}</p>

            <p className="text-slate-400">
              Risk Level: <span className="font-semibold">{getRiskLevel()}</span>
            </p>

            <p className="text-slate-400 mt-2 mb-2">
              Confidence: {getConfidence().toFixed(2)}%
            </p>

            <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getConfidence()}%` }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                className={`h-full ${
                  result.prediction === "phishing" ? "bg-red-500" : "bg-emerald-400"
                } rounded-full shadow-lg`}
              />
            </div>
          </motion.div>
        )}

        
        <p className="text-white text-sm mt-12 text-center font-medium opacity-90">
          ⚠ Note: This AI tool is not always 100% accurate. It may make mistakes when classifying URLs.
        </p>

      </div>
    </div>
  );
}

export default App;
