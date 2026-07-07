import { Check, Copy, Github } from "lucide-react";
import { getSquircleRectPath } from "../../../src";
import { useCopy } from "../hooks/useCopy";
import { useGitHubStars } from "../hooks/useGitHubStars";

const REPO_URL = "https://github.com/msurguy/squircle-path-kit";
const INSTALL = "npm install @msurguy/squircle-path-kit";

const markPath = getSquircleRectPath({
  x: 3,
  y: 3,
  width: 26,
  height: 26,
  cornerRadius: 9,
  cornerSmoothing: 0.8,
});

const navLinks = [
  { label: "DOCS", href: "#overview" },
  { label: "PLAYGROUND", href: "#playground" },
  { label: "API", href: "#api-getsquirclepath" },
  { label: "EXAMPLES", href: "#rectangles" },
  { label: "ABOUT", href: "#how-it-matches-figma" },
];

export function Header() {
  const stars = useGitHubStars();
  const { copied, copy } = useCopy();

  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="#overview">
          <span className="brand-mark" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d={markPath} fill="none" stroke="var(--ink)" strokeWidth="2" />
            </svg>
          </span>
          <span>
            <span className="brand-title"># squircle-path-kit</span>
            <br />
            <span className="brand-tagline">Figma-exact SVG squircle paths</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Site">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="gh-link" href={REPO_URL} target="_blank" rel="noreferrer">
            <Github size={19} />
            <span className="gh-stars">☆ {stars}</span>
          </a>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => copy("install", INSTALL)}
            title={INSTALL}
          >
            {copied === "install" ? <Check size={13} /> : <Copy size={13} />}
            npm i
          </button>
        </div>
      </div>
    </header>
  );
}
