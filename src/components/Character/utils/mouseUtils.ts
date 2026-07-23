// mouseUtils.ts — Mouse and touch tracking utilities for head rotation.
//
// All mouse/touch coordinates are normalised to the range [-1, 1] before
// being stored, so they can be used directly with Three.js conventions
// (where (0,0) is screen centre, x goes right, y goes up).
//
// handleHeadRotation() is called every render frame to smoothly lerp the
// character's head bone toward the current mouse position, creating the
// "looking at the cursor" effect. It only applies when scrollY < 200
// (i.e. the user is near the top of the page / landing section).

import * as THREE from "three";

// ── handleMouseMove ───────────────────────────────────────────────────────────
// Converts a raw MouseEvent into normalised [-1, 1] coordinates and passes
// them to the setMousePosition callback in Scene.tsx.
export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  // Normalise: map [0, innerWidth] → [-1, 1] and [0, innerHeight] → [1, -1]
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1; // Y is inverted in CSS vs WebGL
  setMousePosition(mouseX, mouseY);
};

// ── handleTouchMove ───────────────────────────────────────────────────────────
// Same normalisation but reads from the first touch point instead of a mouse.
export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

// ── handleTouchEnd ────────────────────────────────────────────────────────────
// When the user lifts their finger, slowly return the head to centre (0, 0).
// Two-step approach:
//   1. After 2 s: snap interpolation to a very slow value (0.03) so the return
//      movement is barely perceptible — feels natural.
//   2. After 1 more second (3 s total): restore the normal interpolation speed
//      so the next touch input feels responsive again.
export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03); // Slow drift back to centre
    setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2); // Restore normal interpolation speed
    }, 1000);
  }, 2000);
};

// ── handleHeadRotation ────────────────────────────────────────────────────────
// Rotates the character's head bone to track the mouse cursor.
// Uses THREE.MathUtils.lerp to smoothly interpolate between the current and
// target rotation each frame (called inside the render loop in Scene.tsx).
//
// Parameters:
//   headBone        — the spine006 bone that controls head rotation
//   mouseX / mouseY — normalised cursor position [-1, 1]
//   interpolationX/Y — lerp factor per frame (0.1 = slow, 0.5 = fast)
//   lerp            — THREE.MathUtils.lerp passed in to avoid importing THREE here
export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number
) => {
  if (!headBone) return;

  if (window.scrollY < 200) {
    // ── Near top of page: head tracks the cursor ───────────────────────
    const maxRotation = Math.PI / 6; // 30° — prevents the head from over-rotating

    // Horizontal head turn (Y axis rotation) — follows mouseX
    headBone.rotation.y = lerp(
      headBone.rotation.y,
      mouseX * maxRotation,
      interpolationY
    );

    // Vertical head tilt (X axis rotation) — clamped to avoid extreme angles
    let minRotationX = -0.3; // Down limit
    let maxRotationX = 0.4;  // Up limit

    if (mouseY > minRotationX) {
      if (mouseY < maxRotationX) {
        // Within normal range — follow the cursor
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          -mouseY - 0.5 * maxRotation,
          interpolationX
        );
      } else {
        // Cursor is too high — clamp at max up angle
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          -maxRotation - 0.5 * maxRotation,
          interpolationX
        );
      }
    } else {
      // Cursor is too low — clamp at min down angle
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        -minRotationX - 0.5 * maxRotation,
        interpolationX
      );
    }
  } else {
    // ── Scrolled past the landing: head looks down at "keyboard" ─────
    // Only applied on desktop where the character is visible while scrolling
    if (window.innerWidth > 1024) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.4, 0.03); // Look slightly down
      headBone.rotation.y = lerp(headBone.rotation.y, -0.3, 0.03); // Turn slightly right
    }
  }
};
