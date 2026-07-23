// character.ts — Loads and prepares the 3D character model.
//
// The model file is stored encrypted on the server as `character.enc` to
// prevent easy download/extraction of the GLB asset.
//
// Load sequence:
//   1. decryptFile() fetches the .enc file and decrypts it with AES-CBC.
//   2. The decrypted ArrayBuffer is converted to a Blob URL.
//   3. GLTFLoader (with DRACOLoader for mesh compression) parses the model.
//   4. Each mesh is configured for performance:
//        - Shadow casting/receiving disabled (no dynamic shadows needed)
//        - frustumCulled = true (meshes outside camera view are skipped)
//        - Shader precision set to "mediump" (halves GPU memory on mobile)
//   5. GSAP scroll timelines are set up (setCharTimeline / setAllTimeline).
//   6. Feet bones are manually adjusted to fix a Y-offset from the rig export.
//   7. DRACOLoader is disposed (frees the DRACO WASM decoder worker).

import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  // ── Loaders ───────────────────────────────────────────────────────────────
  const loader = new GLTFLoader();

  // DRACOLoader decompresses Draco-compressed meshes in the GLTF.
  // The decoder WASM files live in /public/draco/ (served statically).
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  // ── loadCharacter ─────────────────────────────────────────────────────────
  // Returns a Promise that resolves with the parsed GLTF object, or rejects
  // if decryption or model loading fails.
  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        // Step 1: Decrypt the model file from the server
        // "Character3D#@" is the AES key used during encryption (see encrypt.cjs)
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );

        // Step 2: Wrap the decrypted bytes in a Blob URL so GLTFLoader can fetch it
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;

        // Step 3: Parse the GLTF model from the Blob URL
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;

            // Pre-compile shaders so the first render frame isn't slow
            await renderer.compileAsync(character, camera, scene);

            // Step 4: Optimise every mesh in the model
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = false;    // No shadow casting (saves shadow map draws)
                child.receiveShadow = false;
                mesh.frustumCulled = true;   // Skip rendering meshes outside the camera frustum

                // Use medium shader precision to halve GPU memory usage
                if (mesh.material && !Array.isArray(mesh.material)) {
                  (mesh.material as THREE.ShaderMaterial).precision = 'mediump';
                }
              }
            });

            resolve(gltf); // Signal Scene.tsx that the model is ready

            // Step 5: Register GSAP scroll-linked animation timelines
            setCharTimeline(character, camera); // Character movement on scroll
            setAllTimeline();                   // Career / other section timelines

            // Step 6: Fix feet Y-offset that comes from the Blender export
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;

            // Step 7: Free the DRACO decoder worker (no longer needed after parse)
            dracoLoader.dispose();
          },
          undefined, // onProgress callback — not used (setProgress handles the bar)
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
