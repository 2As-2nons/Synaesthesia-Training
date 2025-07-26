import React, { useRef, useState, useEffect } from "react";

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

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function BackwardSpanCanvas() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [trialIndex, setTrialIndex] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [showing, setShowing] = useState(false);
  const [responding, setResponding] = useState(false);
  const [letterIndex, setLetterIndex] = useState(0);
  const [response, setResponse] = useState([]);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [speed, setSpeed] = useState(500);
  const letterButtons = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ece5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Trial ${trialIndex + 1}/20`, canvas.width / 2, 30);

    if (!started) {
      ctx.fillText("Click to start the Backward Span task", canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Set Speed (ms): ${speed}`, canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillText("Use Up/Down Arrow Keys to Adjust", canvas.width / 2, canvas.height / 2 + 60);
      if (results.length > 0) {
        const avg = Math.floor(results.reduce((a, b) => a + b, 0) / results.length);
        ctx.fillText(`Last session avg sequence length: ${avg}`, canvas.width / 2, canvas.height / 2 + 90);
      }
      return;
    }

    if (showing) {
      const current = currentSequence[letterIndex];
      if (current) {
        const color = LETTERS.find((l) => l.letter === current).rgb;
        ctx.fillStyle = `rgb(${color.join(",")})`;
        ctx.font = "100px Arial";
        ctx.fillText(current.toUpperCase(), canvas.width / 2, canvas.height / 2);
      }
    } else if (responding) {
      ctx.fillStyle = "black";
      ctx.font = "18px Arial";
      ctx.fillText("Click letters in REVERSE order", canvas.width / 2, 60);

      const sorted = LETTERS.map((l) => l.letter).sort();
      letterButtons.current = [];
      const startX = canvas.width / 2 - (sorted.length * 45) / 2;
      const y = canvas.height / 2;
      ctx.font = "30px Arial";

      sorted.forEach((ltr, i) => {
        const x = startX + i * 45;
        ctx.fillStyle = response.includes(ltr) ? "#bbb" : "white";
        ctx.fillRect(x, y, 40, 40);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, 40, 40);
        ctx.fillStyle = "black";
        ctx.fillText(ltr.toUpperCase(), x + 20, y + 25);
        letterButtons.current.push({ letter: ltr, x, y, w: 40, h: 40 });
      });

      if (feedback) {
        ctx.fillStyle = feedback === "Correct!" ? "green" : "red";
        ctx.fillText(feedback, canvas.width / 2, canvas.height - 50);
      }
    } else {
      ctx.fillText("Get ready for the next trial...", canvas.width / 2, canvas.height / 2);
    }
  }, [started, trialIndex, showing, responding, letterIndex, currentSequence, response, feedback, results, speed]);

  const nextTrial = (correct) => {
    const nextLength = Math.max(1, sequenceLength + (correct ? 1 : -1));
    setResults((prev) => [...prev, sequenceLength]);
    if (trialIndex + 1 >= 20) {
      setStarted(false);
      setTrialIndex(0);
      setSequenceLength(1);
    } else {
      setTrialIndex((t) => t + 1);
      setSequenceLength(nextLength);
      beginTrial(nextLength);
    }
  };

  const beginTrial = (length) => {
    const seq = shuffle(LETTERS).slice(0, length).map((l) => l.letter);
    setCurrentSequence(seq);
    setLetterIndex(0);
    setShowing(true);
    setResponding(false);
    setResponse([]);
    setFeedback(null);
  };

  useEffect(() => {
    if (!showing) return;
    if (letterIndex < currentSequence.length) {
      const timer = setTimeout(() => setLetterIndex((i) => i + 1), speed);
      return () => clearTimeout(timer);
    } else {
      const delay = setTimeout(() => {
        setShowing(false);
        setResponding(true);
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [letterIndex, showing, currentSequence, speed]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!started) {
      setStarted(true);
      beginTrial(1);
      return;
    }

    if (responding) {
      for (const btn of letterButtons.current) {
        if (
          x >= btn.x &&
          x <= btn.x + btn.w &&
          y >= btn.y &&
          y <= btn.y + btn.h
        ) {
          if (!response.includes(btn.letter) && response.length < currentSequence.length) {
            const newResp = [...response, btn.letter];
            setResponse(newResp);
            if (newResp.length === currentSequence.length) {
              const reversed = [...currentSequence].reverse();
              const correct = newResp.every((ltr, i) => ltr === reversed[i]);
              setFeedback(correct ? "Correct!" : "Incorrect!");
              setTimeout(() => {
                setResponding(false);
                nextTrial(correct);
              }, 1000);
            }
          }
          break;
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!started) {
      if (e.key === "ArrowUp") {
        setSpeed((s) => Math.min(s + 100, 2000));
      } else if (e.key === "ArrowDown") {
        setSpeed((s) => Math.max(s - 100, 100));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <canvas ref={canvasRef} width={800} height={400} onClick={handleClick} style={{ border: "1px solid black" }} />;
}
