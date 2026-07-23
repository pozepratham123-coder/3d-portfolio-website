// SocialIcons.tsx — Fixed left-side column with social icon links + Resume button.
//
// Magnetic hover effect:
//   Each icon sits inside a <span> that acts as a bounding box.
//   On mousemove, the mouse position is tracked relative to that box.
//   A requestAnimationFrame loop lerps (smoothly moves) the icon's CSS
//   custom properties --siLeft / --siTop toward the cursor, creating a
//   magnetic "pull" when the cursor is near the icon.
//   When the cursor leaves the hot zone, the values lerp back to centre.
//
// The icons link to GitHub, LinkedIn, Twitter (X), and Instagram, all
// pulled from config.contact.

import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { config } from "../config";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;

    // Attach the magnetic effect to every <span> wrapper inside the social bar
    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement; // The actual icon link

      const rect = elem.getBoundingClientRect(); // Icon bounding box (fixed, captured once)

      // Target position — updated on mousemove
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;

      // Current rendered position — interpolated toward the target each frame
      let currentX = 0;
      let currentY = 0;

      // rAF loop: smoothly move the icon toward the mouse using a 10% lerp per frame
      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1; // 10% step toward target per frame
        currentY += (mouseY - currentY) * 0.1;

        // Write updated position into CSS custom properties used by SocialIcons.css
        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        // Mouse position relative to the icon's bounding box
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only apply the magnetic pull within a 30×35 px hotzone around the icon
        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          // Outside hotzone — snap target back to centre so icon returns to rest
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      updatePosition(); // Start the rAF loop immediately

      // Return cleanup — note: this runs when the forEach callback scope exits,
      // not on component unmount. Full cleanup would need to be done in a ref.
      return () => {
        elem.removeEventListener("mousemove", onMouseMove);
      };
    });
  }, []);

  return (
    <div className="icons-section">
      {/* data-cursor="icons" tells Cursor.tsx to switch to the "icons" cursor style
          (a tall pill that hugs all the icons) when hovering over this group      */}
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={config.contact.github} target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer">
            <FaXTwitter />
          </a>
        </span>
        <span>
          <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        </span>
      </div>

      {/* Resume button — uses the same HoverLinks double-text animation as nav links */}
      <a className="resume-button" href="#">
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
