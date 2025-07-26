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
const TOTAL_TRIALS = 20;

export default function EarlySpanGame() {
  const [phase, setPhase] = useState("idle");
  const [trialIndex, setTrialIndex] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(1);
  const [letterSequence, setLetterSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showLetter, setShowLetter] = useState(true);
  const [squareOrder, setSquareOrder] = useState([]);
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
    setLetterSequence(sequence);
    setDisplayIndex(0);
    setShowLetter(true);
    setPhase("showing");
    setResponse([]);
    setFeedback(null);
  };

  useEffect(() => {
    if (phase === "showing" && displayIndex < letterSequence.length) {
      const timer = setTimeout(() => {
        setShowLetter(!showLetter);
        if (!showLetter) setDisplayIndex(displayIndex + 1);
      }, showLetter ? DISPLAY_TIME : GAP_TIME);
      return () => clearTimeout(timer);
    }
    if (phase === "showing" && displayIndex >= letterSequence.length) {
      setTimeout(() => setPhase("respond"), RESPOND_DELAY);
      const shuffledSquares = [...LETTERS].sort(() => 0.5 - Math.random());
      setSquareOrder(shuffledSquares);
    }
  }, [phase, displayIndex, showLetter]);

  const handleSquareClick = (letter) => {
    if (phase !== "respond") return;
    setResponse((prev) => {
      const updated = [...prev, letter];
      if (updated.length === letterSequence.length) {
        const correct = updated.every((l, i) => l.letter === letterSequence[i].letter);
        setFeedback(correct);
        setLengthHistory((prevHist) => [...prevHist, letterSequence.length]);
        const nextLength = correct
          ? Math.min(letterSequence.length + 1, LETTERS.length)
          : Math.max(1, letterSequence.length - 1);
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
          <h1>Early Span</h1>
          <button
            onClick={startSession}
            style={{ fontSize: "1.5rem", padding: "1rem 2rem" }}
          >
            Start Session
          </button>
        </>
      )}

      {phase === "showing" && displayIndex < letterSequence.length && (
        <div
          style={{
            fontSize: "15rem",
            fontWeight: "bold",
            color: showLetter ? rgbCss(letterSequence[displayIndex].rgb) : BASE_BG
          }}
        >
          {letterSequence[displayIndex].letter}
        </div>
      )}

      {phase === "respond" && (
        <>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>Respond</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {squareOrder.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSquareClick(item)}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: rgbCss(item.rgb),
                  border: "2px solid black",
                  cursor: "pointer"
                }}
                aria-label={`Square ${item.letter}`}
              />
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
