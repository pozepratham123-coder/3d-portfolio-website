// Loading.tsx — Full-screen loading overlay shown while the 3D model downloads.
//
// Flow:
//   1. Scene.tsx calls setLoading(percent) as the GLTF model downloads,
//      incrementing the progress bar from 0 → ~92% automatically.
//   2. Once the model finishes loading, progress.loaded() is called from Scene.tsx
//      which runs percent to 100 quickly (2 ms per tick).
//   3. When percent >= 100, a short delay sets `loaded = true` (swaps button text
//      from "Loading X%" to "Welcome") then `isLoaded = true` after 1 s.
//   4. The useEffect watching `isLoaded` triggers initialFX() (page entry
//      animations) and calls setIsLoading(false) to unmount this overlay.
//
// The loading screen also has a decorative arcade-style "game" animation
// and a Marquee ticker showing the developer's skills.
//
// setProgress() is exported separately and used by Scene.tsx to control
// a simulated progress percentage that mirrors real download progress.

import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import { config } from "../config";
import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading(); // Dismiss the overlay when loading is done

  const [loaded, setLoaded] = useState(false);   // true → button shows "Welcome"
  const [isLoaded, setIsLoaded] = useState(false); // true → starts exit animation + initialFX
  const [clicked, setClicked] = useState(false);  // true → triggers CSS exit transition

  // When the download hits 100%, wait 600 ms then flip the loaded states
  if (percent >= 100) {
    setTimeout(() => {
      setLoaded(true);      // Swaps "Loading X%" for "Welcome"
      setTimeout(() => {
        setIsLoaded(true);  // Kicks off the exit sequence
      }, 1000);
    }, 600);
  }

  useEffect(() => {
    // Dynamically import initialFX only when needed (saves bundle size at start)
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true); // CSS class that triggers the loading screen slide-out
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX(); // Play page-entry animations (text reveal, fade-in)
          }
          setIsLoading(false); // Unmount this Loading component
        }, 900); // 900 ms matches the CSS exit transition duration
      }
    });
  }, [isLoaded]);

  // Tracks the mouse position within the loading button to create a glowing
  // spotlight effect via CSS custom properties --mouse-x / --mouse-y
  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      {/* ── Top bar: logo + arcade game animation ──────────────────────── */}
      <div className="loading-header">
        {/* Logo image — coloured, no invert filter (loading screen has light background) */}
        <a href="/#" className="loader-title" data-cursor="disable">
          <img
            src="/images/poza-logo.svg"
            alt={config.developer.fullName}
            className="loader-logo"
          />
        </a>

        {/* Decorative bouncing-ball game graphic — slides out when `clicked` */}
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {/* 27 vertical lines that form the "game board" */}
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div> {/* Animated bouncing ball */}
          </div>
        </div>
      </div>

      {/* ── Main loading screen ─────────────────────────────────────────── */}
      <div className="loading-screen">
        {/* Scrolling marquee ticker across the top */}
        <div className="loading-marquee">
          <Marquee>
            <span>&nbsp; Head of GTM &nbsp;</span>
            <span>&nbsp; AI &amp; Product &nbsp;</span>
            <span>&nbsp; Masti Merchant &nbsp;</span>
            <span>&nbsp; Head of GTM &nbsp;</span>
            <span>&nbsp; AI &amp; Product &nbsp;</span>
            <span>&nbsp; Masti Merchant &nbsp;</span>
          </Marquee>
        </div>

        {/* Interactive loading button — mouse spotlight effect on hover */}
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div> {/* Spotlight glow layer */}

          {/* Button face — "loading-complete" class swaps in "Welcome" text */}
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span> {/* Live percentage counter */}
                </div>
              </div>
              <div className="loading-box"></div> {/* Animated inner box */}
            </div>
            {/* "Welcome" text revealed once loading reaches 100% */}
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

// ─────────────────────────────────────────────────────────────────────────────
// setProgress — Simulates a realistic progress bar for the 3D model download.
//
// Strategy:
//   • Phase 1 (0 → 50%): fast random increments every 100 ms — feels snappy.
//   • Phase 2 (50 → 91%): very slow random increments every 2 s — mimics a
//     large file that takes time to decompress/parse.
//   • loaded() promise: once the model actually finishes, this rushes
//     percent to 100 at 2 ms per tick (feels instant to the user).
//   • clear(): immediately jumps to 100 (used if loading fails or times out).
//
// Returns { loaded, percent, clear } so Scene.tsx can call loaded() when
// the GLTF is fully parsed and ready to render.
export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  // Phase 1: rapid random increments 0 → 50
  let interval = setInterval(() => {
    if (percent <= 50) {
      let rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      // Switch to Phase 2: slow increments 50 → 91
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random());
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval); // Stop at 91 — wait for real load to finish
        }
      }, 2000);
    }
  }, 100);

  // Jump straight to 100 — called on error or timeout
  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  // Rushes percent from its current value to 100, ticking every 2 ms.
  // Returns a Promise that resolves when 100 is reached.
  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }

  return { loaded, percent, clear };
};
