// TechStackNew.tsx — Inverted-pyramid tech stack grid with a video background.
//
// Structure:
//   • A fullscreen <video> autoplays as the section background (muted, looping).
//   • A dark overlay sits above the video for readability.
//   • The tech stack is rendered as an inverted pyramid:
//       Row 1: 12 items  (widest — core languages)
//       Row 2: 10 items  (frameworks & ML libs)
//       Row 3:  8 items  (databases & cloud)
//       Row 4:  6 items  (devops & editors)
//       Row 5:  4 items  (data & design tools)
//       Row 6:  2 items  (AI platforms)  ← tip of the pyramid
//   • Each icon links to the official documentation / homepage.
//   • Icons are loaded from jsDelivr CDN (devicons collection).

import "./styles/TechStackNew.css";

interface TechItem {
  name: string;  // Display name shown in the tooltip and <span> label
  icon: string;  // URL to the SVG icon (CDN-hosted)
  url: string;   // Link to the official site / docs
}

// ── Tech stack data ───────────────────────────────────────────────────────────
// Rows are ordered largest → smallest (inverted pyramid).
// To add a new technology, append it to the appropriate row or add a new row.
const techStack: TechItem[][] = [
  // Row 1 — 12 items (core programming languages + fundamental frameworks)
  [
    { name: "Python",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",           url: "https://python.org" },
    { name: "JavaScript",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",   url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "TypeScript",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",   url: "https://typescriptlang.org" },
    { name: "C",           icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",                     url: "https://en.cppreference.com/w/c" },
    { name: "C++",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",     url: "https://isocpp.org" },
    { name: "Kotlin",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",           url: "https://kotlinlang.org" },
    { name: "HTML",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",             url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { name: "CSS",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",               url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { name: "Bash",        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",               url: "https://www.gnu.org/software/bash/" },
    { name: "React",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",             url: "https://react.dev" },
    { name: "Next.js",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",           url: "https://nextjs.org" },
    { name: "Bootstrap",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",     url: "https://getbootstrap.com" },
  ],
  // Row 2 — 10 items (backend frameworks + ML libraries)
  [
    { name: "Node.js",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",           url: "https://nodejs.org" },
    { name: "Django",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",              url: "https://djangoproject.com" },
    { name: "Flask",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",             url: "https://flask.palletsprojects.com" },
    { name: "FastAPI",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",         url: "https://fastapi.tiangolo.com" },
    { name: "TensorFlow",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",   url: "https://tensorflow.org" },
    { name: "PyTorch",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",         url: "https://pytorch.org" },
    { name: "Scikit-learn",icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg", url: "https://scikit-learn.org" },
    { name: "OpenCV",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",           url: "https://opencv.org" },
    { name: "NumPy",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",             url: "https://numpy.org" },
    { name: "Tailwind",    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg", url: "https://tailwindcss.com" },
  ],
  // Row 3 — 8 items (databases + cloud platforms)
  [
    { name: "Pandas",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",           url: "https://pandas.pydata.org" },
    { name: "MySQL",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",             url: "https://mysql.com" },
    { name: "PostgreSQL",  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",   url: "https://postgresql.org" },
    { name: "MongoDB",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",         url: "https://mongodb.com" },
    { name: "Firebase",    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",          url: "https://firebase.google.com" },
    { name: "Redis",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",             url: "https://redis.io" },
    { name: "Docker",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",           url: "https://docker.com" },
    { name: "Azure",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",             url: "https://azure.microsoft.com" },
  ],
  // Row 4 — 6 items (dev tools + version control + cloud providers)
  [
    { name: "Git",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",                 url: "https://git-scm.com" },
    { name: "GitHub",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",           url: "https://github.com" },
    { name: "Linux",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",             url: "https://linux.org" },
    { name: "AWS",         icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", url: "https://aws.amazon.com" },
    { name: "VS Code",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",           url: "https://code.visualstudio.com" },
    { name: "Vercel",      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",           url: "https://vercel.com" },
  ],
  // Row 5 — 4 items (data science notebooks + design tools)
  [
    { name: "Jupyter",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",         url: "https://jupyter.org" },
    { name: "Figma",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",             url: "https://figma.com" },
    { name: "Postman",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg",         url: "https://postman.com" },
    { name: "Photoshop",   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg",     url: "https://adobe.com/products/photoshop" },
  ],
  // Row 6 — 2 items (tip of pyramid — AI / productivity platforms)
  [
    { name: "Hugging Face",icon: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",                      url: "https://huggingface.co" },
    { name: "MS Office",   icon: "https://img.icons8.com/color/48/microsoft-office-2019.png",                              url: "https://www.microsoft.com/microsoft-365" },
  ],
];

const TechStackNew = () => {
  return (
    <div className="techstack-new">

      {/* ── Video background ─────────────────────────────────────────────── */}
      {/* autoPlay + muted + playsInline are required for autoplay to work
          in modern browsers. loop keeps it running indefinitely.           */}
      <div className="techstack-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="techstack-video"
        >
          <source src="/video/video.webm" type="video/webm" />
        </video>
        {/* Semi-transparent dark overlay so white icons are readable */}
        <div className="techstack-overlay"></div>
      </div>

      {/* ── Content (sits above the video via z-index) ───────────────────── */}
      <div className="techstack-content">
        <h2>Tech Stack</h2>

        {/* Inverted pyramid grid: each row is a flex container centred by CSS */}
        <div className="techstack-pyramid">
          {techStack.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((tech, techIndex) => (
                // Each icon is a link to the technology's official page
                <a
                  key={techIndex}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="techstack-item"
                  title={tech.name}       // Browser tooltip on hover
                  data-cursor="disable"   // Tells Cursor.tsx to hide the custom cursor
                >
                  <img src={tech.icon} alt={tech.name} />
                  <span>{tech.name}</span>  {/* Label shown beneath the icon */}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
