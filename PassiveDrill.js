import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Passive Drill Game – replicates the training block described in Table s2.
 *
 * HOW IT WORKS
 * 1. Click "Start" to generate a randomized training block.
 * 2. Each letter appears in its associated colour for 1 s.
 * 3. The whole screen then shows that colour (no letter) for 0.5 s.
 * 4. Each letter is repeated 3–10× (random) before moving to the next letter in alphabetical order.
 * 5. The entire 13‑letter sequence is run twice (~4 min total).
 * 6. When finished, a "Restart" button appears so you can repeat the block.
 */

export default function PassiveDrillGame() {
  // ----- Colour & letter data  ---------------------------------------------
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

  // ----- State --------------------------------------------------------------
  const [phase, setPhase] = useState("idle"); // idle ▸ showLetter ▸ showColour ▸ done
  const [current, setCurrent] = useState(null); // {letter,rgb}
  const [bg, setBg] = useState(BASE_BG);
  const seqRef = useRef([]); // full training sequence (twice through)
  const idxRef = useRef(0); // current index in seqRef
  const timerRef = useRef(null);

  // ----- Helpers ------------------------------------------------------------
  const rgbCss = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

  const buildSequence = () => {
    const seq = [];
    LETTERS.forEach((item) => {
      const reps = Math.floor(Math.random() * 2) + 3; // 3–10
      for (let i = 0; i < reps; i += 1) seq.push(item);
    });
    return seq.concat(seq); // repeat entire list twice
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
    setPhase("showLetter");
    setCurrent(seqRef.current[0]);
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
    setPhase("showLetter");
    setBg(BASE_BG);
  };

  // ----- Main sequencing effect -------------------------------------------
  useEffect(() => {
    clearTimer();

    if (phase === "showLetter" && current) {
      // Show the coloured letter for 1 s
      setBg(BASE_BG);
      timerRef.current = setTimeout(() => setPhase("showColour"), 1000);
    } else if (phase === "showColour" && current) {
      // Show the full‑screen colour for 0.5 s
      setBg(rgbCss(current.rgb));
      timerRef.current = setTimeout(nextStep, 500);
    }
    return clearTimer; // cleanup on unmount / re‑render
  }, [phase, current]);

  // ----- Render ------------------------------------------------------------
  return (
    <motion.div
      className="flex h-screen w-screen items-center justify-center" // full viewport
      animate={{ backgroundColor: bg }}
      transition={{ duration: 0.2 }}
      style={{ backgroundColor: bg }}
    >
      {phase === "idle" && (
        <Button size="lg" className="text-xl" onClick={startBlock}>
          Start
        </Button>
      )}

      {(phase === "showLetter" || phase === "showColour") && (
        <motion.span
          key={phase === "showLetter" ? current?.letter : ""}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="select-none text-[40vmin] font-bold"
          style={{ color: rgbCss(current?.rgb ?? [0, 0, 0]) }}
        >
          {phase === "showLetter" ? current?.letter : ""}
        </motion.span>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl font-semibold">Block complete!</p>
          <Button onClick={startBlock}>Restart</Button>
        </div>
      )}
    </motion.div>
  );
}
