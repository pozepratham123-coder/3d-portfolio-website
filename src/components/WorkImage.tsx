// WorkImage.tsx — Project thumbnail for Work.tsx cards.
//
// Displays a static image by default. If a `video` prop is passed, hovering
// over the card fetches the video file, creates a Blob URL, and plays it
// inline — avoiding a visible "pop" that would occur if the src was set
// before the video was downloaded.
//
// An external link arrow icon (MdArrowOutward) is shown if a `link` prop
// is provided, turning the image into a clickable project link.

import { useState } from "react";
import { MdArrowOutward } from "react-icons/md";

interface Props {
  image: string;   // Path to the static thumbnail (always required)
  alt?: string;    // Alt text for the image (used for accessibility + SEO)
  video?: string;  // Optional: path inside src/assets/ for the hover preview video
  link?: string;   // Optional: URL that the card links to when clicked
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);  // Whether the video overlay is active
  const [video, setVideo] = useState("");          // Blob URL of the loaded video

  // Triggered when the mouse enters the card image area
  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      // Fetch the video from assets, convert to a Blob URL so it plays immediately
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  return (
    <div className="work-image">
      {/* Wrapping anchor — only navigates if `link` is provided */}
      <a
        className="work-image-in"
        href={props.link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVideo(false)} // Hide video when cursor leaves
        target="_blank"
        data-cursor={"disable"}
      >
        {/* Arrow icon overlay — only shown when the card has an external link */}
        {props.link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}

        {/* Static thumbnail — always visible */}
        <img src={props.image} alt={props.alt} />

        {/* Video overlay — rendered on top of the image when hovered */}
        {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
