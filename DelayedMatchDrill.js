import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Late Delayed Match‑to‑Sample (L‑DMTS) with Active Matching
 * – **Randomised trial order** –
 *
 * Difference from previous version: instead of traversing the letters in a
 * fixed alphabetical loop, every single trial (letter‑colour pair) is
 * shuffled. Participants therefore cannot anticipate which letter (and thus
 * which colour) will appear next.
 */

export default function PassiveDrillGame() {
  // ──────────────────────────────────────────────────────────
  // 1. Letter → colour mapping
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
  const BASE_BG = "rgb(196 188 150)"; // light beige
  const BLACK   = "rgb(0 0 0)";

  // ──────────────────────────────────────────────────────────
  // 2. State
  const [phase, setPhase] = useState("idle");
  const [current, setCurrent] = useState(null);
  const [bg, setBg] = useState(BASE_BG);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const seqRef   = useRef([]);  // trial sequence (shuffled)
  const idxRef   = useRef(0);
  const timerRef = useRef(null);

  // ──────────────────────────────────────────────────────────
  // 3. Utility helpers
  const rgbCss = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

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
    // build the first pass with variable repetitions
    LETTERS.forEach((item) => {
      const reps = Math.floor(Math.random() * 1); // 3–10
      for (let i = 0; i < reps; i++) block.push(item);
    });
    // duplicate to approximate original block length (2×) & shuffle the full set
    return shuffle(block.concat(block));
  };

  const clearTimer = () => timerRef.current && clearTimeout(timerRef.current);

  // ──────────────────────────────────────────────────────────
  // 4. Flow control
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

  // ──────────────────────────────────────────────────────────
  // 5. Sequencing effect
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

  // ──────────────────────────────────────────────────────────
  // 6. Handling a choice
  const handleChoose = (choiceRgb) => {
    setScore((prev) => ({
      correct: prev.correct + (choiceRgb.join() === current.rgb.join() ? 1 : 0),
      total: prev.total + 1,
    }));
    setPhase("feedback");
  };

  // ──────────────────────────────────────────────────────────
  // 7. Option grid element
  const ColourSquare = ({ colour, onClick }) => (
    <button
      onClick={onClick}
      className="h-20 w-20 rounded border border-black"
      style={{ backgroundColor: rgbCss(colour) }}
    />
  );

  // ──────────────────────────────────────────────────────────
  // 8. Render
  return (
    <motion.div
      className="flex h-screen w-screen items-center justify-center p-4"
      animate={{ backgroundColor: bg }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: bg }}
    >
      {phase === "idle" && (
        <Button size="lg" className="text-xl" onClick={startBlock}>
          Start
        </Button>
      )}

      {phase === "letter" && (
        <span
          className="select-none text-[40vmin] font-bold"
          style={{ color: BLACK }}
        >
          {current?.letter}
        </span>
      )}

      {phase === "options" && (
        <div className="grid max-w-[600px] grid-cols-4 gap-4">
          {LETTERS.map(({ rgb, letter }) => (
            <ColourSquare key={letter} colour={rgb} onClick={() => handleChoose(rgb)} />
          ))}
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-semibold">Block complete!</p>
          <p>
            You answered {score.correct} / {score.total} correctly.
          </p>
          <Button onClick={startBlock}>Restart</Button>
        </div>
      )}
    </motion.div>
  );
}
