// boneData.ts — Bone name lists used to filter 3D character animation clips.
//
// The character's GLTF file contains composite animation clips (e.g. "typing")
// that animate many bones at once. To play only a subset of bones from a clip
// (e.g. just the hands), animationUtils.ts filters the clip's tracks to only
// those whose names appear in these arrays.
//
// Bone names match the armature bone names exported from Blender.
//
// typingBoneNames — all bones involved in the typing animation:
//   upper body: arms, forearms, hands, all finger bones (L + R sides)
//   lower body: thighs, shins, feet, toes (for seated leg movement)
//
// eyebrowBoneNames — the two bones that raise the eyebrows on hover.

// All bones animated in the "typing" clip (used for the seated desk animation)
export const typingBoneNames = [
  "thighL",
  "thighR",
  // "footL",   // Foot bones commented out — feet are positioned manually in character.ts
  // "footR",
  "shinL",
  "shinR",
  "forearmL",
  "forearmR",
  "handL",
  "handR",
  // ── Right hand fingers ───────────────────────────────────────
  "f_pinky03R",
  "f_pinky02R",
  "f_pinky01R",
  "palm04R",
  "f_ring01R",
  "f_ring02R",
  "f_ring03R",
  "f_middle01R",
  "f_middle02R",
  "f_middle03R",
  "f_index01R",
  "f_index02R",
  "f_index03R",
  "thumb01R",
  "thumb02R",
  "thumb03R",
  "palm01R",
  "palm02R",
  "palm03R",
  // ── Left hand fingers ────────────────────────────────────────
  "f_pinky02L",
  "f_pinky01L",
  "palm04L",
  "f_ring01L",
  "thumb01L",
  "thumb03L",
  "palm02L",
  "palm01L",
  "f_index01L",
  "palm03L",
  "f_ring02L",
  "f_middle01L",
  "f_middle02L",
  "f_middle03L",
  "f_index02L",
  "f_index03L",
  "thumb02L",
  "f_pinky03L",
  // ── Upper arms ───────────────────────────────────────────────
  "upper_armL",
  "upper_armR",
  // ── Feet / toes (for seated leg positioning) ─────────────────
  "toeL",
  "heel02L",
  "toeR",
  "heel02R",
];

// Bones that raise the eyebrows — used in the "browup" hover animation
export const eyebrowBoneNames = ["eyebrow_L", "eyebrow_R"];
