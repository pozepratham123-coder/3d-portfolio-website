// Landing.tsx — Full-viewport hero section (the very first thing visitors see).
//
// Layout (desktop):
//   Left side  → name (h1) + "Hello! I'm" greeting (h2)  [positioned via CSS]
//   Right side → job title lines animated by initialFX.ts [positioned via CSS]
//   Center     → 3D character model (rendered by Scene.tsx, not here)
//
// Layout (mobile):
//   The 3D model is hidden. A static PNG photo is shown instead (mobile-photo).
//   All positions switch from `absolute` to normal flow via Landing.css media queries.

import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";

const Landing = ({ children }: PropsWithChildren) => {
  // Split "Pratham Oza" into ["Pratham", "Oza"] to display on two lines
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      {/* id="landingDiv" used by Scene.tsx to attach touch event listeners */}
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">

          {/* ── Name block (top-left on desktop) ──────────────────────── */}
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {/* Last name rendered in a span for separate styling if needed */}
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>

          {/* ── Title block (bottom-right on desktop) ─────────────────── */}
          {/* initialFX.ts animates these elements in on page load and
              then loops them with LoopText() for a rolling-text effect.
              The gradient on .landing-info-h2::after partially masks
              the accent line, giving depth to the reveal animation.      */}
          <div className="landing-info">

            {/* Accent line — first part of config.developer.title before " | "
                e.g. "HEAD OF GTM"
                .landing-info-h2 has a CSS ::after gradient overlay;
                LoopText() in initialFX.ts slides alternate text through it  */}
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">
                {config.developer.title.split(" | ")[0].toUpperCase()}
              </div>
            </h2>

            {/* Secondary line — remainder of config.developer.title after " | "
                e.g. "AI & Software Engineer" */}
            <h2>
              <div className="landing-h2-info">
                {config.developer.title.split(" | ").slice(1).join(" | ")}
              </div>
            </h2>
          </div>

          {/* ── Mobile-only profile photo ─────────────────────────────── */}
          {/* Hidden on desktop (display:none). Shown on mobile instead of
              the 3D character which is too heavy for phones.              */}
          <div className="mobile-photo">
            <img src="/images/mypicnbg.png" alt={config.developer.fullName} />
          </div>
        </div>

        {/* children = CharacterModel (the Three.js canvas).
            Passed in from MainContainer and rendered on top of this section. */}
        {children}
      </div>
    </>
  );
};

export default Landing;
