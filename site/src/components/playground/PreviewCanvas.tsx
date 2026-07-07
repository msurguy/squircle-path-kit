import { useCallback, useId, useRef, useState } from "react";
import type { SquirclePoint } from "../../../../src";
import { getSquircleDebugPath } from "../../../../src/core";

type DebugCorners = ReturnType<typeof getSquircleDebugPath>["corners"];

function GridDefs({ id, size }: { id: string; size: number }) {
  return (
    <defs>
      <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
        <path
          d={`M ${size} 0 H 0 V ${size}`}
          fill="none"
          stroke="var(--grid-major)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
  );
}

function HandleDots({ corners, points }: { corners: DebugCorners; points: SquirclePoint[] }) {
  return (
    <g>
      {corners.map((corner, index) => {
        if (corner.type === "sharp") {
          return <circle key={index} className="handle-dot" cx={corner.point.x} cy={corner.point.y} r="3.5" />;
        }
        return (
          <g key={index}>
            <circle className="vertex-dot" cx={points[index].x} cy={points[index].y} r="2.4" opacity="0.45" />
            <circle className="handle-dot" cx={corner.startPoint.x} cy={corner.startPoint.y} r="3.5" />
            <circle className="handle-dot" cx={corner.endPoint.x} cy={corner.endPoint.y} r="3.5" />
          </g>
        );
      })}
    </g>
  );
}

export function RectPreview({
  width,
  height,
  path,
  corners,
  points,
  showHandles,
}: {
  width: number;
  height: number;
  path: string;
  corners: DebugCorners;
  points: SquirclePoint[];
  showHandles: boolean;
}) {
  const gridId = useId();
  const viewBox = `-44 -36 ${width + 62} ${height + 54}`;
  const mid = (value: number) => Math.round(value / 2);

  const topTicks = [0, mid(width), width];
  const leftTicks = [0, mid(height), height];

  return (
    <div className="pg-preview">
      <svg viewBox={viewBox} role="img" aria-label="Live squircle rectangle preview">
        <GridDefs id={gridId} size={20} />
        <rect x="0" y="0" width={width} height={height} fill={`url(#${gridId})`} opacity="0.9" />

        {/* rulers */}
        <line className="ruler-line" x1="0" y1="-16" x2={width} y2="-16" />
        {topTicks.map((tick) => (
          <g key={`t-${tick}`}>
            <line className="ruler-line" x1={tick} y1="-20" x2={tick} y2="-12" />
            <text className="ruler-text" x={tick} y="-24" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        <line className="ruler-line" x1="-18" y1="0" x2="-18" y2={height} />
        {leftTicks.map((tick) => (
          <g key={`l-${tick}`}>
            <line className="ruler-line" x1="-22" y1={tick} x2="-14" y2={tick} />
            <text className="ruler-text" x="-26" y={tick + 4} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        <path
          d={path}
          fill="var(--accent-purple-soft)"
          stroke="var(--accent-purple)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {showHandles ? <HandleDots corners={corners} points={points} /> : null}
      </svg>
    </div>
  );
}

const POLY_W = 600;
const POLY_H = 440;

export function PolyPreview({
  points,
  path,
  corners,
  showHandles,
  editMode,
  onPointsChange,
}: {
  points: SquirclePoint[];
  path: string;
  corners: DebugCorners;
  showHandles: boolean;
  editMode: boolean;
  onPointsChange: (points: SquirclePoint[]) => void;
}) {
  const gridId = useId();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const movedRef = useRef(false);

  const getSvgPoint = useCallback((event: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round(((event.clientX - rect.left) / rect.width) * POLY_W),
      y: Math.round(((event.clientY - rect.top) / rect.height) * POLY_H),
    };
  }, []);

  const insertPoint = (point: SquirclePoint) => {
    // Insert on the nearest edge (orthogonal projection) so the outline
    // doesn't self-intersect when clicking between two existing points.
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let index = 0; index < points.length; index++) {
      const nextIndex = (index + 1) % points.length;
      const a = points[index];
      const b = points[nextIndex];
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
    const next = [...points];
    next.splice(bestIndex, 0, point);
    onPointsChange(next);
    setSelected(bestIndex);
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!editMode || dragging !== null || movedRef.current) {
      movedRef.current = false;
      return;
    }
    const point = getSvgPoint(event);
    if (!point) return;
    const nearby = points.findIndex((existing) => Math.hypot(existing.x - point.x, existing.y - point.y) < 16);
    if (nearby >= 0) {
      setSelected(nearby);
      return;
    }
    insertPoint(point);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return;
    const point = getSvgPoint(event);
    if (!point) return;
    movedRef.current = true;
    onPointsChange(points.map((existing, index) => (index === dragging ? { ...existing, ...point } : existing)));
  };

  const deletePoint = (index: number) => {
    if (points.length <= 3) return;
    onPointsChange(points.filter((_, pointIndex) => pointIndex !== index));
    setSelected(null);
  };

  return (
    <div className="pg-preview">
      <svg
        ref={svgRef}
        className={editMode ? "editing" : ""}
        viewBox={`0 0 ${POLY_W} ${POLY_H}`}
        role="img"
        aria-label="Live squircle polygon preview"
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
      >
        <GridDefs id={gridId} size={50} />
        <rect x="0" y="0" width={POLY_W} height={POLY_H} fill={`url(#${gridId})`} opacity="0.9" />

        <path
          d={path}
          fill="var(--accent-blue-soft)"
          stroke="var(--accent-blue)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {showHandles && !editMode ? <HandleDots corners={corners} points={points} /> : null}

        {editMode ? (
          <g>
            <polygon className="edit-outline" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
            {points.map((point, index) => (
              <g
                key={index}
                className={selected === index ? "selected" : ""}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  movedRef.current = false;
                  setDragging(index);
                  setSelected(index);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  deletePoint(index);
                }}
              >
                <circle className="edit-hit" cx={point.x} cy={point.y} r="18" />
                <circle className="edit-handle" cx={point.x} cy={point.y} r="6.5" />
                <text className="edit-label" x={point.x + 11} y={point.y - 11}>
                  {index}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
