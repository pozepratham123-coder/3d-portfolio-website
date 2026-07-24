// Work.tsx — Horizontal-scroll project showcase section.
//
// On desktop (> 768 px):
//   GSAP ScrollTrigger pins the section while the user scrolls vertically.
//   During the pin, the inner .work-flex strip translates horizontally,
//   creating a "conveyor belt" effect through the project cards.
//   translateX distance is calculated dynamically from actual card widths
//   so it works at any screen size without hardcoded values.
//
// On mobile (≤ 768 px):
//   The horizontal scroll is disabled (early return in useEffect).
//   Cards stack vertically and the user scrolls normally.
//
// Only the first 5 projects from config are shown here.
// The last card is a CTA linking to the /myworks full-page gallery.

import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { config } from "../config";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  useEffect(() => {
    // Skip the horizontal scroll setup on mobile — cards just stack vertically
    if (window.innerWidth <= 768) return;

    let translateX: number = 0;

    // Calculate how far the flex strip needs to slide left so the last card
    // is fully visible. Accounts for card widths, parent container offset,
    // and padding to avoid over- or under-scrolling.
    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return;

      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;

      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;

      // Total width of all cards minus the visible container width
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    // ScrollTrigger: pin the section in place while the user "scrolls" through
    // `translateX` pixels of virtual scroll space, then unpin and continue.
    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,   // Amount of scroll space reserved for the animation
        scrub: 1,                  // Ties animation progress to scroll position (smooth)
        pin: true,                 // Keeps the section fixed while scrolling through it
        pinSpacing: true,          // Adds spacer below so following sections don't jump up
        anticipatePin: 1,          // Pre-calculates pin to avoid a jitter on pin start
        id: "work",                // Named ID so resizeUtils.ts can find and kill it selectively
        invalidateOnRefresh: true, // Recalculates translateX if the window is resized
      },
    });

    // The actual horizontal movement animation tied to scroll progress
    timeline.to(".work-flex", {
      x: -translateX, // Shift cards left by the calculated distance
      ease: "none",   // Linear — scroll position maps 1:1 to animation position
    });

    // Force ScrollTrigger to recalculate positions after layout settles
    ScrollTrigger.refresh();

    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  return (
    // id="work" is the scroll target for the navbar "WORK" link
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Achievements</span>
        </h2>

        {/* Horizontal flex strip — this element is translated by GSAP */}
        <div className="work-flex">
          {/* Render first 5 projects from config as scrollable cards */}
          {config.projects.slice(0, 5).map((project, index) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                <div className="work-title">
                  {/* Zero-padded index (01, 02, …) */}
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>One-line Highlight</h4>
                <p>{project.technologies}</p>
              </div>

              {/* Hover-to-play video thumbnail (video prop is optional) */}
              <WorkImage image={project.image} alt={project.title} />
            </div>
          ))}

          {/* Extra card at the end of the strip — CTA to the full works page */}
          <div className="work-box work-box-cta">
            <div className="see-all-works">
              <h3>Want to see more?</h3>
              <p>Explore all of my achievements... Close to my heart</p>
              <Link to="/myworks" className="see-all-btn" data-cursor="disable">
                See All →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
