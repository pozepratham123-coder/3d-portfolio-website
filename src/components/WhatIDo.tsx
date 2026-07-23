// WhatIDo.tsx — "What I Do" skills section with two interactive flip cards.
//
// Desktop (mouse): cards reveal their back side on CSS :hover — the
//   "what-noTouch" class activates the hover styles in WhatIDo.css.
//
// Touch devices: GSAP's ScrollTrigger.isTouch flag is checked on mount.
//   If it's a touch device, "what-noTouch" is removed and a click listener
//   is added instead, toggling the "what-content-active" class to flip cards.
//   handleClick() (defined at the bottom) also manages sibling state so only
//   one card is "active" at a time.
//
// Card data comes from config.skills.develop and config.skills.design.

import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";

const WhatIDo = () => {
  // Array of refs for the two card elements — used to attach touch listeners
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);

  // Helper to store each card's DOM node in the refs array by index
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      // Touch device: swap hover-based reveal for a tap/click toggle
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch"); // Disable CSS :hover styles
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }

    // Cleanup: remove click listeners when the component unmounts
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);

  return (
    <div className="whatIDO">
      {/* Left column — section heading "WHAT I DO" broken into styled spans
          so each word can be individually styled via CSS                    */}
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            &nbsp;I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>

      {/* Right column — the two skill cards */}
      <div className="what-box">
        <div className="what-box-in">

          {/* SVG dashed border lines drawn on the left and right edges of
              the card container — purely decorative                        */}
          <div className="what-border2">
            <svg width="100%">
              <line x1="0"   y1="0" x2="0"   y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
              <line x1="100%" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
            </svg>
          </div>

          {/* ── Card 1: GTM & AI Sales ──────────────────────────────── */}
          {/* "what-noTouch" enables CSS :hover reveal on desktop;
              removed on touch devices in favour of click toggling     */}
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            {/* Top and bottom dashed border lines for this card */}
            <div className="what-border1">
              <svg height="100%">
                <line x1="0"   y1="0"    x2="100%" y2="0"    stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="0"   y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>

            {/* Corner accent square (decorative) */}
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>{config.skills.develop.title}</h3>        {/* Card heading */}
              <h4>{config.skills.develop.description}</h4>  {/* Sub-heading */}
              <p>{config.skills.develop.details}</p>         {/* Full description */}
              <h5>Skillset & tools</h5>

              {/* Tool/skill tags — small pill badges */}
              <div className="what-content-flex">
                {config.skills.develop.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>

              {/* Arrow icon shown on hover to hint at the card being interactive */}
              <div className="what-arrow"></div>
            </div>
          </div>

          {/* ── Card 2: Software & Research ─────────────────────────── */}
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            {/* Only bottom border for the second card (top is shared with card 1) */}
            <div className="what-border1">
              <svg height="100%">
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>

            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>{config.skills.design.title}</h3>
              <h4>{config.skills.design.description}</h4>
              <p>{config.skills.design.details}</p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {config.skills.design.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

// Handles click-to-reveal on touch devices.
// Toggles "what-content-active" on the tapped card and adds "what-sibling"
// to the other card so it visually recedes / deactivates.
function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");

  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
