// HoverLinks.tsx — Animated text link used in the navbar and resume button.
//
// How the hover animation works (CSS-driven, see style.css):
//   The text is rendered twice — once visible, once hidden below it — inside
//   .hover-in. On hover, the outer container clips the overflow and the
//   CSS transform slides both copies upward. The duplicate text slides into
//   view from below, creating a smooth "text rolls up" effect.
//
//   Visible DOM structure:
//     <div class="hover-link">
//       <div class="hover-in">
//         ABOUT              ← first copy (slides out above on hover)
//         <div>ABOUT</div>   ← second copy (slides in from below on hover)
//       </div>
//     </div>
//
// Props:
//   text   — the string to display (e.g. "ABOUT", "WORK", "RESUME")
//   cursor — if true, does NOT add data-cursor="disable" (cursor remains custom)

import "./styles/style.css";

const HoverLinks = ({ text, cursor }: { text: string; cursor?: boolean }) => {
  return (
    // data-cursor="disable" hides the custom cursor blob when hovering nav links
    <div className="hover-link" data-cursor={!cursor && `disable`}>
      <div className="hover-in">
        {text} {/* First (top) copy of the text */}
        <div>{text}</div> {/* Second (bottom) copy — slides up on hover */}
      </div>
    </div>
  );
};

export default HoverLinks;
