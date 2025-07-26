import React, { useState, useEffect } from "react";

export default function EarlyMatchGame() {
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
  const LETTER_DISPLAY_TIME = 1500;
  const DELAY_TIME = 3000;
  const RESPONSE_TIME = 4000;
  const TOTAL_TRIALS = 30;
  const SQUARE_SIZE = 100;

  const [phase, setPhase] = useState("idle");
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [foilSimilarity, setFoilSimilarity] = useState(() => {
    const obj = {};
    LETTERS.forEach(({ letter }) => {
      obj[letter] = 0.5;
    });
    return obj;
  });
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [responseTimeoutId, setResponseTimeoutId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [trialSequence, setTrialSequence] = useState([]);

  const rgbCss = (rgbArr) => {
    if (!rgbArr || rgbArr.length !== 3) return "rgb(0, 0, 0)";
    return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
  };

  const colorDistanceSq = (c1, c2) => {
    return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2;
  };

  const findMaxDistanceColor = (baseRgb) => {
    const corners = [
      [0, 0, 0],
      [0, 0, 255],
      [0, 255, 0],
      [0, 255, 255],
      [255, 0, 0],
      [255, 0, 255],
      [255, 255, 0],
      [255, 255, 255],
    ];
    let maxDist = -1;
    let maxColor = null;
    for (const corner of corners) {
      const dist = colorDistanceSq(baseRgb, corner);
      if (dist > maxDist) {
        maxDist = dist;
        maxColor = corner;
      }
    }
    return maxColor;
  };

  const lerpColor = (c1, c2, t) => {
    return c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
  };

  const getFoilColor = (baseRgb, similarity) => {
    const maxDistColor = findMaxDistanceColor(baseRgb);
    const t = 1 - similarity;
    return lerpColor(baseRgb, maxDistColor, t);
  };

  const buildTrialSequence = () => {
    const seq = [];
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const letterObj = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      seq.push(letterObj);
    }
    return seq;
  };

  const clearAllTimeouts = () => {
    if (responseTimeoutId) {
      clearTimeout(responseTimeoutId);
      setResponseTimeoutId(null);
    }
  };

  const startTrial = (trialIdx) => {
    clearAllTimeouts();
    setFeedback(null);
    const letterObj = trialSequence[trialIdx];
    setCurrentLetter(letterObj);
    setPhase("showLetter");
    setTimeout(() => setPhase("delay"), LETTER_DISPLAY_TIME);
  };

  useEffect(() => {
    if (phase === "delay") {
      const delayTimeout = setTimeout(() => setPhase("choice"), DELAY_TIME);
      return () => clearTimeout(delayTimeout);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "choice") {
      const timeoutId = setTimeout(() => {
        handleResponse(null);
      }, RESPONSE_TIME);
      setResponseTimeoutId(timeoutId);
      return () => clearTimeout(timeoutId);
    }
  }, [phase]);

  const handleResponse = (selectedRgb) => {
    clearAllTimeouts();
    if (!currentLetter) return;

    const correctRgb = currentLetter.rgb;
    const isCorrect =
      selectedRgb &&
      selectedRgb.length === 3 &&
      selectedRgb.every((v, i) => v === correctRgb[i]);

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setFoilSimilarity((prev) => {
      const oldSim = prev[currentLetter.letter] ?? 0.5;
      let newSim;
      if (isCorrect) {
        newSim = Math.min(0.95, oldSim + 0.2);
      } else {
        newSim = Math.max(0.05, oldSim - 0.2);
      }
      return { ...prev, [currentLetter.letter]: newSim };
    });

    setFeedback(isCorrect);
    setPhase("feedback");
  };

  useEffect(() => {
    if (phase === "feedback") {
      const fbTimeout = setTimeout(() => {
        if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
          setPhase("done");
        } else {
          setCurrentTrialIndex(currentTrialIndex + 1);
          setPhase("showLetter");
        }
      }, 1500);
      return () => clearTimeout(fbTimeout);
    }
  }, [phase, currentTrialIndex]);

  useEffect(() => {
    if (phase === "showLetter" && trialSequence.length > 0) {
      startTrial(currentTrialIndex);
    }
  }, [currentTrialIndex, phase, trialSequence]);

  const startSession = () => {
    setScore({ correct: 0, total: 0 });
    setFoilSimilarity(() => {
      const obj = {};
      LETTERS.forEach(({ letter }) => {
        obj[letter] = 0.5;
      });
      return obj;
    });
    const seq = buildTrialSequence();
    setTrialSequence(seq);
    setCurrentTrialIndex(0);
    setPhase("showLetter");
  };

  const ChoiceSquares = () => {
    if (!currentLetter) return null;
    const baseRgb = currentLetter.rgb;
    const similarity = foilSimilarity[currentLetter.letter] ?? 0.5;
    const foilRgb = getFoilColor(baseRgb, similarity);

    const correctSquare = {
      color: baseRgb,
      isCorrect: true,
    };
    const foilSquare = {
      color: foilRgb,
      isCorrect: false,
    };

    const leftFirst = Math.random() < 0.5;
    const leftSquare = leftFirst ? correctSquare : foilSquare;
    const rightSquare = leftFirst ? foilSquare : correctSquare;

    const borderStyle = (isCorrectSquare) => {
      if (phase !== "feedback" || feedback === null) return "2px solid black";
      if (feedback && isCorrectSquare) return "4px solid green";
      if (!feedback && isCorrectSquare) return "4px solid green";
      if (!feedback && !isCorrectSquare) return "4px solid red";
      return "2px solid black";
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "37.8px",
          marginTop: "30px",
        }}
      >
        <button
          onClick={() => phase === "choice" && handleResponse(leftSquare.color)}
          disabled={phase !== "choice"}
          style={{
            width: `${SQUARE_SIZE}px`,
            height: `${SQUARE_SIZE}px`,
            backgroundColor: rgbCss(leftSquare.color),
            border: borderStyle(leftSquare.isCorrect),
            cursor: phase === "choice" ? "pointer" : "default",
          }}
          aria-label={`Choice square left`}
          type="button"
        />
        <button
          onClick={() => phase === "choice" && handleResponse(rightSquare.color)}
          disabled={phase !== "choice"}
          style={{
            width: `${SQUARE_SIZE}px`,
            height: `${SQUARE_SIZE}px`,
            backgroundColor: rgbCss(rightSquare.color),
            border: borderStyle(rightSquare.isCorrect),
            cursor: phase === "choice" ? "pointer" : "default",
          }}
          aria-label={`Choice square right`}
          type="button"
        />
      </div>
    );
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: BASE_BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        userSelect: "none",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {phase === "idle" && (
        <>
          <h1 style={{ marginBottom: "1rem" }}>Early Delayed Match to Sample (E-DMTS)</h1>
          <button
            onClick={startSession}
            style={{
              fontSize: "1.5rem",
              padding: "1rem 2rem",
              cursor: "pointer",
              borderRadius: "8px",
              border: "2px solid black",
              backgroundColor: "white",
            }}
            type="button"
          >
            Start Session
          </button>
        </>
      )}

      {(phase === "showLetter" || phase === "delay") && currentLetter && (
        <div
          style={{
            fontSize: "15rem",
            fontWeight: "bold",
            color: phase === "showLetter" ? rgbCss(currentLetter.rgb) : BASE_BG,
            transition: "color 0.3s ease",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {currentLetter.letter}
        </div>
      )}

      {phase === "choice" && (
        <>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            Which color was that letter shown in?
          </div>
          <ChoiceSquares />
          <div style={{ marginTop: "1rem", fontSize: "1rem", color: "gray" }}>
            Click the square that matches the letter color. Time remaining: up to 4 seconds.
          </div>
        </>
      )}

      {phase === "feedback" && (
        <>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {feedback ? "Correct!" : "Incorrect"}
          </div>
          <ChoiceSquares />
        </>
      )}

      {phase === "done" && (
        <>
          <h2>Session Complete!</h2>
          <p style={{ fontSize: "1.2rem" }}>
            You got {score.correct} out of {score.total} correct.
          </p>
          <p>Average difficulty index (0.05 - 0.95) for all letters:</p>
          <ul style={{ listStyleType: "none", paddingLeft: 0, fontSize: "1rem" }}>
            {LETTERS.map(({ letter }) => (
              <li key={letter}>
                Letter "{letter.toUpperCase()}": {foilSimilarity[letter]?.toFixed(2)}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setPhase("idle")}
            style={{
              fontSize: "1.2rem",
              padding: "0.8rem 1.5rem",
              cursor: "pointer",
              borderRadius: "8px",
              border: "2px solid black",
              backgroundColor: "white",
              marginTop: "1rem",
            }}
            type="button"
          >
            Restart Session
          </button>
        </>
      )}
    </div>
  );
}