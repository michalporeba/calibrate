import { CalibrationPage } from "./pages/CalibrationPage";
import { Route, Routes } from "react-router-dom";
import { ExplorePage } from "./pages/ExplorePage";
import { LandingPage } from "./pages/LandingPage";
import { LearnPage } from "./pages/LearnPage";
import { StartConfirmPage } from "./pages/StartConfirmPage";
import { StartConfigurePage } from "./pages/StartConfigurePage";
import { StartDetailsPage } from "./pages/StartDetailsPage";
import { StartPage } from "./pages/StartPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/start/:templateId" element={<StartDetailsPage />} />
      <Route path="/start/:templateId/configure/:step" element={<StartConfigurePage />} />
      <Route path="/start/:templateId/confirm" element={<StartConfirmPage />} />
      <Route path="/calibrations/new/:templateId" element={<CalibrationPage />} />
      <Route path="/explore" element={<ExplorePage />} />
    </Routes>
  );
}
