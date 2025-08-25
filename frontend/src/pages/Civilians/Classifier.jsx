import { useState } from "react";
import ResultDisplay from "./../../components/Civilians/ResultDisplay";
import PredictionHistory from "./../../components/Civilians/PredictionHistory";
import PredictionForm from "./../../components/Civilians/PredictionForm";
import Header from "../../components/Header";
import './CSS/Classifier.css';
const BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handlePredict = async () => {
    if (!text.trim()) { setError("Please enter some text to analyze"); return; }
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      const newResult = {
        text: text,
        prediction: data.label_name,
        confidence: data.confidence || null,
        timestamp: new Date().toLocaleString()
      };
      setResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]);
      setText("");
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the prediction service. Please make sure the API is running.");
    } finally { setIsLoading(false); }
  };
  const clearHistory = () => {setHistory([]); setResult(null); setError(""); };
  return (
    <> <Header section={"Social"} />

      {/* Social Handles Section */}
      <div className="social-handles">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>

      <div className="container">
        <div className="header">
          <h1>🚨 Disaster Tweet Classifier</h1>
          <p>AI-powered analysis to identify disaster-related tweets</p>
        </div>
        <div className="main-content">
          <PredictionForm text={text} setText={setText} onPredict={handlePredict}  isLoading={isLoading} error={error} />
          <ResultDisplay result={result} />
          {history.length > 0 && ( <PredictionHistory history={history} onClear={clearHistory} />)}
        </div>
      </div>
    </>
  );
}

export default App;
