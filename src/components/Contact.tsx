// Contact.tsx — Footer / contact section (the last section on the page).
//
// On mount, a GSAP timeline animates the heading and contact boxes into view
// from below (y: 50 → 0) as soon as the section enters the viewport at 80%.
//
// The Facebook link is conditionally rendered — if config.contact.facebook
// is an empty string, the anchor is not rendered at all (avoids a broken link).

import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  useEffect(() => {
    // ── Scroll-triggered entrance animation ────────────────────────────────
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",              // Fires when top of section is 80% down the viewport
        end: "bottom center",
        toggleActions: "play none none none", // Only plays once on entry
      },
    });

    // 1. Heading slides up from below
    contactTimeline.fromTo(
      ".contact-section h3",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // 2. The three contact boxes stagger in after the heading
    contactTimeline.fromTo(
      ".contact-box",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,  // Each box starts 150 ms after the previous one
        ease: "power3.out",
      },
      "-=0.4" // Overlap: start 0.4 s before the previous tween finishes
    );

    return () => {
      contactTimeline.kill(); // Clean up ScrollTrigger + tween on unmount
    };
  }, []);

  return (
    // id="contact" is the scroll target for the navbar "CONTACT" link
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">

        {/* Large name heading at the top of the contact section */}
        <h3>{config.developer.fullName}</h3>

        <div className="contact-flex">
          {/* ── Box 1: Email + Location ─────────────────────────────────── */}
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${config.contact.email}`} data-cursor="disable">
                {config.contact.email}
              </a>
            </p>
            <h4>Location</h4>
            <p>
              <span>{config.social.location}</span>
            </p>
          </div>

          {/* ── Box 2: Social links ──────────────────────────────────────── */}
          <div className="contact-box">
            <h4>Social</h4>

            <a
              href={config.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>

            <a
              href={config.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>

            <a
              href={config.contact.twitter}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Twitter <MdArrowOutward />
            </a>

            {/* Only rendered if a Facebook URL is provided in config */}
            {config.contact.facebook && (
              <a
                href={config.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                Facebook <MdArrowOutward />
              </a>
            )}

            <a
              href={config.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram <MdArrowOutward />
            </a>
          </div>

          {/* ── Box 3: Credit + Copyright ────────────────────────────────── */}
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>{config.developer.fullName}</span>
            </h2>
            {/* © symbol from react-icons + current year (computed at render time) */}
            <h5>
              <MdCopyright /> {new Date().getFullYear()}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
