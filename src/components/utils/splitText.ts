// splitText.ts — Scroll-triggered text reveal animations for the page sections.
//
// Called by MainContainer.tsx on mount and on every window resize.
// Applies two types of GSAP scroll animations:
//
//   .para elements  — Words slide in from y:80 (opacity 0 → 1) when the
//                     parent section enters the viewport. Text is split into
//                     individual words for a wave-like cascade effect.
//
//   .title elements — Characters slide in from y:80 with a 10° rotation
//                     (auto-alpha 0 → 1) creating a dramatic reveal per letter.
//
// On each call, existing animations are killed and text HTML is reverted to
// its original form before re-splitting. This ensures the animation works
// correctly after a resize (new line breaks = new split points).
//
// On mobile (< 900 px) this function returns early — no scroll animations
// are applied to avoid performance issues on low-power devices.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../../utils/textSplitter";

// Extend HTMLElement to store the animation and splitter instances on the element
// itself — makes cleanup easy (no external Maps/WeakMaps needed).
interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;   // Current GSAP tween for this element
  split?: TextSplitter;          // Current TextSplitter instance (for reverting)
}

gsap.registerPlugin(ScrollTrigger);

export default function setSplitText() {
  // Disable mobile resize recalculations (ScrollTrigger can fire unnecessarily
  // on mobile when the address bar shows/hides, causing jank)
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Below 900 px: skip all split-text animations (mobile / small tablet)
  if (window.innerWidth < 900) return;

  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  // Start trigger differs between desktop and tablet for better timing
  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";

  // Toggle actions: play on enter, pause on leave (backwards), resume on re-enter, reverse on leave
  const ToggleAction = "play pause resume reverse";

  // ── Paragraph animations (word-level) ─────────────────────────────────────
  paras.forEach((para: ParaElement) => {
    para.classList.add("visible"); // Ensure para is visible (removes any hidden state)

    // Kill and revert the previous animation if this is a resize re-run
    if (para.anim) {
      para.anim.progress(1).kill(); // Jump to end then kill (avoids visual glitch)
      para.split?.revert();         // Restore original innerHTML
    }

    // Split the paragraph text into individual words
    para.split = new TextSplitter(para, {
      type: "lines,words",
      linesClass: "split-line", // Each line wrapped in overflow:hidden span
    });

    // Animate all words in from below when the section enters the viewport
    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 }, // Start: invisible + shifted down
      {
        autoAlpha: 1,           // End: fully visible
        scrollTrigger: {
          trigger: para.parentElement?.parentElement, // Trigger on the section, not the para
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.02, // Each word starts 20 ms after the previous
      }
    );
  });

  // ── Title animations (character-level) ────────────────────────────────────
  titles.forEach((title: ParaElement) => {
    // Kill and revert previous animation on resize
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }

    // Split the title into individual characters
    title.split = new TextSplitter(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });

    // Animate characters in with a slight rotation — creates a dramatic feel
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 }, // Start: invisible, shifted down, rotated 10°
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,   // End: upright
        stagger: 0.03,
      }
    );
  });

  // Re-run setSplitText() whenever ScrollTrigger itself refreshes (e.g. after
  // a lazy image loads and shifts page layout)
  ScrollTrigger.addEventListener("refresh", () => setSplitText());
}
