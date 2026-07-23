// App.tsx — Root component that defines client-side routes and wraps the app
// with Vercel Analytics/SpeedInsights (passive, no UI impact).
//
// Routes:
//   /         → Main portfolio page with 3D character + all sections
//   /myworks  → Full project gallery page
//   /play     → Interactive chess + AI chat page
//
// All three page components are lazy-loaded (code-split) so the initial JS
// bundle stays small — each chunk is only downloaded when that route is visited.

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

// Lazy imports → each becomes a separate JS chunk in the build output
const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Play = lazy(() => import("./pages/Play"));

// LoadingProvider manages the global loading screen state and must wrap
// the home route so the 3D character can report its load progress.
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Home route ────────────────────────────────────────────────────
            LoadingProvider shows a loading screen until the 3D model is ready.
            CharacterModel (the Three.js canvas) is passed as a child prop so
            MainContainer can place it inside the correct DOM container while
            the rest of the page sections scroll beneath it.                  */}
        <Route
          path="/"
          element={
            <LoadingProvider>
              {/* fallback={null} → loading screen is handled by LoadingProvider,
                  not by a Suspense fallback, so we don't show a double loader  */}
              <Suspense fallback={null}>
                <MainContainer>
                  <Suspense fallback={null}>
                    <CharacterModel />
                  </Suspense>
                </MainContainer>
              </Suspense>
            </LoadingProvider>
          }
        />

        {/* ── All Works page ────────────────────────────────────────────── */}
        <Route
          path="/myworks"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MyWorks />
            </Suspense>
          }
        />

        {/* ── Play / Chess + Chat page ──────────────────────────────────── */}
        <Route
          path="/play"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Play />
            </Suspense>
          }
        />

      </Routes>

      {/* Vercel Analytics — tracks page views (no config needed) */}
      <Analytics />
      {/* Vercel Speed Insights — measures Core Web Vitals automatically */}
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
