// Character/index.tsx — Public entry point for the 3D character feature.
//
// This thin wrapper exists so App.tsx can do:
//   import CharacterModel from "./components/Character"
// without knowing about the internal Scene.tsx structure.
// All the real Three.js logic lives in Scene.tsx and its utils/.

import Scene from "./Scene";

const CharacterModel = () => {
  return <Scene />;
};

export default CharacterModel;
