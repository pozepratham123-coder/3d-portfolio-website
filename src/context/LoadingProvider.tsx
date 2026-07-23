// LoadingProvider.tsx — Global loading-screen context.
//
// How it works:
//   The loading screen (isLoading = true) is shown on all devices while the
//   3D character model downloads. Once the model is ready, Loading.tsx calls
//   setIsLoading(false) to dismiss the overlay.
//
// Any child component can read { isLoading, setIsLoading, setLoading } via
// the useLoading() hook.

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

// Shape of the context value
interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void; // Called by Loading.tsx when load is complete
  setLoading: (percent: number) => void;  // Called by Scene.tsx to update progress bar
}

// The context itself — null until the Provider is mounted
export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  // Start loading on desktop; skip entirely on mobile (no 3D model there)
  const [isLoading, setIsLoading] = useState(() => {
    if (window.innerWidth <= 768) return false;
    return true;
  });

  // Current loading percentage (0–100), passed down to <Loading percent={...} />
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };

  useEffect(() => {
    // On mobile: no 3D model is shown, so kick off the page entry animations
    // directly (slight delay to ensure the DOM is painted first).
    if (window.innerWidth <= 768) {
      import("../components/utils/initialFX").then((module) => {
        if (module.initialFX) {
          setTimeout(() => {
            module.initialFX();
          }, 100);
        }
      });
    }
  }, []);

  // Empty effect kept as a placeholder — loading state changes trigger re-renders
  // via the value object below, so no extra side-effects are needed here.
  useEffect(() => {}, [loading]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {/* Show the loading overlay only while isLoading is true */}
      {isLoading && <Loading percent={loading} />}

      {/* The actual page content lives inside <main> so initialFX can
          add the "main-active" class to trigger the fade-in animation     */}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

// Convenience hook — throws if used outside a LoadingProvider
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
