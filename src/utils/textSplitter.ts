// textSplitter.ts — Custom text splitting utility (replaces GSAP SplitText plugin).
//
// Wraps text content inside DOM spans so GSAP can animate individual
// characters, words, or lines independently.
//
// Usage:
//   const splitter = new TextSplitter(".my-heading", { type: "chars,lines" });
//   gsap.from(splitter.chars, { opacity: 0, y: 50, stagger: 0.05 });
//   // Later, to restore original HTML:
//   splitter.revert();
//
// Supported `type` combinations:
//   "chars"        → wraps each character in <span class="split-char">
//   "words"        → wraps each word in <span class="split-word">
//   "chars,words"  → words first, then chars inside each word (nested)
//   "lines"        → groups chars/words into line wrappers using real layout
//                    (uses getBoundingClientRect to detect line breaks)
//
// The original innerHTML of each element is stored in a Map so revert()
// can restore it exactly, removing all injected spans.

export class TextSplitter {
  chars: Element[] = [];    // All .split-char span elements
  words: Element[] = [];    // All .split-word span elements
  lines: Element[] = [];    // All line wrapper spans
  elements: Element[] = []; // The original root elements
  selector: string | Function;

  // Map from element → its original innerHTML (for revert)
  private originalHTML: Map<Element, string> = new Map();

  constructor(
    target: string | Element | NodeListOf<Element> | Element[],
    vars?: { type?: string; linesClass?: string }
  ) {
    const type = vars?.type || "chars,words,lines"; // Default: split everything
    const linesClass = vars?.linesClass || "split-line"; // CSS class for line wrappers

    // ── Resolve the target into an Element array ─────────────────────────
    let elements: Element[] = [];
    if (typeof target === "string") {
      elements = Array.from(document.querySelectorAll(target)); // CSS selector
    } else if (target instanceof NodeList) {
      elements = Array.from(target);
    } else if (Array.isArray(target)) {
      elements = target;
    } else {
      elements = [target]; // Single element passed directly
    }

    this.selector = typeof target === "string" ? target : "";
    this.elements = elements;

    elements.forEach((element) => {
      // Store original HTML before mutation so revert() can restore it
      this.originalHTML.set(element, element.innerHTML);

      // ── Splitting logic ─────────────────────────────────────────────
      if (type.includes("chars") && type.includes("words")) {
        // Nested: split into words first, then split each word into chars
        this.splitWords(element);
        this.splitCharsFromWords(element);
      } else if (type.includes("chars")) {
        this.splitChars(element); // Chars only (no word wrapper)
      } else if (type.includes("words")) {
        this.splitWords(element); // Words only
      }

      // Lines are always processed last (needs the char/word spans in place
      // so getBoundingClientRect() can detect their vertical positions)
      if (type.includes("lines")) {
        this.splitLines(element, linesClass);
      }
    });
  }

  // ── splitChars ─────────────────────────────────────────────────────────────
  // Replaces the element's text with one <span class="split-char"> per character.
  // Spaces are preserved as non-breaking spans; newlines become <br>.
  private splitChars(element: Element) {
    const text = element.textContent || "";
    const chars = text.split("");

    element.innerHTML = chars
      .map((char) => {
        if (char === " ") {
          return '<span class="split-char"> </span>'; // Preserve spacing
        }
        if (char === "\n") {
          return "<br>"; // Preserve explicit newlines
        }
        return `<span class="split-char">${char}</span>`;
      })
      .join("");

    this.chars.push(...Array.from(element.querySelectorAll(".split-char")));
  }

  // ── splitWords ─────────────────────────────────────────────────────────────
  // Replaces element text with one <span class="split-word"> per word.
  // Whitespace between words is preserved as raw text (not wrapped).
  private splitWords(element: Element) {
    const text = element.textContent || "";
    const words = text.split(/(\s+)/); // Split on whitespace, keeping delimiters

    element.innerHTML = words
      .map((word) => {
        if (word.trim().length === 0) {
          return word; // Keep whitespace as-is between word spans
        }
        return `<span class="split-word">${word}</span>`;
      })
      .join("");

    this.words.push(...Array.from(element.querySelectorAll(".split-word")));
  }

  // ── splitCharsFromWords ────────────────────────────────────────────────────
  // After splitWords(), further splits each .split-word into individual chars.
  // Used when both "chars" and "words" are in the type string.
  private splitCharsFromWords(element: Element) {
    const words = element.querySelectorAll(".split-word");
    words.forEach((word) => {
      const text = word.textContent || "";
      const chars = text.split("");
      word.innerHTML = chars
        .map((char) => `<span class="split-char">${char}</span>`)
        .join("");
      this.chars.push(...Array.from(word.querySelectorAll(".split-char")));
    });
  }

  // ── splitLines ─────────────────────────────────────────────────────────────
  // Groups .split-word / .split-char elements into line wrapper spans by
  // comparing their rendered top positions (getBoundingClientRect).
  // Elements on the same horizontal line (within 5 px) are grouped together.
  // This must run inside requestAnimationFrame to ensure layout is complete.
  private splitLines(element: Element, linesClass: string) {
    requestAnimationFrame(() => {
      const items = element.querySelectorAll(".split-word, .split-char");
      if (items.length === 0) return;

      let currentLine: Element[] = [];
      let lines: Element[][] = [];
      let currentTop = 0; // Y position of the current line being built

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (currentTop === 0) {
          currentTop = rect.top; // Initialise with the first item's top
        }

        // A difference of more than 5 px means a new line started
        if (Math.abs(rect.top - currentTop) > 5) {
          if (currentLine.length > 0) {
            lines.push([...currentLine]); // Save the completed line
          }
          currentLine = [item]; // Start a new line with this item
          currentTop = rect.top;
        } else {
          currentLine.push(item); // Same line — add to current group
        }
      });

      // Don't forget the last line (loop ends without pushing it)
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // Wrap each line group in a <span class="linesClass"> with display:block
      // This wrapper is what gets overflow:hidden in CSS for the reveal effect
      lines.forEach((line) => {
        if (line.length === 0) return;
        const lineWrapper = document.createElement("span");
        lineWrapper.className = linesClass;
        lineWrapper.style.display = "block";

        const firstItem = line[0];
        firstItem.parentNode?.insertBefore(lineWrapper, firstItem); // Insert before first item

        line.forEach((item) => {
          if (item.parentNode === lineWrapper.parentNode) {
            lineWrapper.appendChild(item); // Move item into the wrapper
          }
        });
      });

      this.lines.push(...Array.from(element.querySelectorAll(`.${linesClass}`)));
    });
  }

  // ── revert ─────────────────────────────────────────────────────────────────
  // Restores all elements to their original innerHTML, clearing all injected spans.
  // Call this before re-splitting (e.g. on resize) to avoid double-wrapping.
  revert() {
    this.elements.forEach((element) => {
      const original = this.originalHTML.get(element);
      if (original !== undefined) {
        element.innerHTML = original;
      }
    });
    // Clear all collected references
    this.chars = [];
    this.words = [];
    this.lines = [];
    this.originalHTML.clear();
  }
}
