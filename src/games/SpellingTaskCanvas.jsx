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

export default function SpellingTaskCanvas() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [trialIndex, setTrialIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [currentWord, setCurrentWord] = useState([]);
  const [showingPrompt, setShowingPrompt] = useState(false);
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [buttons, setButtons] = useState([]);

  const generateWord = () => {
    let length;
    switch (difficulty) {
      case 1: length = Math.floor(Math.random() * 2) + 2; break;
      case 2: length = 4; break;
      case 3: length = 5; break;
      case 4: length = Math.floor(Math.random() * 2) + 6; break;
      default: length = 3;
    }
    return shuffle(LETTERS).slice(0, length).map(l => l.letter);
  };

  const beginTrial = () => {
    const word = generateWord();
    setCurrentWord(word);
    setResponse([]);
    setFeedback(null);
    setShowingPrompt(true);
    setResponding(false);

    setTimeout(() => {
      setShowingPrompt(false);
      setResponding(true);
    }, 500);
  };

  const nextTrial = (correct) => {
    if (correct) setCorrectCount(prev => prev + 1);
    if (trialIndex + 1 >= 20) {
      const accuracy = ((correctCount + (correct ? 1 : 0)) / 20) * 100;
      if (accuracy >= 90 && difficulty < 4) setDifficulty(difficulty + 1);
      setStarted(false);
      setTrialIndex(0);
      setCorrectCount(0);
    } else {
      setTrialIndex(t => t + 1);
      beginTrial();
    }
  };

  const drawCanvas = () => {
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
      ctx.fillText("Click to start Spelling Task", canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Current difficulty level: ${difficulty}`, canvas.width / 2, canvas.height / 2 + 30);
      return;
    }

    if (showingPrompt) {
      const startX = canvas.width / 2 - (currentWord.length * 50) / 2;
      const y = 100;
      currentWord.forEach((ltr, i) => {
        const color = LETTERS.find(l => l.letter === ltr).rgb;
        ctx.fillStyle = `rgb(${color.join(",")})`;
        ctx.fillRect(startX + i * 50, y, 40, 40);
      });
    } else if (responding) {
      ctx.fillStyle = "black";
      ctx.fillText("Click the letters to spell the word", canvas.width / 2, 60);

      const sorted = LETTERS.map(l => l.letter).sort();
      const btns = [];
      const startX = canvas.width / 2 - (sorted.length * 45) / 2;
      const y = canvas.height - 100;
      ctx.font = "30px Arial";

      sorted.forEach((ltr, i) => {
        const x = startX + i * 45;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 40, 40);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, 40, 40);
        ctx.fillStyle = "black";
        ctx.fillText(ltr.toUpperCase(), x + 20, y + 25);
        btns.push({ letter: ltr, x, y, w: 40, h: 40 });
      });

      setButtons(btns);

      ctx.fillStyle = "black";
      ctx.fillText(`Your response: ${response.join("").toUpperCase()}`, canvas.width / 2, y - 50);
      if (feedback) {
        ctx.fillStyle = feedback === "Correct!" ? "green" : "red";
        ctx.fillText(feedback, canvas.width / 2, y + 60);
      }
    }
  };

  useEffect(drawCanvas, [started, showingPrompt, responding, currentWord, response, feedback]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!started) {
      setStarted(true);
      beginTrial();
      return;
    }

    if (!responding) return;

    for (const btn of buttons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        const newResp = [...response, btn.letter];
        setResponse(newResp);
        if (newResp.length === currentWord.length) {
          const correct = newResp.every((ltr, i) => ltr === currentWord[i]);
          setFeedback(correct ? "Correct!" : "Incorrect!");
          setTimeout(() => nextTrial(correct), 1000);
        }
        break;
      }
    }
  };

  return <canvas ref={canvasRef} width={800} height={400} onClick={handleClick} style={{ border: "1px solid black" }} />;
}
