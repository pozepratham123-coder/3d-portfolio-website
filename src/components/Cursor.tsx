// Cursor.tsx — Custom animated cursor that replaces the default browser pointer.
//
// How it works:
//   • A single <div class="cursor-main"> is the visual cursor blob.
//   • mousemove updates `mousePos` immediately (raw, snappy position).
//   • A requestAnimationFrame loop lerps `cursorPos` toward `mousePos`
//     with a fixed delay of 6 — this creates the characteristic lagging,
//     smooth "blob" feel.
//   • GSAP tweens the cursor div's x/y transform each frame.
//
// Cursor states (driven by data-cursor attributes on other elements):
//   data-cursor="disable" — adds "cursor-disable" class → shrinks/hides blob
//                           (used on links, buttons where pointer is obvious)
//   data-cursor="icons"   — adds "cursor-icons" class → snaps cursor to the
//                           social-icons bounding box and stretches it into a
//                           pill shape that outlines all icons at once
//
// The `hover` flag pauses the lerp loop while the cursor is locked to icons,
// so the position is purely controlled by GSAP snap, not the lag loop.

import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let hover = false;                          // true while cursor is locked to icons
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };           // Raw mouse position (updated instantly)
    const cursorPos = { x: 0, y: 0 };          // Lagged position (lerped toward mousePos)

    // Track the real mouse position on every move
    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    });

    // rAF loop: move the cursor blob toward the real pointer with a lag factor of 6
    requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 6; // Higher = more lag / softer feel
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      requestAnimationFrame(loop);
    });

    // Attach behaviour to every element with a data-cursor attribute
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;

      element.addEventListener("mouseover", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          // Snap the cursor blob to the social icons column bounding box
          cursor.classList.add("cursor-icons");
          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`); // Stretch to icon height
          hover = true; // Pause the lerp loop while snapped
        }

        if (element.dataset.cursor === "disable") {
          // Shrink / hide the cursor blob over links, buttons, etc.
          cursor.classList.add("cursor-disable");
        }
      });

      element.addEventListener("mouseout", () => {
        // Reset cursor to default blob state when leaving a special element
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false; // Resume the lerp loop
      });
    });
  }, []);

  // The cursor div is a simple empty div; all visual styling is in Cursor.css
  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
