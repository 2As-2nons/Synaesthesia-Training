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

const getColor = (char) => {
  const entry = LETTERS.find(l => l.letter === char.toLowerCase());
  return entry ? `rgb(${entry.rgb.join(",")})` : null;
};

export default function BookHomework() {
  const [input, setInput] = useState("");

  const renderColoredText = () => {
    return input.split("\n").map((line, idx) => (
      <div key={idx} style={{ marginBottom: "0.5em" }}>
        {line.split("").map((char, i) => {
          const color = getColor(char);
          return (
            <span key={i} style={{ color: color || "black" }}>
              {char}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div style={{ padding: 20, fontFamily: "serif" }}>
      <h2>Book Homework Generator</h2>
      <p>Paste your Project Gutenberg text below. Letters associated with colors will be highlighted.</p>
      <textarea
        rows={10}
        cols={80}
        placeholder="Paste book text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc", maxHeight: 400, overflowY: "scroll" }}>
        {renderColoredText()}
      </div>
    </div>
  );
}
