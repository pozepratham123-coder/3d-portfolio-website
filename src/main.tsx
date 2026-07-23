// main.tsx — React application entry point.
// Mounts the root <App /> component into the #root div in index.html.
// StrictMode renders components twice in development to catch side-effects.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // Global styles (CSS variables, body/reset, font imports)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
