import React, { useState } from "react";

const LETTERS = [
  { letter: "b", rgb: [0, 0, 153] },
  { letter: "d", rgb: [153, 51, 0] },
  { letter: "e", rgb: [102, 255, 102] },
  { letter: "g", rgb: [0, 128, 0] },
  { letter: "i", rgb: [0, 204, 255] },
  { letter: "o", rgb: [255, 161, 23] },
  { letter: "p", rgb: [255, 0, 255] },
  { letter: "q", rgb: [128, 0, 128] },
  { letter: "r", rgb: [255, 0, 0] },
  { letter: "u", rgb: [128, 128, 128] },
  { letter: "w", rgb: [255, 255, 255] },
  { letter: "x", rgb: [85, 85, 85] },
  { letter: "y", rgb: [255, 255, 0] }
];

const BASE_BG = "rgb(196, 188, 150)";

export default function ReadingEasy() {
  const [sessionNumber, setSessionNumber] = useState(1);
  const [showArticle, setShowArticle] = useState(false);
  const [inputText, setInputText] = useState("");

  const rgbCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

  const handleStart = () => {
    setShowArticle(true);
  };

  const getColoredText = (text) => {
    const maxColorIndex = Math.min(sessionNumber, LETTERS.length);
    const colorMap = Object.fromEntries(
      LETTERS.slice(0, maxColorIndex).map(({ letter, rgb }) => [letter, rgbCss(rgb)])
    );

    return text.split("").map((char, i) => {
      const lower = char.toLowerCase();
      const color = colorMap[lower] || "black";
      return (
        <span key={i} style={{ color }}>
          {char}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BASE_BG,
        padding: "2rem",
        fontFamily: "Arial",
        color: "black"
      }}
    >
      {!showArticle && (
        <div style={{ textAlign: "center" }}>
          <h1>Reading Easy</h1>
          <label>
            Session Number (1–13):
            <input
              type="number"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(Number(e.target.value))}
              min={1}
              max={13}
              style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
            />
          </label>
          <br />
          <textarea
            rows={10}
            cols={60}
            placeholder="Paste your article text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ marginTop: "1rem", padding: "0.5rem" }}
          />
          <br />
          <button onClick={handleStart} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Show Article
          </button>
        </div>
      )}

      {showArticle && (
        <div style={{ maxWidth: "800px", margin: "2rem auto", fontSize: "1.2rem", lineHeight: "1.6" }}>
          {getColoredText(inputText)}
        </div>
      )}
    </div>
  );
}
