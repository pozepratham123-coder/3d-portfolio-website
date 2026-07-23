// Navbar.tsx — Fixed top navigation bar + smooth-scroll setup.
//
// Two responsibilities live here:
//
//  1. Lenis smooth scroll — Lenis replaces the browser's default scroll with a
//     buttery-smooth, physics-based version. It is exported (`lenis`) so that
//     initialFX.ts can call lenis.start() once the loading screen closes.
//
//  2. Navigation links — clicking a nav link calls lenis.scrollTo() which
//     smoothly animates to the target section instead of jumping instantly.
//     On mobile (≤ 1024 px) the default anchor behaviour is kept (no JS).

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { config } from "../config";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

// Exported so initialFX.ts can call lenis.start() after the loading screen ends
export let lenis: Lenis | null = null;

const Navbar = () => {
  useEffect(() => {
    // ── Initialise Lenis smooth scroll ────────────────────────────────────
    lenis = new Lenis({
      duration: 1.7,                               // Total scroll animation length (seconds)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.7,                        // How far each wheel tick scrolls
      touchMultiplier: 2,
      infinite: false,
    });

    // Keep Lenis paused until the loading screen finishes (initialFX calls lenis.start())
    lenis.stop();

    // Feed Lenis into the requestAnimationFrame loop so it can update scroll position
    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ── Smooth-scroll nav links ───────────────────────────────────────────
    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault(); // Stop the browser's instant jump

          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href"); // e.g. "#about"

          if (section && lenis) {
            const target = document.querySelector(section) as HTMLElement;
            if (target) {
              lenis.scrollTo(target, {
                offset: 0,
                duration: 1.5,
              });
            }
          }
        }
        // On mobile / tablet: browser follows the href="#about" anchor normally
      });
    });

    // Recalculate Lenis dimensions when the window is resized
    window.addEventListener("resize", () => {
      lenis?.resize();
    });

    return () => {
      lenis?.destroy(); // Cleanup: remove all Lenis event listeners
    };
  }, []);

  return (
    <>
      <div className="header">
        {/* Logo — initials derived from fullName (e.g. "PO") */}
        <a href="/#" className="navbar-title" data-cursor="disable">
          {config.developer.fullName.split(" ").map(n => n[0]).join("")}
        </a>

        {/* Email link shown on the right side of the navbar */}
        <a
          href={`mailto:${config.social.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {config.social.email}
        </a>

        {/* Section links — data-href used by the click handler above,
            href="#…" used as fallback on mobile where JS is bypassed      */}
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      {/* Decorative animated gradient circles in the top-left and right corners */}
      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>

      {/* Gradient mask that fades the top of the page so the navbar sits cleanly
          over any scrolling content                                             */}
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
