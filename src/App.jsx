import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import AdvancedSpanGame from "./games/AdvancedSpanGame";
import BackwardSpanCanvas from "./games/BackwardSpanCanvas";
import BookHomework from "./games/BookHomework";
import ColorsToLettersSpeedTest from "./games/ColorsToLettersSpeedTest";
import DelayedMatch from "./games/DelayedMatch";
import EarlyMatchGame from "./games/EarlyMatchGame";
import EarlySpanGame from "./games/EarlySpanGame";
import LateSpanGame from "./games/LateSpanGame";
import LettersToColorsSpeedTest from "./games/LettersToColorsSpeedTest";
import PassiveDrill from "./games/PassiveDrill";
import ReadingAdvanced from "./games/ReadingAdvanced";
import ReadingEasy from "./games/ReadingEasy";
import SpellingTaskCanvas from "./games/SpellingTaskCanvas";
import SynesthesiaNBack from "./games/SynesthesiaNBack";

const games = [
  { path: "/advanced-span", name: "Advanced Span", Component: AdvancedSpanGame },
  { path: "/backward-span", name: "Backward Span", Component: BackwardSpanCanvas },
  { path: "/book-homework", name: "Book Homework", Component: BookHomework },
  { path: "/colors-to-letters", name: "Colors to Letters Speed Test", Component: ColorsToLettersSpeedTest },
  { path: "/delayed-match", name: "Delayed Match", Component: DelayedMatch },
  { path: "/early-match", name: "Early Match", Component: EarlyMatchGame },
  { path: "/early-span", name: "Early Span", Component: EarlySpanGame },
  { path: "/late-span", name: "Late Span", Component: LateSpanGame },
  { path: "/letters-to-colors", name: "Letters to Colors Speed Test", Component: LettersToColorsSpeedTest },
  { path: "/passive-drill", name: "Passive Drill", Component: PassiveDrill },
  { path: "/reading-advanced", name: "Reading Advanced", Component: ReadingAdvanced },
  { path: "/reading-easy", name: "Reading Easy", Component: ReadingEasy },
  { path: "/spelling-task", name: "Spelling Task", Component: SpellingTaskCanvas },
  { path: "/n-back", name: "Synesthesia N-Back", Component: SynesthesiaNBack },
];

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home games={games} />} />
        {games.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </Router>
  );
}
