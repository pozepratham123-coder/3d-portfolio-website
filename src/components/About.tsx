// About.tsx — "About Me" section.
//
// Simple static section with a heading and a bio paragraph pulled from config.
// The .title and .para CSS classes are picked up by splitText.ts which splits
// the text into individual chars / words and animates them in on scroll.

import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    // id="about" is the scroll target used by the navbar "ABOUT" link
    <div className="about-section" id="about">
      <div className="about-me">
        {/* .title → gets char-split + scroll animation from setSplitText() */}
        <h3 className="title">{config.about.title}</h3>

        {/* .para → gets word-split + scroll animation from setSplitText() */}
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
