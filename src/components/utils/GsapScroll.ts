// GsapScroll.ts — GSAP ScrollTrigger timelines for the 3D character and page sections.
//
// Exports two functions:
//
//  setCharTimeline(character, camera)
//    — Scroll-linked animations that move the 3D character as the user scrolls
//      through the Landing, About, and WhatIDo sections.
//    — Also handles the monitor screen fade-in and screen light flicker.
//    — On mobile / tablet (≤ 1024 px) a simpler fallback shows the WhatIDo
//      panel without character animation.
//
//  setAllTimeline()
//    — Scroll-linked animations for non-3D page sections (Career timeline).
//    — Safe to call without a character reference.
//
// Both functions are called once after the model loads and again on resize
// (after killing stale triggers) via resizeUtils.ts.

import * as THREE from "three";
import gsap from "gsap";

// ── setCharTimeline ───────────────────────────────────────────────────────────
export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  // Random emissive intensity for the screen flicker effect — updated every 200 ms
  let intensity: number = 0;
  setInterval(() => {
    intensity = Math.random(); // Drives gsap repeat animation on the screen material
  }, 200);

  // ── Timeline 1: Landing → About transition ─────────────────────────────
  // Triggers as the user scrolls through the landing section.
  // Rotates the character, zooms the camera out, and slides landing text off.
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,              // Animation progress tied directly to scroll position
      invalidateOnRefresh: true, // Recalculate on resize
    },
  });

  // ── Timeline 2: About → WhatIDo transition ─────────────────────────────
  // Character "sits down" at the computer — camera pulls back, screen turns on.
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  // ── Timeline 3: WhatIDo → Career exit ──────────────────────────────────
  // Character slides up and off screen as the user leaves the WhatIDo section.
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  // ── Find screen-related mesh parts in the model ─────────────────────────
  // "Plane004" contains the monitor mesh with the emissive screen material.
  // "screenlight" is a separate emissive plane whose opacity drives the point light.
  let screenLight: any, monitor: any;

  character?.children.forEach((object: any) => {
    if (object.name === "Plane004") {
      // Make the monitor mesh transparent initially — faded in by tl2
      object.children.forEach((child: any) => {
        child.material.transparent = true;
        child.material.opacity = 0;
        if (child.material.name === "Material.027") {
          monitor = child;
          child.material.color.set("#FFFFFF"); // White base for the emissive screen
        }
      });
    }

    if (object.name === "screenlight") {
      // Glowing screen mesh — flickering emissive intensity on a loop
      object.material.transparent = true;
      object.material.opacity = 0;
      object.material.emissive.set("#C8BFFF"); // Soft purple screen glow

      // Continuously flicker the screen's emissive intensity using random values
      gsap.timeline({ repeat: -1, repeatRefresh: true }).to(object.material, {
        emissiveIntensity: () => intensity * 8,        // Driven by the setInterval above
        duration: () => Math.random() * 0.6,           // Random flicker speed
        delay: () => Math.random() * 0.1,             // Random phase offset
      });

      screenLight = object;
    }
  });

  // Neck bone reference for the "looking at keyboard" pose in tl2
  let neckBone = character?.getObjectByName("spine005");

  if (window.innerWidth > 1024) {
    // ── Desktop: full character scroll animations ─────────────────────────
    if (character) {
      // tl1: Landing → About
      // Character rotates right, camera zooms out, landing text fades out
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      // tl2: About → WhatIDo
      // Camera zooms far back, character turns to "type", screen fades in
      tl2
        .to(camera.position, { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" }, 0)
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 }, // Shift left into "seated" position
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0) // Turn body
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0)           // Bend neck toward keyboard
        .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)     // Fade in monitor screen
        .to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0) // Fade in screen glow
        .fromTo(".what-box-in", { display: "none" }, { display: "flex", duration: 0.1, delay: 6 }, 0) // Show skill cards
        .fromTo(monitor.position, { y: -10, z: 2 }, { y: 0, z: 0, delay: 1.5, duration: 3 }, 0) // Slide monitor into position
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 }, // Fade out the rim glow
          0.3
        );

      // tl3: WhatIDo → Career
      // Character slides upward off screen, WhatIDo section drifts
      tl3
        .fromTo(".character-model", { y: "0%" }, { y: "-100%", duration: 4, ease: "none", delay: 1 }, 0)
        .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0); // Slight head tilt as character exits
    }
  } else {
    // ── Mobile / Tablet: simplified animations ────────────────────────────
    if (character) {
      // Fade and slide landing text out as user scrolls away from hero
      tl1
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "20%", duration: 0.8 }, 0);

      // Fade the character out as the About section enters view
      gsap.to(".character-model", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
          end: "top 20%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Show WhatIDo cards when they enter the viewport
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    }
  }
}

// ── setAllTimeline ────────────────────────────────────────────────────────────
// Scroll animations for page sections that don't involve the 3D character.
// Safe to call independently of whether the character is loaded.
export function setAllTimeline() {
  // Career section: vertical timeline line grows from top to bottom as you scroll
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 50%",
      end: "bottom 30%",
      scrub: 1.5,              // Slightly lagged scrub for a fluid feel
      invalidateOnRefresh: true,
    },
  });

  careerTimeline
    // Grow the vertical line from 0% to 100% height
    .fromTo(".career-timeline", { maxHeight: "0%" }, { maxHeight: "100%", duration: 1, ease: "none" }, 0)
    // Fade the line in as it grows
    .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
    // Stagger each career card in as the line passes it
    .fromTo(".career-info-box", { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.5 }, 0)
    // Stop the pulsing dot animation once it's in view (from infinite → 1 iteration)
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      { animationIterationCount: "1", delay: 0.3, duration: 0.1 },
      0
    );

  if (window.innerWidth > 1024) {
    // Desktop: slightly drift the whole section upward as you scroll through it
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    // Mobile: no parallax drift — keep the section stationary
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }
}
