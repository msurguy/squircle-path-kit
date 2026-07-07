import { useEffect, useRef } from "react";
import { navGroups } from "../nav";

export function Sidebar({ activeId }: { activeId: string }) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const list = window.matchMedia("(max-width: 860px)");
    const apply = () => {
      // drawer starts/collapses closed on mobile, always open on desktop
      if (detailsRef.current) detailsRef.current.open = !list.matches;
    };
    apply();
    list.addEventListener("change", apply);
    return () => list.removeEventListener("change", apply);
  }, []);

  const closeDrawer = () => {
    const details = detailsRef.current;
    // Only auto-close when the element is actually a drawer (mobile styling);
    // on desktop the <details> is always open and clicks shouldn't collapse it.
    if (details && window.matchMedia("(max-width: 860px)").matches) {
      details.open = false;
    }
  };

  return (
    <aside className="sidebar" aria-label="Docs navigation">
      <details ref={detailsRef} className="sidebar-details" open>
        <summary className="sidebar-summary">
          On this page <span aria-hidden="true">▾</span>
        </summary>
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-group-title">{group.title.toUpperCase()}</p>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  className={`nav-link ${activeId === item.id ? "active" : ""}`}
                  href={`#${item.id}`}
                  onClick={closeDrawer}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </details>

      <div className="sidebar-note sketch sketch--c tilt-l">
        Built from Figma ground truth.
        <br />
        <span className="u-squiggle u-squiggle--blue">Matches within 0.01px</span>
      </div>
    </aside>
  );
}
