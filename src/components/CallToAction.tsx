// CallToAction.tsx — Two prominent CTA buttons rendered between TechStack and Contact.
//
//  "Play With Me" → navigates to /play (chess + AI chat page)
//  "Hire Me"      → opens LinkedIn profile in a new tab

import { Link } from "react-router-dom";
import { config } from "../config";
import "./styles/CallToAction.css";

const CallToAction = () => {
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        {/* Internal route link — React Router handles this without a full page reload */}
        <Link to="/play" className="cta-btn cta-btn-play" data-cursor="disable">
          Play With Me →
        </Link>

        {/* External link — opens LinkedIn in a new tab */}
        <a
          href={config.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          Hire Me →
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
