import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { PlaygroundPanel } from "./components/playground/PlaygroundPanel";
import {
  defaultPolyState,
  defaultRectState,
  type PlaygroundTab,
  type PolyState,
  type RectState,
} from "./components/playground/state";
import { Api } from "./components/sections/Api";
import { Development } from "./components/sections/Development";
import { FeatureCards } from "./components/sections/FeatureCards";
import { GettingStarted } from "./components/sections/GettingStarted";
import { Guides } from "./components/sections/Guides";
import { Hero } from "./components/sections/Hero";
import { Internals } from "./components/sections/Internals";
import { PreviewStrip } from "./components/sections/PreviewStrip";
import { QuickCode } from "./components/sections/QuickCode";
import { useScrollSpy } from "./hooks/useScrollSpy";
import { allSectionIds } from "./nav";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    setMatches(list.matches);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function App() {
  const activeId = useScrollSpy(allSectionIds);
  const narrow = useMediaQuery("(max-width: 1200px)");

  // Playground state lives here so the panel keeps its values when it
  // re-slots between the right column and the inline position.
  const [tab, setTab] = useState<PlaygroundTab>("rect");
  const [rect, setRect] = useState<RectState>(defaultRectState);
  const [poly, setPoly] = useState<PolyState>(defaultPolyState);

  const playground = (
    <PlaygroundPanel
      tab={tab}
      onTabChange={setTab}
      rect={rect}
      updateRect={(patch) => setRect((current) => ({ ...current, ...patch }))}
      poly={poly}
      updatePoly={(patch) => setPoly((current) => ({ ...current, ...patch }))}
      onReset={() => (tab === "rect" ? setRect(defaultRectState) : setPoly(defaultPolyState))}
    />
  );

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar activeId={activeId} />

        <main className="main">
          <Hero />
          <PreviewStrip />
          <QuickCode />
          {narrow ? <div className="playground-inline">{playground}</div> : null}
          <FeatureCards />
          <GettingStarted />
          <Guides />
          <Api />
          <Internals />
          <Development />
        </main>

        <div className="playground-col">
          {!narrow ? <div className="playground-sticky">{playground}</div> : null}
        </div>
      </div>
    </>
  );
}
