# Portfolio Website - Complete File Guide

A 3D portfolio website built with React, TypeScript, Three.js, and GSAP.
Deployed on Vercel. Features a 3D character model, smooth scroll animations,
a chess game, and an AI chat assistant.

---

## Quick Reference: Where to Change Content

| What you want to change | File to edit |
|---|---|
| Name, title, bio, projects, experience, skills, social links | `src/config.ts` |
| Hero section labels ("AI Engineer", "Full-Stack Developer") | `src/components/Landing.tsx` |
| Tech stack icons/pyramid | `src/components/TechStackNew.tsx` |
| AI chat persona/system prompt | `src/pages/Play.tsx` (SYSTEM_PROMPT constant) |
| Resume button link | `src/components/SocialIcons.tsx` |

---

## Root-Level Files

### `src/config.ts` *** MOST IMPORTANT ***
The single source of truth for all portfolio content. Every section of the
website reads from this file. Edit this to change:
- `developer` — your name and title shown in the hero and navbar
- `social` — email and location
- `about` — your About Me paragraph
- `experiences[]` — career timeline entries (position, company, period, description)
- `projects[]` — work showcase cards (title, category, technologies, image, description)
- `contact` — all social media URLs (GitHub, LinkedIn, Twitter, Instagram, Facebook)
- `skills` — the two "What I Do" cards with title, description, and tool tags

### `package.json`
Lists all project dependencies and scripts. Key commands:
- `npm run dev` — starts the local development server
- `npm run build` — builds the project for production
- `npm run preview` — previews the production build locally

### `vite.config.ts`
Build tool configuration. Splits the bundle into separate chunks (three.js,
gsap, react, vendor) so the site loads faster. You rarely need to touch this.

### `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
TypeScript configuration files. Control how TypeScript compiles the code.
You don't need to edit these.

### `eslint.config.js`
Code linting rules. Catches errors and enforces code style. Leave as-is.

### `vercel.json`
Deployment configuration for Vercel. Tells Vercel to serve the SPA correctly
so routes like `/myworks` and `/play` work on refresh.

### `.env.example`
Template showing what environment variables are needed. Copy this to `.env`
and fill in your actual API keys (e.g., OpenAI key for the chat feature).

### `.gitignore`
Tells Git which files to ignore (node_modules, .env, build output, etc.).

---

## `src/` — Application Source Code

### `src/main.tsx`
The entry point of the React app. Mounts the `<App />` component into the
HTML page. You don't need to edit this.

### `src/App.tsx`
Sets up the router with three routes:
- `/` — the main portfolio homepage
- `/myworks` — the full projects gallery page
- `/play` — the chess + AI chat page

Also loads Vercel Analytics and Speed Insights (performance tracking).

### `src/App.css` / `src/index.css`
Global base styles. `index.css` resets browser defaults and sets fonts.
`App.css` has top-level layout styles.

### `src/config.ts`
(See "Most Important" above)

---

## `src/components/` — UI Components

### `src/components/MainContainer.tsx`
The main page wrapper. Assembles all sections in order:
Landing → About → WhatIDo → Career → Work → TechStackNew → CallToAction → Contact.
Also handles desktop vs. mobile detection and renders the 3D character only
on desktop.

### `src/components/Landing.tsx`
The hero/first-screen section. Shows your name (split into two lines) and
two rotating labels: "AI Engineer" and "Full-Stack Developer". On mobile,
shows a photo instead of the 3D character. The labels are hardcoded in this
file — edit here if you want to change those two role descriptions.

### `src/components/Navbar.tsx`
Top navigation bar. Shows your initials (from config) on the left, your
email on the right, and three nav links (About, Work, Contact) in the middle.
Also initializes Lenis smooth scrolling for the whole page.

### `src/components/About.tsx`
The "About Me" section. Reads `config.about.title` and `config.about.description`.
Very simple — just a heading and a paragraph.

### `src/components/WhatIDo.tsx`
The "WHAT I DO" section with two interactive hover cards. Reads from
`config.skills.develop` and `config.skills.design`. On desktop, cards expand
on hover. On touch devices, they expand on click.

### `src/components/Career.tsx`
The career timeline section. Loops through `config.experiences[]` and renders
each job as a card with position, company, year, and description.

### `src/components/Work.tsx`
The horizontal-scrolling projects showcase. Shows the first 5 projects from
`config.projects[]`. On desktop, it pins the section and scrolls horizontally
using GSAP. Includes a "See All Works" button linking to `/myworks`.

### `src/components/WorkImage.tsx`
A small helper component used by Work.tsx to render project images with a
hover/parallax effect.

### `src/components/TechStackNew.tsx`
The tech stack section with an inverted pyramid layout of technology icons.
Has a video background (`/video/video.webm`). The tech items are hardcoded
directly in this file (not in config.ts) — edit here to add/remove technologies.
Icons are loaded from the devicons CDN.

### `src/components/CallToAction.tsx`
A simple section with two buttons: "Play With Me" (links to `/play`) and
"Hire Me" (links to your LinkedIn from config).

### `src/components/Contact.tsx`
The footer/contact section. Shows your name, email, location, and all social
media links from `config.contact`. Also shows a copyright notice.

### `src/components/SocialIcons.tsx`
The floating social icons panel (visible on all pages). Shows GitHub, LinkedIn,
Twitter, Instagram icons with a magnetic hover effect. Also has a RESUME button
— update the `href="#"` in this file to link to your actual resume PDF.

### `src/components/HoverLinks.tsx`
A tiny reusable component that creates the sliding text hover effect used in
the navbar links and the Resume button.

### `src/components/Cursor.tsx`
Custom animated cursor that replaces the default browser cursor on desktop.
Changes shape/style based on what element is being hovered.

---

## `src/components/Character/` — 3D Character

This folder handles the interactive 3D character shown on the homepage (desktop only).

### `src/components/Character/index.tsx`
Main entry point for the 3D character. Loads the encrypted 3D model, sets up
the Three.js scene, and handles the loading progress. When loading is complete,
it triggers the page entrance animations.

### `src/components/Character/Scene.tsx`
Sets up the Three.js WebGL renderer, camera, and animation loop for the 3D scene.

### `src/components/Character/utils/character.ts`
Handles loading the 3D character GLB model and setting up its animations.

### `src/components/Character/utils/animationUtils.ts`
Controls the character's animations (idle, walking, etc.) based on scroll position
and mouse movement.

### `src/components/Character/utils/mouseUtils.ts`
Makes the character's head/eyes follow the mouse cursor.

### `src/components/Character/utils/lighting.ts`
Sets up the 3D scene lighting (ambient light, directional lights, environment map).

### `src/components/Character/utils/resizeUtils.ts`
Handles resizing the 3D canvas when the browser window changes size.

### `src/components/Character/utils/decrypt.ts`
Decrypts the encrypted 3D model file at runtime before loading it into Three.js.
The model is encrypted to prevent easy downloading.

### `src/components/Character/exports.ts`
Exports shared references (like the Three.js clock) used across the character utilities.

---

## `src/components/utils/` — Animation Utilities

### `src/components/utils/initialFX.ts`
Runs the entrance animations when the page first loads (after the loading screen
disappears). Animates the hero text, navbar, and social icons into view.

### `src/components/utils/splitText.ts`
Splits heading text into individual characters so each letter can be animated
separately with GSAP.

### `src/components/utils/GsapScroll.ts`
Sets up scroll-triggered animations (e.g., text fade-ins, section reveals) using
GSAP ScrollTrigger throughout the page.

---

## `src/context/`

### `src/context/LoadingProvider.tsx`
Manages the loading state for the whole app. Shows the loading screen while the
3D model is being loaded. On mobile, skips the loading screen entirely and
jumps straight to the animations. Wraps the app in a React Context so any
component can check if loading is still in progress.

---

## `src/utils/`

### `src/utils/textSplitter.ts`
Utility that splits a string into HTML span elements for per-character animations.

### `src/utils/redoxchessEngine.ts`
Wrapper around the Redox chess engine (a WebAssembly chess engine). Handles
initializing the WASM engine, sending positions, and getting the AI's best move.

---

## `src/pages/` — Full Pages

### `src/pages/MyWorks.tsx`
The full projects gallery page (`/myworks`). Shows all projects from
`config.projects[]` in a grid layout with image, title, category, description,
and technologies. Has a back button to return to the homepage.

### `src/pages/MyWorks.css`
Styles for the MyWorks page.

### `src/pages/Play.tsx`
The interactive chess + AI chat page (`/play`). Contains:
- A fully functional chess board (you play as white, the AI engine plays as black)
- A chat panel where visitors can talk to an AI that responds as "you" (Pratham)
- The `SYSTEM_PROMPT` constant near the top defines the AI persona — edit this to
  update what the AI knows about you and how it responds
- Chat messages are sent to `/api/chat` (the serverless function)

### `src/pages/Play.css`
Styles for the Play page (chess board, chat panel, controls).

---

## `src/components/styles/` — CSS Files

Each component has its own CSS file here. The naming matches the component:

| CSS File | Styles for |
|---|---|
| `Landing.css` | Hero section layout and text animations |
| `Navbar.css` | Top navigation bar |
| `About.css` | About Me section |
| `WhatIDo.css` | The "What I Do" hover cards |
| `Career.css` | Career timeline |
| `Work.css` | Horizontal scrolling projects section |
| `TechStackNew.css` | Tech stack pyramid and video background |
| `CallToAction.css` | The two CTA buttons |
| `Contact.css` | Footer contact section |
| `SocialIcons.css` | Floating social icons panel |
| `Cursor.css` | Custom cursor |
| `Loading.css` | Loading screen |
| `style.css` | Shared styles (e.g., HoverLinks animation) |

---

## `api/` — Serverless Backend

### `api/chat.js`
A Vercel serverless function that proxies chat messages to the OpenAI API.
The frontend sends messages here, and this function adds the API key and
forwards the request to OpenAI. The API key is stored as an environment variable
on Vercel (never in the frontend code).

---

## `public/` — Static Assets

### `public/images/`
All images used on the site:
- `mypicnbg.png` — your photo shown on mobile (no background)
- `mypic.jpeg` — your photo shown in the chess game opponent avatar
- `placeholder.webp` — default image for projects without a custom image
- `project-1.webp` through `project-5.webp` — old project images (unused)
- `react.webp`, `node.webp`, etc. — old tech stack images (unused, replaced by CDN icons)
- Various `.png` files (gamekroy, floodhub, etc.) — old project screenshots (unused)

To add a custom image for a project: put the image in this folder, then
reference it in `src/config.ts` as `image: "/images/your-image.png"`.

### `public/video/video.webm`
Background video shown behind the Tech Stack section. Replace this file to
change the background video.

### `public/models/`
- `character.glb` — the actual 3D character model (large file, tracked with Git LFS)
- `character.enc` — the encrypted version of the model (used at runtime)
- `encrypt.cjs` — script used to encrypt the model file
- `char_enviorment.hdr` — HDR environment map for 3D lighting

### `public/draco/`
- `draco_decoder.js` / `draco_decoder.wasm` — Draco compression library for
  loading compressed 3D models efficiently.

### `public/redoxchess.js` / `public/redoxchess.wasm`
The Redox chess engine compiled to WebAssembly. Powers the AI opponent in the
chess game on the `/play` page.

---

## Other Root Files

### `build_output.txt` / `build_errors.txt`
Logs from previous build attempts. Not part of the source code — can be ignored or deleted.

### `test.js`
A small test/scratch script. Not part of the app.

### `screen-capture (13).webm` / `Screenshot_2026-04-08_22-10-00.png`
Screen recording and screenshot files left in the root. Not part of the app —
can be moved or deleted.

### `.github/FUNDING.yml`
GitHub Sponsors configuration. Lists funding platforms for the repo.

### `vite.config.old.ts`
An older version of the Vite config kept for reference. Not active.
