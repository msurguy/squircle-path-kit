import {
  Braces,
  Check,
  Copy,
  Crosshair,
  Download,
  Grid3X3,
  MousePointer2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { getSquirclePath, type SquirclePoint } from "../../src";
import { getSquircleDebugPath } from "../../src/core";
import { presets, type Preset } from "./presets";
import { makeSnippets, type CodeTab } from "./snippets";

type CornerOverrides = Record<number, { radius?: number; smoothness?: number }>;

const groups = ["Basic", "Polygons", "Stars", "UI shapes"] as const;
const codeTabs: Array<{ id: CodeTab; label: string }> = [
  { id: "js", label: "JS" },
  { id: "svg", label: "SVG" },
  { id: "react", label: "React" },
  { id: "react-native", label: "React Native" },
  { id: "css", label: "CSS" },
];

const initialPreset = presets[0];

function clonePoints(points: SquirclePoint[]) {
  return points.map((point) => ({ ...point }));
}

function presetOverrides(preset: Preset): CornerOverrides {
  return Object.fromEntries(
    preset.points.map((point, index) => [
      index,
      {
        radius: point.radius ?? preset.radius,
        smoothness: point.smoothness ?? preset.smoothness,
      },
    ])
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="control">
      <span className="control-label">
        {label}
        <strong>
          {step < 1 ? value.toFixed(2) : value.toFixed(0)}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function App() {
  const [activePresetId, setActivePresetId] = useState(initialPreset.id);
  const [customPoints, setCustomPoints] = useState<SquirclePoint[] | null>(null);
  const [radius, setRadius] = useState(initialPreset.radius);
  const [smoothness, setSmoothness] = useState(initialPreset.smoothness);
  const [precision, setPrecision] = useState(2);
  const [fillColor, setFillColor] = useState(initialPreset.color);
  const [fillOpacity, setFillOpacity] = useState(0.18);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(true);
  const [showComparison, setShowComparison] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [perCorner, setPerCorner] = useState(false);
  const [cornerOverrides, setCornerOverrides] = useState<CornerOverrides>({});
  const [editMode, setEditMode] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [codeTab, setCodeTab] = useState<CodeTab>("js");
  const [copied, setCopied] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? initialPreset,
    [activePresetId]
  );

  const basePoints = customPoints ?? activePreset.points;
  const isCustom = customPoints !== null;

  const points = useMemo<SquirclePoint[]>(
    () =>
      basePoints.map((point, index) => ({
        x: point.x,
        y: point.y,
        radius: perCorner ? cornerOverrides[index]?.radius ?? point.radius ?? radius : radius,
        smoothness: perCorner ? cornerOverrides[index]?.smoothness ?? point.smoothness ?? smoothness : smoothness,
      })),
    [basePoints, cornerOverrides, perCorner, radius, smoothness]
  );

  const debug = useMemo(
    () => getSquircleDebugPath(points, { precision, defaultRadius: radius, defaultSmoothness: smoothness }),
    [points, precision, radius, smoothness]
  );
  const roundedPath = useMemo(
    () => getSquirclePath(points.map((point) => ({ ...point, smoothness: 0 })), { precision }),
    [points, precision]
  );
  const snippets = useMemo(
    () =>
      makeSnippets({
        points,
        path: debug.path,
        fillColor,
        fillOpacity,
        strokeWidth,
        precision,
      }),
    [debug.path, fillColor, fillOpacity, points, precision, strokeWidth]
  );

  const setPreset = (preset: Preset) => {
    setActivePresetId(preset.id);
    setCustomPoints(null);
    setRadius(preset.radius);
    setSmoothness(preset.smoothness);
    setFillColor(preset.color);
    setSelectedPoint(null);
    setEditMode(false);
    const hasCornerOverrides = preset.points.some((point) => point.radius !== undefined || point.smoothness !== undefined);
    setPerCorner(hasCornerOverrides);
    setCornerOverrides(hasCornerOverrides ? presetOverrides(preset) : {});
  };

  const getSvgPoint = useCallback((event: React.PointerEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round(((event.clientX - rect.left) / rect.width) * 600),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 440),
    };
  }, []);

  const startCustomFromCurrent = () => {
    setCustomPoints(clonePoints(points));
    setEditMode(true);
    setSelectedPoint(null);
  };

  const startBlankCustom = () => {
    setCustomPoints([
      { x: 180, y: 120 },
      { x: 440, y: 120 },
      { x: 500, y: 320 },
      { x: 130, y: 350 },
    ]);
    setPerCorner(false);
    setCornerOverrides({});
    setEditMode(true);
    setSelectedPoint(0);
  };

  const resetCustom = () => {
    setCustomPoints(null);
    setEditMode(false);
    setSelectedPoint(null);
  };

  const insertPoint = (point: SquirclePoint) => {
    if (!customPoints) return;
    if (customPoints.length < 2) {
      setCustomPoints((current) => [...(current ?? []), point]);
      setSelectedPoint(customPoints.length);
      return;
    }

    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let index = 0; index < customPoints.length; index++) {
      const nextIndex = (index + 1) % customPoints.length;
      const a = customPoints[index];
      const b = customPoints[nextIndex];
      const ab = { x: b.x - a.x, y: b.y - a.y };
      const ap = { x: point.x - a.x, y: point.y - a.y };
      const lengthSquared = ab.x * ab.x + ab.y * ab.y;
      const t = lengthSquared > 0 ? Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / lengthSquared)) : 0;
      const projected = { x: a.x + ab.x * t, y: a.y + ab.y * t };
      const distance = Math.hypot(point.x - projected.x, point.y - projected.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = nextIndex;
      }
    }

    const next = [...customPoints];
    next.splice(bestIndex, 0, point);
    setCustomPoints(next);
    setSelectedPoint(bestIndex);
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!editMode || !customPoints || draggingPoint !== null) return;
    const point = getSvgPoint(event);
    if (!point) return;
    const nearby = customPoints.findIndex((existing) => Math.hypot(existing.x - point.x, existing.y - point.y) < 14);
    if (nearby >= 0) {
      setSelectedPoint(nearby);
      return;
    }
    insertPoint(point);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (draggingPoint === null || !customPoints) return;
    const point = getSvgPoint(event);
    if (!point) return;
    setCustomPoints((current) => current?.map((existing, index) => (index === draggingPoint ? point : existing)) ?? null);
  };

  const deletePoint = (index: number) => {
    if (!customPoints || customPoints.length <= 3) return;
    setCustomPoints(customPoints.filter((_, pointIndex) => pointIndex !== index));
    setSelectedPoint(null);
    setCornerOverrides({});
  };

  const updateCorner = (index: number, key: "radius" | "smoothness", value: number) => {
    setCornerOverrides((current) => ({
      ...current,
      [index]: {
        ...current[index],
        [key]: value,
      },
    }));
  };

  const copyText = async (id: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1400);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={19} />
          </span>
          <div>
            <h1>Squircle Path Kit</h1>
            <p>Figma-like corner smoothing for SVG paths, arbitrary polygons, and React Native masks.</p>
          </div>
        </div>
        <div className="top-actions">
          <a className="button ghost" href="https://github.com/msurguy/squircle-path-kit">
            GitHub
          </a>
          <button className="button primary" onClick={() => copyText("install", "npm install @msurguy/squircle-path-kit")}>
            {copied === "install" ? <Check size={16} /> : <Copy size={16} />}
            npm install
          </button>
        </div>
      </header>

      <section className="workspace" aria-label="Interactive squircle path playground">
        <aside className="panel controls-panel" aria-label="Shape controls">
          <div className="panel-heading">
            <SlidersHorizontal size={18} />
            <h2>Shape controls</h2>
          </div>

          <div className="preset-groups">
            {groups.map((group) => (
              <section key={group} className="preset-group">
                <h3>{group}</h3>
                <div className="preset-grid">
                  {presets
                    .filter((preset) => preset.group === group)
                    .map((preset) => (
                      <button
                        key={preset.id}
                        className={`preset-button ${!isCustom && activePresetId === preset.id ? "active" : ""}`}
                        onClick={() => setPreset(preset)}
                      >
                        <span style={{ backgroundColor: preset.color }} />
                        {preset.name}
                      </button>
                    ))}
                </div>
              </section>
            ))}
          </div>

          <div className="control-stack">
            <Slider label="Corner radius" value={radius} min={0} max={120} step={1} unit="px" onChange={setRadius} />
            <Slider label="Smoothness" value={smoothness} min={0} max={1} step={0.01} onChange={setSmoothness} />
            <Slider label="Precision" value={precision} min={0} max={4} step={1} onChange={setPrecision} />
            <Slider label="Stroke" value={strokeWidth} min={0} max={8} step={0.5} unit="px" onChange={setStrokeWidth} />
            <Slider label="Fill opacity" value={fillOpacity} min={0} max={1} step={0.05} onChange={setFillOpacity} />
            <label className="color-row">
              <span>Shape color</span>
              <input type="color" value={fillColor} onChange={(event) => setFillColor(event.currentTarget.value)} />
            </label>
          </div>

          <div className="toggle-grid">
            <Toggle checked={showGrid} label="Grid" onChange={setShowGrid} />
            <Toggle checked={showComparison} label="Rounded comparison" onChange={setShowComparison} />
            <Toggle checked={showDebug} label="Control points" onChange={setShowDebug} />
            <Toggle checked={perCorner} label="Per-corner controls" onChange={setPerCorner} />
          </div>

          <div className="custom-actions">
            <button className={`button ${editMode ? "primary" : "ghost"}`} onClick={isCustom ? () => setEditMode(!editMode) : startCustomFromCurrent}>
              <MousePointer2 size={16} />
              {editMode ? "Finish editing" : isCustom ? "Edit custom" : "Edit current"}
            </button>
            <button className="button ghost" onClick={startBlankCustom}>
              <Crosshair size={16} />
              New custom
            </button>
            {isCustom ? (
              <button className="button subtle" onClick={resetCustom}>
                <RotateCcw size={16} />
                Reset preset
              </button>
            ) : null}
          </div>

          {perCorner ? (
            <div className="corner-list" aria-label="Per-corner radius and smoothing">
              {points.map((point, index) => (
                <div className={`corner-card ${selectedPoint === index ? "selected" : ""}`} key={index}>
                  <button className="corner-title" onClick={() => setSelectedPoint(index)}>
                    Corner {index}
                    <span>
                      {Math.round(point.x)}, {Math.round(point.y)}
                    </span>
                  </button>
                  <Slider
                    label="R"
                    value={point.radius ?? radius}
                    min={0}
                    max={120}
                    step={1}
                    unit="px"
                    onChange={(value) => updateCorner(index, "radius", value)}
                  />
                  <Slider
                    label="S"
                    value={point.smoothness ?? smoothness}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(value) => updateCorner(index, "smoothness", value)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </aside>

        <section className="stage-panel">
          <div className="stage-toolbar">
            <div className="stat">
              <strong>{points.length}</strong>
              points
            </div>
            <div className="stat">
              <strong>{radius}px</strong>
              radius
            </div>
            <div className="stat">
              <strong>{smoothness.toFixed(2)}</strong>
              smoothness
            </div>
            <button className="button subtle" onClick={() => copyText("path", debug.path)}>
              {copied === "path" ? <Check size={16} /> : <Copy size={16} />}
              Copy path
            </button>
          </div>

          {editMode && isCustom ? (
            <div className="edit-banner">Click an edge to add a point. Drag a handle to reshape. Delete selected points from the list.</div>
          ) : null}

          <svg
            ref={svgRef}
            className="shape-canvas"
            viewBox="0 0 600 440"
            role="img"
            aria-label="Live smoothed shape preview"
            onClick={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDraggingPoint(null)}
            onPointerLeave={() => setDraggingPoint(null)}
          >
            {showGrid ? (
              <g className="grid-lines" aria-hidden="true">
                {Array.from({ length: 13 }, (_, index) => (
                  <line key={`x-${index}`} x1={index * 50} x2={index * 50} y1="0" y2="440" />
                ))}
                {Array.from({ length: 10 }, (_, index) => (
                  <line key={`y-${index}`} x1="0" x2="600" y1={index * 50} y2={index * 50} />
                ))}
              </g>
            ) : null}

            {showComparison ? <path className="comparison-path" d={roundedPath} /> : null}
            <path d={debug.path} fill={fillColor} fillOpacity={fillOpacity} stroke={fillColor} strokeWidth={strokeWidth} strokeLinejoin="round" />

            {showDebug
              ? debug.corners.map((corner, index) => {
                  if (corner.type === "sharp") {
                    return <circle key={index} className="debug-vertex" cx={corner.point.x} cy={corner.point.y} r="4" />;
                  }
                  return (
                    <g key={index} className="debug-points">
                      <circle cx={points[index].x} cy={points[index].y} r="4" />
                      <circle cx={corner.startPoint.x} cy={corner.startPoint.y} r="3" />
                      <circle cx={corner.endPoint.x} cy={corner.endPoint.y} r="3" />
                      {"inBezier" in corner ? (
                        <>
                          <line x1={corner.startPoint.x} y1={corner.startPoint.y} x2={corner.inBezier.cp1.x} y2={corner.inBezier.cp1.y} />
                          <circle cx={corner.inBezier.cp1.x} cy={corner.inBezier.cp1.y} r="2.7" />
                          <circle cx={corner.inBezier.cp2.x} cy={corner.inBezier.cp2.y} r="2.7" />
                          <circle cx={corner.outBezier.cp1.x} cy={corner.outBezier.cp1.y} r="2.7" />
                          <circle cx={corner.outBezier.cp2.x} cy={corner.outBezier.cp2.y} r="2.7" />
                        </>
                      ) : null}
                    </g>
                  );
                })
              : null}

            {editMode && customPoints ? (
              <g className="edit-handles">
                <polygon points={customPoints.map((point) => `${point.x},${point.y}`).join(" ")} />
                {customPoints.map((point, index) => (
                  <g
                    key={index}
                    className={selectedPoint === index ? "selected" : ""}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setDraggingPoint(index);
                      setSelectedPoint(index);
                    }}
                  >
                    <circle className="hit" cx={point.x} cy={point.y} r="16" />
                    <circle className="handle" cx={point.x} cy={point.y} r="6" />
                    <text x={point.x + 10} y={point.y - 10}>
                      {index}
                    </text>
                  </g>
                ))}
              </g>
            ) : null}
          </svg>

          {isCustom ? (
            <div className="point-list" aria-label="Custom shape points">
              {points.map((point, index) => (
                <div key={index} className={`point-row ${selectedPoint === index ? "selected" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedPoint(index)}
                    aria-label={`Select point ${index}`}
                  >
                    <span>{index}</span>
                    {Math.round(point.x)}, {Math.round(point.y)}
                  </button>
                  {customPoints && customPoints.length > 3 ? (
                    <button type="button" className="delete-point" onClick={() => deletePoint(index)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="panel code-panel" aria-label="Generated code">
          <div className="panel-heading">
            <Braces size={18} />
            <h2>Generated code</h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Code targets">
            {codeTabs.map((tab) => (
              <button
                key={tab.id}
                className={codeTab === tab.id ? "active" : ""}
                role="tab"
                aria-selected={codeTab === tab.id}
                onClick={() => setCodeTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <pre className="code-block">
            <code>{snippets[codeTab]}</code>
          </pre>
          <button className="button primary wide" onClick={() => copyText("code", snippets[codeTab])}>
            {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
            Copy current snippet
          </button>
          <button className="button ghost wide" onClick={() => copyText("svg", snippets.svg)}>
            <Download size={16} />
            Copy SVG markup
          </button>
        </aside>
      </section>

      <section className="docs-grid" aria-label="Documentation summary">
        <article>
          <h2>Install</h2>
          <pre>
            <code>npm install @msurguy/squircle-path-kit</code>
          </pre>
          <p>No runtime dependencies. The package ships ESM, CJS, and TypeScript declarations.</p>
        </article>
        <article>
          <h2>API</h2>
          <p>
            Use <code>getSquirclePath(points, options)</code> for any closed polygon. Use{" "}
            <code>getSquircleRectPath(options)</code> when you want Figma-like rectangle properties.
          </p>
        </article>
        <article>
          <h2>React Native</h2>
          <p>
            The package exposes a <code>react-native</code> entry that points at the same pure ESM build. Pair it with{" "}
            <code>react-native-svg</code> for buttons, image masks, clip paths, and decorative paths.
          </p>
        </article>
        <article>
          <h2>Figma parity</h2>
          <p>
            The test suite checks exported control points against Figma SVG output for 60, 90, and 120 degree corners,
            per-corner radii, and short-edge clamping.
          </p>
        </article>
      </section>
    </main>
  );
}
