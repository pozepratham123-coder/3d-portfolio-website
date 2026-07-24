// Scene.tsx — Three.js canvas setup and main render loop for the 3D character.
//
// Lifecycle on mount:
//   1. A WebGLRenderer is created and appended into the `canvasDiv` DOM node.
//   2. A PerspectiveCamera is positioned above and in front of the character.
//   3. setLighting() adds directional + point lights and an HDR environment map.
//   4. setProgress() starts the simulated loading progress bar (0 → ~92%).
//   5. loadCharacter() fetches, decrypts, and parses the GLTF model.
//      When done it:
//        a. Runs setAnimations() to start typing / intro / blink clips.
//        b. Rushes the progress bar to 100%, then turns on lights and plays
//           the character's intro animation after a 2.5 s delay.
//   6. Mouse and touch listeners track cursor position for head rotation.
//   7. The animate() loop runs every frame: updates head rotation, screen
//      point light intensity, animation mixer, and renders the scene.
//
// On unmount everything is cleaned up (renderer, listeners, scene objects).

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  // DOM ref for the container div — the WebGL canvas is appended here
  const canvasDiv = useRef<HTMLDivElement | null>(null);

  // Transparent div that sits over the character's face area to catch hover events
  // for the eyebrow-raise animation
  const hoverDivRef = useRef<HTMLDivElement>(null);

  // Three.js Scene object — created once and persists for the component lifetime
  const sceneRef = useRef(new THREE.Scene());

  // setLoading updates the loading progress bar shown in Loading.tsx
  const { setLoading } = useLoading();

  // The loaded character Object3D — stored in state so GSAP timelines can reference
  // it after initial render (though mainly used inside the useEffect closure)
  const [character, setChar] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      // ── WebGL Renderer ─────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        alpha: true,       // Transparent background (CSS background shows through)
        antialias: window.devicePixelRatio < 2, // AA only needed on low-DPI screens
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2× for performance
      renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic colour grade
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement); // Attach canvas to page

      // ── Camera ─────────────────────────────────────────────────────────
      // FOV 14.5° (narrow/telephoto) makes the character look large and flat.
      // Positioned high (y=13.1) and close (z=24.7) for an "above looking down" feel.
      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      // Bone references populated after the GLTF loads
      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;

      // Animation mixer drives all keyframe animations on the character
      let mixer: THREE.AnimationMixer;

      // Clock measures elapsed time between frames for mixer.update(delta)
      const clock = new THREE.Clock();

      // ── Lighting ───────────────────────────────────────────────────────
      const light = setLighting(scene);

      // ── Loading progress ───────────────────────────────────────────────
      // Start simulated progress — runs independently of actual download speed
      let progress = setProgress((value) => setLoading(value));

      // ── Load the 3D character ──────────────────────────────────────────
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          // Set up all animation clips (typing, intro, blink, eyebrow)
          const animations = setAnimations(gltf);

          // Attach eyebrow-raise hover animation to the face hover div
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);

          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);

          // Head bone — rotated every frame to follow the mouse cursor
          headBone = character.getObjectByName("spine006") || null;

          // Screen light — emissive plane on the monitor; intensity flickered in lighting.ts
          screenLight = character.getObjectByName("screenlight") || null;

          // Rush progress bar to 100%, then turn on lights + play intro
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();     // Fade in environment + directional light
              animations.startIntro();  // Play intro animation clip
            }, 2500);
          });

          // Re-create GSAP timelines and resize renderer on window resize
          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, character)
          );
        }
      });

      // ── Mouse / touch tracking ─────────────────────────────────────────
      // Normalised mouse position: x ∈ [-1, 1], y ∈ [-1, 1]
      let mouse = { x: 0, y: 0 };

      // How fast the head "catches up" to the mouse — lower = slower/smoother
      let interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };

      let debounce: number | undefined;

      // On touchstart, wait 200 ms before listening to touchmove events
      // to distinguish taps from intentional drags
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      // When finger lifts, slowly return the head to centre position
      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });

      // Touch listeners are attached only to the landing section so they
      // don't interfere with normal page scrolling
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        // passive: true — lets the browser start scrolling immediately without
        // waiting for the listener to return (critical for smooth mobile scroll)
        landingDiv.addEventListener("touchstart", onTouchStart, { passive: true });
        landingDiv.addEventListener("touchend", onTouchEnd, { passive: true });
      }

      // ── Main render loop ───────────────────────────────────────────────
      const animate = () => {
        requestAnimationFrame(animate);

        if (headBone) {
          // Rotate the head bone to follow the mouse (lerped for smoothness)
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );

          // Sync the point light brightness with the screen's emissive flicker
          light.setPointLight(screenLight);
        }

        // Advance all animation clips by time elapsed since last frame
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }

        renderer.render(scene, camera); // Draw the frame
      };
      animate();

      // ── Cleanup on unmount ─────────────────────────────────────────────
      return () => {
        clearTimeout(debounce);
        scene.clear();        // Remove all objects from the scene
        renderer.dispose();   // Free WebGL memory
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        {/* canvasDiv — the WebGL <canvas> is appended here by the renderer */}
        <div className="character-model" ref={canvasDiv}>
          {/* Rim light glow (a blurred CSS circle below the character) */}
          <div className="character-rim"></div>

          {/* Invisible hover target over the character's face for eyebrow animation */}
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
