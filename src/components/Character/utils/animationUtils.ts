// animationUtils.ts — Sets up all animation clips for the 3D character.
//
// The GLTF model contains several named AnimationClips baked in Blender:
//   "introAnimation" — character walks in / poses on load (plays once)
//   "Blink"          — eyelid blink cycle (plays after intro finishes)
//   "key1"–"key6"    — keyboard tapping animations for individual keys
//   "typing"         — full-body typing loop (filtered to specific bones)
//   "browup"         — eyebrow raise when hovering over the character face
//
// createBoneAction() is a helper that filters a clip's tracks to only the
// bones listed in boneNames, then creates an AnimationAction for the mixer.
// This allows playing partial animations (e.g. just the hands for typing)
// without affecting unrelated bones.
//
// filterAnimationTracks() does the actual track filtering by bone name.

import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const setAnimations = (gltf: GLTF) => {
  let character = gltf.scene;

  // AnimationMixer drives all clips on the character — one mixer per scene object
  let mixer = new THREE.AnimationMixer(character);

  if (gltf.animations) {
    // ── Intro animation ──────────────────────────────────────────────────
    // Plays once (LoopOnce) and holds the final pose (clampWhenFinished)
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.setLoop(THREE.LoopOnce, 1);
    introAction.clampWhenFinished = true;
    introAction.play();

    // ── Key press animations ─────────────────────────────────────────────
    // Individual key-tap clips play on loop at 1.2× speed for realism
    const clipNames = ["key1", "key2", "key5", "key6"];
    clipNames.forEach((name) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      if (clip) {
        const action = mixer?.clipAction(clip);
        action!.play();
        action!.timeScale = 1.2; // Slightly faster than recorded
      } else {
        console.error(`Animation "${name}" not found`);
      }
    });

    // ── Typing animation (filtered to hand/arm/leg bones only) ───────────
    // Uses createBoneAction() so only the listed bones in typingBoneNames
    // are animated — prevents the typing clip from overriding the intro pose
    let typingAction: THREE.AnimationAction | null = null;
    typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
    }
  }

  // ── startIntro ──────────────────────────────────────────────────────────
  // Called by Scene.tsx after lights turn on (2.5 s after model load).
  // Resets and re-plays the intro, then fades in the blink cycle.
  function startIntro() {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.clampWhenFinished = true;
    introAction.reset().play();

    // Start the blink cycle 2.5 s in (intro is still playing, blink fades in)
    setTimeout(() => {
      const blink = gltf.animations.find((clip) => clip.name === "Blink");
      mixer.clipAction(blink!).play().fadeIn(0.5);
    }, 2500);
  }

  // ── hover ────────────────────────────────────────────────────────────────
  // Raises the character's eyebrows when the mouse enters the face hover zone.
  // Uses the "browup" clip filtered to eyebrow bones only.
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    let eyeBrowUpAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;

    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }

    // On mouse enter: reset and play the eyebrow raise with extra weight
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4); // Override blending with other clips
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };

    // On mouse leave: fade the eyebrow back down over 0.6 s
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };

    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);

    // Cleanup function (returned but not currently called by Scene.tsx)
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }

  return { mixer, startIntro, hover };
};

// ── createBoneAction ─────────────────────────────────────────────────────────
// Finds a named clip in the GLTF, filters its tracks to only the specified
// bones, and returns an AnimationAction ready to be played on the mixer.
const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,           // Name of the clip in the GLTF file
  boneNames: string[]     // Only these bones are kept in the filtered clip
): THREE.AnimationAction | null => {
  const AnimationClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found in GLTF file.`);
    return null;
  }

  const filteredClip = filterAnimationTracks(AnimationClip, boneNames);
  return mixer.clipAction(filteredClip);
};

// ── filterAnimationTracks ────────────────────────────────────────────────────
// Returns a new AnimationClip containing only the tracks whose name includes
// at least one of the specified bone names.
const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  // Create a new clip with the filtered tracks — "_filtered" suffix avoids
  // collisions if the original clip is also played on the same mixer
  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
