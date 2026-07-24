// Career.tsx — Vertical experience timeline section.
//
// Renders all entries from config.experiences as a timeline list.
// The vertical connecting line (.career-timeline) and each card
// (.career-info-box) are animated by the careerTimeline in GsapScroll.ts:
//   • The line grows from 0% to 100% height as you scroll.
//   • Cards fade in with a stagger as the line passes them.
//
// The year label on each card is derived from the period string using
// getDisplayYear() below — "Present" → "NOW", ranges → start year only.

import "./styles/Career.css";
import { config } from "../config";

// Extracts a short display year from a period string like "Sep 2024 - Present"
// Returns: "NOW" for current roles, "Sep 2024" for past ones, raw value otherwise.
const getDisplayYear = (period: string) => {
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) {
    return period.split(" - ")[0]; // Show start date for completed ranges
  }
  return period; // Fallback: return the raw period as-is
};

const Career = () => {
  return (
    // .section-container applies a max-width and centers the content
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>

        <div className="career-info">
          {/* Vertical line that grows as you scroll — animated by GsapScroll.ts */}
          <div className="career-timeline">
            {/* Animated dot that pulses at the end of the growing line */}
            <div className="career-dot"></div>
          </div>

          {/* One card per experience entry — stagger-faded in by GSAP */}
          {config.experiences.map((exp, index) => (
            <div key={index} className="career-info-box">

              {/* ── Left column: year label ───────────────────────── */}
              <div className="career-year">
                <h3>{getDisplayYear(exp.period)}</h3>
              </div>

              {/* ── Right column: all details ─────────────────────── */}
              <div className="career-details">

                {/* Top row: role + company + period + location */}
                <div className="career-header">
                  <div className="career-role">
                    <h4>{exp.position}</h4>
                    <h5>{exp.company}</h5>
                  </div>
                  <div className="career-meta">
                    <span className="career-period">{exp.period}</span>
                    <span className="career-location">{exp.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p>{exp.description}</p>

                {/* Responsibilities bullet list */}
                <ul className="career-responsibilities">
                  {exp.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                {/* Technology / skill tags */}
                <div className="career-tags">
                  {exp.technologies.map((tech, i) => (
                    <span key={i} className="career-tag">{tech}</span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
