import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently in the "reading band" near the top
 * of the viewport. Also activates the last section when scrolled to the
 * very bottom of the page (it may never enter the band on short pages).
 */
export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }
      const band = window.innerHeight * 0.22;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= band) current = section.id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return activeId;
}
