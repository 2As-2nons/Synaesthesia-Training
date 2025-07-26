import React, { useState, useEffect, useRef } from "react";

// --- Letter-Color Mapping
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
  { letter: "y", rgb: [255, 255, 0] },
];

const BASE_BG = "rgb(196, 188, 150)"; // light beige

export default function PassiveDrill() {
  const [phase, setPhase] = useState("idle"); // idle ▸ showLetter ▸ showColour ▸ done
  const [current, setCurrent] = useState(null); // current letter object
  const [bg, setBg] = useState(BASE_BG);

  const seqRef = useRef([]);
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  const rgbCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

  const buildSequence = () => {
    const seq = [];
    LETTERS.forEach((item) => {
      const reps = Math.floor(Math.random() * 8) + 3; // 3–10
      for (let i = 0; i < reps; i++) seq.push(item);
    });
    return [...seq, ...seq]; // repeat sequence twice
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startBlock = () => {
    seqRef.current = buildSequence();
    idxRef.current = 0;
    setCurrent(seqRef.current[0]);
    setBg(BASE_BG);
    setPhase("showLetter");
  };

  const nextStep = () => {
    idxRef.current += 1;
    if (idxRef.current >= seqRef.current.length) {
      setPhase("done");
      setCurrent(null);
      setBg(BASE_BG);
      return;
    }
    setCurrent(seqRef.current[idxRef.current]);
    setBg(BASE_BG);
    setPhase("showLetter");
  };

  useEffect(() => {
    clearTimer();

    if (phase === "showLetter" && current) {
      setBg(BASE_BG);
      timerRef.current = setTimeout(() => setPhase("showColour"), 1000);
    } else if (phase === "showColour" && current) {
      setBg(rgbCss(current.rgb));
      timerRef.current = setTimeout(nextStep, 500);
    }

    return clearTimer;
  }, [phase, current]);

  return (
    <div
      style={{
        backgroundColor: bg,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial",
      }}
    >
      {phase === "idle" && (
        <button
          style={{
            padding: "1em 2em",
            fontSize: "1.2rem",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "0.5em",
            cursor: "pointer",
          }}
          onClick={startBlock}
        >
          Start
        </button>
      )}

      {(phase === "showLetter" || phase === "showColour") && (
        <div
          style={{
            fontSize: "20vmin",
            fontWeight: "bold",
            color: phase === "showLetter" && current ? rgbCss(current.rgb) : "transparent",
            transition: "color 0.3s ease",
          }}
        >
          {phase === "showLetter" && current?.letter}
        </div>
      )}

      {phase === "done" && (
        <>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>Block complete!</p>
          <button
            style={{
              padding: "0.8em 1.5em",
              fontSize: "1rem",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "0.5em",
              cursor: "pointer",
            }}
            onClick={startBlock}
          >
            Restart
          </button>
        </>
      )}
    </div>
  );
}
