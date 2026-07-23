// MainContainer.tsx — Top-level layout wrapper for the home page (/).
//
// Responsibilities:
//   • Renders the navbar, social icons, and all page sections in order.
//   • Mounts the 3D character model (children) on all screen sizes.
//   • Calls setSplitText() on mount and resize to register scroll-triggered
//     text animations (GSAP) for all .para and .title elements on the page.

import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import setSplitText from "./utils/splitText"; // Registers GSAP scroll text animations

const MainContainer = ({ children }: PropsWithChildren) => {
  // true when viewport is wider than 1024 px — used to tune splitText trigger timing
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      // Re-run text splitting on resize so GSAP recalculates line breaks
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };

    resizeHandler(); // Run immediately on mount to set up animations

    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      {/* Custom mouse cursor (desktop only — hidden on touch devices via CSS) */}
      <Cursor />

      {/* Fixed top navigation bar with smooth-scroll links */}
      <Navbar />

      {/* Fixed left-side column with GitHub / LinkedIn / Twitter / Instagram icons */}
      <SocialIcons />

      {/* Scrollable page content — all sections stack vertically */}
      <div className="container-main">
        {/* 3D character canvas is passed into Landing so it anchors correctly
            inside the landing-section (position: relative; height: 100svh)
            on all screen sizes, including mobile.                           */}
        <Landing>{children}</Landing>  {/* Hero / name section */}
        <About />        {/* Short bio paragraph */}
        <WhatIDo />      {/* Two skill cards (GTM & Software) */}
        <Career />       {/* Vertical experience timeline */}
        <Work />         {/* Horizontal scroll project showcase */}
        <TechStackNew /> {/* Inverted-pyramid tech stack grid */}
        <CallToAction /> {/* "Play With Me" + "Hire Me" buttons */}
        <Contact />      {/* Email, socials, footer / copyright */}
      </div>
    </div>
  );
};

export default MainContainer;
