import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import type { SquirclePoint } from "../../../../src";
import { getSquircleDebugPath } from "../../../../src/core";
import { presets } from "../../presets";
import { makePolySnippets, makeRectSnippets } from "../../snippets";
import { Annotation } from "../ui/Annotation";
import { OutputTabs } from "./OutputTabs";
import { PolygonControls } from "./PolygonControls";
import { PolyPreview, RectPreview } from "./PreviewCanvas";
import { RectangleControls } from "./RectangleControls";
import { rectToPoints, type PlaygroundTab, type PolyState, type RectState } from "./state";

export interface PlaygroundProps {
  tab: PlaygroundTab;
  onTabChange: (tab: PlaygroundTab) => void;
  rect: RectState;
  updateRect: (patch: Partial<RectState>) => void;
  poly: PolyState;
  updatePoly: (patch: Partial<PolyState>) => void;
  onReset: () => void;
}

export function PlaygroundPanel({
  tab,
  onTabChange,
  rect,
  updateRect,
  poly,
  updatePoly,
  onReset,
}: PlaygroundProps) {
  // Rectangle geometry: same 4-point construction getSquircleRectPath uses
  // internally, so the debug handles line up with the produced path exactly.
  const rectPoints = useMemo(() => rectToPoints(rect), [rect]);
  const rectDebug = useMemo(
    () =>
      getSquircleDebugPath(rectPoints, {
        defaultSmoothness: rect.cornerSmoothing,
        precision: rect.precision,
      }),
    [rectPoints, rect.cornerSmoothing, rect.precision]
  );

  const polyPreset = useMemo(
    () => presets.find((preset) => preset.id === poly.presetId) ?? presets[0],
    [poly.presetId]
  );
  const polyPoints = poly.points ?? polyPreset.points;
  const polyDebug = useMemo(
    () =>
      getSquircleDebugPath(polyPoints, {
        defaultRadius: poly.radius,
        defaultSmoothness: poly.smoothness,
        precision: poly.precision,
      }),
    [polyPoints, poly.radius, poly.smoothness, poly.precision]
  );

  const snippets = useMemo(
    () =>
      tab === "rect"
        ? makeRectSnippets(rect, rectDebug.path)
        : makePolySnippets(
            polyPoints,
            {
              defaultRadius: poly.radius,
              defaultSmoothness: poly.smoothness,
              precision: poly.precision,
            },
            polyDebug.path
          ),
    [tab, rect, rectDebug.path, polyPoints, poly.radius, poly.smoothness, poly.precision, polyDebug.path]
  );

  const svgMarkup =
    tab === "rect"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rect.width} ${rect.height}">\n  <path d="${rectDebug.path}" fill="#7c3aed" />\n</svg>\n`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 440">\n  <path d="${polyDebug.path}" fill="#7c3aed" />\n</svg>\n`;

  const handlePolyPoints = (points: SquirclePoint[]) => updatePoly({ points });

  return (
    <div>
      <section id="playground" className="playground sketch--b" aria-label="Playground">
        <div className="pg-head">
          <span className="pg-title">PLAYGROUND</span>
          <button type="button" className="pg-reset" onClick={onReset}>
            Reset <RotateCcw size={12} />
          </button>
        </div>

        <div className="pg-tabs" role="tablist" aria-label="Shape mode">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "rect"}
            className={`pg-tab ${tab === "rect" ? "active" : ""}`}
            onClick={() => onTabChange("rect")}
          >
            RECTANGLE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "poly"}
            className={`pg-tab ${tab === "poly" ? "active" : ""}`}
            onClick={() => onTabChange("poly")}
          >
            POLYGON
          </button>
        </div>

        {tab === "rect" ? (
          <RectangleControls rect={rect} update={updateRect} />
        ) : (
          <PolygonControls poly={poly} update={updatePoly} />
        )}

        {tab === "rect" ? (
          <RectPreview
            width={rect.width}
            height={rect.height}
            path={rectDebug.path}
            corners={rectDebug.corners}
            points={rectPoints}
            showHandles={rect.showHandles}
          />
        ) : (
          <PolyPreview
            points={polyPoints}
            path={polyDebug.path}
            corners={polyDebug.corners}
            showHandles={poly.showHandles}
            editMode={poly.editMode}
            onPointsChange={handlePolyPoints}
          />
        )}

        <OutputTabs snippets={snippets} svgMarkup={svgMarkup} />
      </section>

      <div className="pg-annotation">
        <Annotation arrow="up-right">
          Real-time preview + code.
          <br />
          Update any value to see the path.
        </Annotation>
      </div>
    </div>
  );
}
