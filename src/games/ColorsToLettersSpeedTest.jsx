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
const TOTAL_TRIALS = 100;
const GAP_DELAY = 250;

export default function ColorsToLettersSpeedTest() {
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [phase, setPhase] = useState("idle");

  const rgbCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

  const startSession = () => {
    setTrialIndex(0);
    setReactionTimes([]);
    setPhase("trial");
    startTrial();
  };

  const startTrial = () => {
    const next = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setCurrentColor(next);
    setStartTime(Date.now());
  };

  const handleClick = (letter) => {
    if (!currentColor || phase !== "trial") return;
    const isCorrect = letter === currentColor.letter;
    const rt = Date.now() - startTime;

    if (isCorrect) {
      setReactionTimes((prev) => [...prev, rt]);
      setFeedback(`Correct: ${rt} ms`);
    } else {
      setFeedback("Incorrect");
    }

    setTimeout(() => {
      setFeedback(null);
      if (trialIndex + 1 >= TOTAL_TRIALS) {
        setPhase("done");
      } else {
        setTrialIndex((i) => i + 1);
        setTimeout(startTrial, GAP_DELAY);
      }
    }, 500);
  };

  const averageTime =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

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
          <h1>Colors to Letters Speed Test</h1>
          <button
            onClick={startSession}
            style={{ fontSize: "1.5rem", padding: "1rem 2rem" }}
          >
            Start Session
          </button>
        </>
      )}

      {phase === "trial" && currentColor && (
        <>
          <div
            style={{
              width: 150,
              height: 150,
              backgroundColor: rgbCss(currentColor.rgb),
              marginBottom: "4rem",
              border: "4px solid black"
            }}
          ></div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
            {LETTERS.sort((a, b) => a.letter.localeCompare(b.letter)).map(({ letter }, i) => (
              <button
                key={i}
                onClick={() => handleClick(letter)}
                style={{
                  width: 60,
                  height: 60,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </>
      )}

      {feedback && (
        <div style={{ marginTop: "2rem", fontSize: "1.2rem" }}>{feedback}</div>
      )}

      {phase === "done" && (
        <>
          <h2>Session Complete</h2>
          <p>Average correct response time: {averageTime} ms</p>
          <button onClick={() => setPhase("idle")} style={{ padding: "0.5rem 1rem" }}>
            Restart Session
          </button>
        </>
      )}
    </div>
  );
}
