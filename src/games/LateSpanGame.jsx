import React, { useState, useEffect } from "react";

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
const DISPLAY_TIME = 500;
const GAP_TIME = 250;
const RESPOND_DELAY = 500;
const TOTAL_TRIALS = 3;

export default function LateSpanGame() {
  const [phase, setPhase] = useState("idle");
  const [trialIndex, setTrialIndex] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(1);
  const [colorSequence, setColorSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showSquare, setShowSquare] = useState(true);
  const [letterOrder, setLetterOrder] = useState([]);
  const [response, setResponse] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [lengthHistory, setLengthHistory] = useState([]);

  const rgbCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

  const startSession = () => {
    setPhase("showing");
    setTrialIndex(0);
    setSequenceLength(1);
    setLengthHistory([]);
    startTrial(1);
  };

  const startTrial = (length) => {
    const shuffled = [...LETTERS].sort(() => 0.5 - Math.random());
    const sequence = shuffled.slice(0, length);
    setColorSequence(sequence);
    setDisplayIndex(0);
    setShowSquare(true);
    setPhase("showing");
    setResponse([]);
    setFeedback(null);
  };

  useEffect(() => {
    if (phase === "showing" && displayIndex < colorSequence.length) {
      const timer = setTimeout(() => {
        setShowSquare(!showSquare);
        if (!showSquare) setDisplayIndex(displayIndex + 1);
      }, showSquare ? DISPLAY_TIME : GAP_TIME);
      return () => clearTimeout(timer);
    }
    if (phase === "showing" && displayIndex >= colorSequence.length) {
      setTimeout(() => setPhase("respond"), RESPOND_DELAY);
      const alphabetical = [...LETTERS].sort((a, b) => a.letter.localeCompare(b.letter));
      setLetterOrder(alphabetical);
    }
  }, [phase, displayIndex, showSquare]);

  const handleLetterClick = (letter) => {
    if (phase !== "respond") return;
    setResponse((prev) => {
      const updated = [...prev, letter];
      if (updated.length === colorSequence.length) {
        const correct = updated.every((l, i) => l.letter === colorSequence[i].letter);
        setFeedback(correct);
        setLengthHistory((prevHist) => [...prevHist, colorSequence.length]);
        const nextLength = correct
          ? Math.min(colorSequence.length + 1, LETTERS.length)
          : Math.max(1, colorSequence.length - 1);
        setTimeout(() => {
          if (trialIndex + 1 >= TOTAL_TRIALS) {
            setPhase("done");
          } else {
            setTrialIndex((i) => i + 1);
            setSequenceLength(nextLength);
            startTrial(nextLength);
          }
        }, 1500);
      }
      return updated;
    });
  };

  const averageLength =
    lengthHistory.length > 0
      ? Math.floor(lengthHistory.reduce((a, b) => a + b, 0) / lengthHistory.length)
      : 1;

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: BASE_BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
        padding: "1rem"
      }}
    >
      {phase === "idle" && (
        <>
          <h1>Late Span</h1>
          <button
            onClick={startSession}
            style={{ fontSize: "1.5rem", padding: "1rem 2rem" }}
          >
            Start Session
          </button>
        </>
      )}

      {phase === "showing" && displayIndex < colorSequence.length && (
        <div
          style={{
            width: 150,
            height: 150,
            backgroundColor: showSquare ? rgbCss(colorSequence[displayIndex].rgb) : BASE_BG,
            border: "3px solid black"
          }}
        ></div>
      )}

      {phase === "respond" && (
        <>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>Select the letters</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {letterOrder.map((item, i) => (
              <button
                key={i}
                onClick={() => handleLetterClick(item)}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: "black",
                  color: "white",
                  fontSize: "1.5rem",
                  border: "2px solid white",
                  cursor: "pointer"
                }}
                aria-label={`Letter ${item.letter}`}
              >
                {item.letter.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}

      {feedback != null && (
        <div style={{ marginTop: "1rem", fontSize: "1.5rem" }}>
          {feedback ? "Correct!" : "Incorrect"}
        </div>
      )}

      {phase === "done" && (
        <>
          <h2>Session Complete</h2>
          <p>Average sequence length: {averageLength}</p>
          <button onClick={() => setPhase("idle")} style={{ padding: "0.5rem 1rem" }}>
            Restart Session
          </button>
        </>
      )}
    </div>
  );
}
