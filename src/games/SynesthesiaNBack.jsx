import React, { useState, useEffect, useRef } from "react";

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

const getColorFromLetter = (letter) => {
  const found = LETTERS.find((l) => l.letter === letter.toLowerCase());
  return found ? `rgb(${found.rgb.join(",")})` : null;
};

const generateTrial = () => {
  const isLetter = Math.random() < 0.5;
  if (isLetter) {
    const { letter } = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return { type: "letter", value: letter };
  } else {
    const { rgb } = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return { type: "color", value: `rgb(${rgb.join(",")})` };
  }
};

export default function SynesthesiaNBack() {
  const [nBack, setNBack] = useState(1);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [trialIndex, setTrialIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timeoutRef = useRef(null);

  const handleStart = () => {
    setStarted(true);
    setScore({ correct: 0, total: 0 });
    setHistory([]);
    setTrialIndex(0);
    setFeedback(null);
    setCurrentTrial(null);
  };

  const advanceTrial = () => {
    const trial = generateTrial();
    setCurrentTrial(trial);
    setTrialIndex((prev) => prev + 1);
    setHistory((prev) => [...prev, trial]);
  };

  const handleKeyDown = (e) => {
    if (e.code !== "Space") return;
    if (trialIndex <= nBack) return;
    const match = checkMatch(currentTrial, history[trialIndex - nBack]);
    setScore((prev) => ({
      correct: prev.correct + (match ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const checkMatch = (current, past) => {
    if (!current || !past) return false;
    if (current.type === past.type) {
      return current.value === past.value;
    } else {
      const curColor = current.type === "color" ? current.value : getColorFromLetter(current.value);
      const pastColor = past.type === "color" ? past.value : getColorFromLetter(past.value);
      return curColor === pastColor;
    }
  };

  useEffect(() => {
    if (!started || trialIndex >= 50) {
      if (trialIndex >= 50) {
        const percent = (score.correct / score.total) * 100;
        setFeedback(`Score: ${score.correct}/${score.total} (${percent.toFixed(1)}%)`);
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      advanceTrial();
    }, 3000); // 1s display + 2s gap

    return () => clearTimeout(timeoutRef.current);
  }, [trialIndex, started]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrial, history]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "#ece5ce", minHeight: "100vh" }}>
      {!started ? (
        <div>
          <h1>Synesthesia N-Back</h1>
          <label>
            N Level:
            <input
              type="number"
              min={1}
              max={10}
              value={nBack}
              onChange={(e) => setNBack(Number(e.target.value))}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
          <br />
          <button onClick={handleStart} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Start
          </button>
        </div>
      ) : trialIndex < 50 ? (
        <div>
          <h2>Trial {trialIndex + 1}/50</h2>
          <div style={{ margin: "3rem auto", fontSize: "3rem" }}>
            {currentTrial?.type === "letter" ? (
              <span>{currentTrial.value.toUpperCase()}</span>
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "auto",
                  backgroundColor: currentTrial ? currentTrial.value : "transparent"
                }}
              />
            )}
          </div>
          <p>Press SPACE if this matches the {nBack}-back stimulus.</p>
        </div>
      ) : (
        <div>
          <h2>Session Complete</h2>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
}
