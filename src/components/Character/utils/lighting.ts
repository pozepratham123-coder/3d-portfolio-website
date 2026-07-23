// lighting.ts — Scene lighting setup for the 3D character.
//
// Three light sources are used:
//
//  1. DirectionalLight (purple tint, 0xc7a9ff)
//     — Positioned behind/below the character to create a rim-light effect.
//     — Starts at intensity 0 and is faded in by turnOnLights() after load.
//
//  2. PointLight (purple, 0xc2a4ff)
//     — Positioned near the character's monitor.
//     — Intensity is driven every frame by setPointLight() to match the
//       flickering emissive of the screen — making it feel like the monitor
//       is actually casting light into the scene.
//
//  3. HDR Environment (RGBE equirectangular map loaded from /models/)
//     — Provides realistic image-based lighting (IBL) / reflections.
//     — Starts at environmentIntensity = 0 and fades in with turnOnLights().
//
// turnOnLights() is called by Scene.tsx after the intro animation starts.
// It also animates the CSS ".character-rim" glow circle into view.

import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  // ── Directional light — rim / backlight ───────────────────────────────────
  const directionalLight = new THREE.DirectionalLight(0xc7a9ff, 0); // Purple, starts off
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1); // Behind the character
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;   // Shadow map resolution
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  // ── Point light — monitor screen light ────────────────────────────────────
  // Range 100, decay 3 — falls off quickly so it only affects the character
  const pointLight = new THREE.PointLight(0xc2a4ff, 0, 100, 3);
  pointLight.position.set(3, 12, 4); // Near the character's screen
  pointLight.castShadow = true;
  scene.add(pointLight);

  // ── HDR environment map ───────────────────────────────────────────────────
  // Used for reflections and ambient image-based lighting on the character.
  // EquirectangularReflectionMapping maps the HDR panorama onto a sphere.
  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0;                        // Hidden until turnOnLights()
      scene.environmentRotation.set(5.76, 85.85, 1);        // Rotated to match scene layout
    });

  // ── setPointLight ─────────────────────────────────────────────────────────
  // Called every frame in Scene.tsx's render loop.
  // Reads the screen mesh's current emissive intensity and mirrors it to the
  // point light — so when the screen flickers, the surrounding light flickers too.
  function setPointLight(screenLight: any) {
    if (screenLight.material.opacity > 0.9) {
      // Screen is visible — drive point light with emissive intensity × 20
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      // Screen not yet visible — keep point light off
      pointLight.intensity = 0;
    }
  }

  // ── turnOnLights ──────────────────────────────────────────────────────────
  // Fades in the environment map and directional light after the intro.
  // Also animates the CSS rim-glow circle below the character into position.
  const duration = 2;
  const ease = "power2.inOut";

  function turnOnLights() {
    // Fade in the HDR environment (reflections + ambient)
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });

    // Fade in the directional rim light
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });

    // Animate the CSS glow circle below the character upward into position
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;
