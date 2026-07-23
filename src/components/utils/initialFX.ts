// initialFX.ts — Page entry animations, called once when the loading screen closes.
//
// Triggered by:
//   • Loading.tsx  — on desktop, after the model loads and the overlay exits.
//   • LoadingProvider.tsx — on mobile (≤ 768 px), after a 100 ms delay at mount.
//
// Sequence:
//   1. Enable body scroll and start Lenis smooth scroll.
//   2. Fade the <main> element in (via CSS "main-active" class).
//   3. Animate the landing text (name, greeting, job title) in with a blur reveal.
//   4. Fade in the navbar, social icons, and nav-fade gradient.
//   5. Start a continuous LoopText() animation that cycles between two text
//      versions (e.g. rolling between alternate title lines) on a repeat loop.

import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { lenis } from "../Navbar";

export function initialFX() {
  // Allow the page to scroll (was hidden during loading)
  document.body.style.overflowY = "auto";

  // Start Lenis smooth scroll (was paused during loading — see Navbar.tsx)
  if (lenis) {
    lenis.start();
  }

  // Trigger the CSS fadeIn animation on the main content wrapper
  document.getElementsByTagName("main")[0].classList.add("main-active");

  // Transition body background from pure black (#000) to the dark purple theme
  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  // ── Landing text reveal ──────────────────────────────────────────────────
  // Split the name + greeting elements into individual characters, then
  // animate each char in from y:80 with a blur-to-clear effect + stagger.
  const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1"];
  const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));

  var landingText = new TextSplitter(elements, {
    type: "chars,lines",
    linesClass: "split-line", // Wrapper class for each line (used for overflow:hidden)
  });

  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025, // Each character starts 25 ms after the previous
      delay: 0.3,
    }
  );

  // Shared TextSplitter config for the job title lines (uses split-h2 for horizontal clipping)
  let TextProps = { type: "chars,lines", linesClass: "split-h2" };

  // Split and animate the subtitle line (e.g. "AI & Software Engineer")
  var landingText2 = new TextSplitter(".landing-h2-info", TextProps);
  gsap.fromTo(
    landingText2.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  // Animate the accent title line container (slides up as a whole block)
  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );

  // Fade in the navbar, social icons, and nav gradient mask
  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  // ── LoopText setup ───────────────────────────────────────────────────────
  // Creates splitters for the alternate text lines (hidden duplicates used
  // in the rolling loop animation). These elements are positioned via CSS
  // with linesClass: "split-h2" so overflow is clipped horizontally.

  var landingText3 = new TextSplitter(".landing-h2-info-1", TextProps); // Alternate subtitle
  var landingText4 = new TextSplitter(".landing-h2-1", TextProps);      // Accent line (primary)
  var landingText5 = new TextSplitter(".landing-h2-2", TextProps);      // Accent line (alternate)

  // Start the infinite cycling animations for both text pairs
  LoopText(landingText2, landingText3); // Subtitle line cycles
  LoopText(landingText4, landingText5); // Accent line cycles
}

// ── LoopText ──────────────────────────────────────────────────────────────────
// Creates a GSAP timeline that repeatedly swaps two text splitters.
//
// Visual effect: Text1 is visible, then after `delay` seconds it slides upward
// and off-screen while Text2 simultaneously slides in from below. After
// `delay2` seconds, they swap back. The timeline repeats indefinitely.
//
// Timeline positions (0, 1) are GSAP labels — 0 = start of timeline, 1 = 1 second in.
function LoopText(Text1: TextSplitter, Text2: TextSplitter) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 }); // Loops forever with 1 s pause
  const delay = 4;         // Seconds before the first swap
  const delay2 = delay * 2 + 1; // Seconds before the swap-back

  tl
    // Text2 slides UP into view (entrance) — starts at position 0
    .fromTo(
      Text2.chars,
      { opacity: 0, y: 80 },
      { opacity: 1, duration: 1.2, ease: "power3.inOut", y: 0, stagger: 0.1, delay: delay },
      0
    )
    // Text1 slides back in (return) — starts at timeline position 1
    .fromTo(
      Text1.chars,
      { y: 80 },
      { duration: 1.2, ease: "power3.inOut", y: 0, stagger: 0.1, delay: delay2 },
      1
    )
    // Text1 slides UP and off screen (exit)
    .fromTo(
      Text1.chars,
      { y: 0 },
      { y: -80, duration: 1.2, ease: "power3.inOut", stagger: 0.1, delay: delay },
      0
    )
    // Text2 slides off screen (exit on swap-back)
    .to(
      Text2.chars,
      { y: -80, duration: 1.2, ease: "power3.inOut", stagger: 0.1, delay: delay2 },
      1
    );
}
