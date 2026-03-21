import { Route, Routes } from "react-router-dom";
import { ExplorePage } from "./pages/ExplorePage";
import { LandingPage } from "./pages/LandingPage";
import { LearnPage } from "./pages/LearnPage";
import { StartPage } from "./pages/StartPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/explore" element={<ExplorePage />} />
    </Routes>
  );
}

