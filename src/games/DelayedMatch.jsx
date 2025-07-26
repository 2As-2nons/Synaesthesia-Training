import React, { useState, useEffect, useRef } from "react";

export default function DelayedMatch() {
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

  const BASE_BG = "rgb(196, 188, 150)";
  const BLACK = "rgb(0, 0, 0)";

  const [phase, setPhase] = useState("idle");
  const [current, setCurrent] = useState(null);
  const [bg, setBg] = useState(BASE_BG);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const seqRef = useRef([]);
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  const rgbCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const buildSequence = () => {
    const block = [];
    LETTERS.forEach((item) => {
      const reps = Math.floor(Math.random() * 1) + 1;
      for (let i = 0; i < reps; i++) block.push(item);
    });
    return shuffle(block.concat(block));
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
    setScore({ correct: 0, total: 0 });
    setCurrent(seqRef.current[0]);
    setPhase("letter");
    setBg(BASE_BG);
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
    setPhase("letter");
    setBg(BASE_BG);
  };

  useEffect(() => {
    clearTimer();
    if (!current) return;

    if (phase === "letter") {
      timerRef.current = setTimeout(() => setPhase("options"), 1000);
    } else if (phase === "feedback") {
      setBg(rgbCss(current.rgb));
      timerRef.current = setTimeout(nextStep, 500);
    }

    return clearTimer;
  }, [phase, current]);

  const handleChoose = (choiceRgb) => {
    setScore((prev) => ({
      correct: prev.correct + (choiceRgb.join() === current.rgb.join() ? 1 : 0),
      total: prev.total + 1,
    }));
    setPhase("feedback");
  };

  const ColourSquare = ({ colour, onClick }) => (
    <button
      onClick={onClick}
      style={{
        backgroundColor: rgbCss(colour),
        height: "60px",
        width: "60px",
        borderRadius: "0.5rem",
        border: "2px solid black",
        cursor: "pointer",
      }}
    />
  );

  return (
    <div
      style={{
        backgroundColor: bg,
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "sans-serif",
        transition: "background-color 0.3s ease",
      }}
    >
      {phase === "idle" && (
        <button
          onClick={startBlock}
          style={{
            padding: "1em 2em",
            fontSize: "1.2rem",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Start
        </button>
      )}

      {phase === "letter" && current && (
        <span
          style={{
            fontSize: "20vmin",
            fontWeight: "bold",
            color: BLACK,
          }}
        >
          {current.letter}
        </span>
      )}

      {phase === "options" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
            gap: "1rem",
            maxWidth: "500px",
          }}
        >
          {LETTERS.map(({ rgb, letter }) => (
            <ColourSquare key={letter} colour={rgb} onClick={() => handleChoose(rgb)} />
          ))}
        </div>
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Block complete!</p>
          <p>
            You answered {score.correct} out of {score.total} correctly.
          </p>
          <button
            onClick={startBlock}
            style={{
              marginTop: "1rem",
              padding: "0.8em 1.5em",
              fontSize: "1rem",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "0.5em",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
