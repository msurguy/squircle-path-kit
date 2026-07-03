import type { SquirclePoint } from "../../src";

export interface Preset {
  id: string;
  group: "Basic" | "Polygons" | "Stars" | "UI shapes";
  name: string;
  radius: number;
  smoothness: number;
  color: string;
  points: SquirclePoint[];
}

const ngon = (n: number, r = 155, cx = 300, cy = 220, startAngle = -Math.PI / 2): SquirclePoint[] =>
  Array.from({ length: n }, (_, i) => {
    const a = startAngle + (2 * Math.PI * i) / n;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

const star = (n: number, outerR: number, innerR: number, cx = 300, cy = 220): SquirclePoint[] =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    const r = i % 2 === 0 ? outerR : innerR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

const badge = (): SquirclePoint[] =>
  Array.from({ length: 12 }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / 12;
    const r = i % 2 === 0 ? 162 : 134;
    return { x: 300 + r * Math.cos(a), y: 220 + r * Math.sin(a) };
  });

export const presets: Preset[] = [
  {
    id: "rectangle",
    group: "Basic",
    name: "Rectangle",
    radius: 44,
    smoothness: 0.62,
    color: "#2563eb",
    points: [
      { x: 100, y: 92 },
      { x: 500, y: 92 },
      { x: 500, y: 348 },
      { x: 100, y: 348 },
    ],
  },
  {
    id: "per-corner",
    group: "Basic",
    name: "Per-corner",
    radius: 28,
    smoothness: 0.58,
    color: "#0f766e",
    points: [
      { x: 108, y: 86, radius: 8, smoothness: 0.25 },
      { x: 502, y: 86, radius: 58, smoothness: 0.85 },
      { x: 502, y: 350, radius: 96, smoothness: 0.62 },
      { x: 108, y: 350, radius: 0, smoothness: 0 },
    ],
  },
  {
    id: "triangle",
    group: "Basic",
    name: "Triangle",
    radius: 34,
    smoothness: 0.64,
    color: "#db2777",
    points: [
      { x: 300, y: 48 },
      { x: 520, y: 356 },
      { x: 80, y: 356 },
    ],
  },
  {
    id: "tab",
    group: "UI shapes",
    name: "Tab",
    radius: 30,
    smoothness: 0.72,
    color: "#9333ea",
    points: [
      { x: 74, y: 160 },
      { x: 176, y: 160 },
      { x: 202, y: 78 },
      { x: 398, y: 78 },
      { x: 424, y: 160 },
      { x: 526, y: 160 },
      { x: 526, y: 354 },
      { x: 74, y: 354 },
    ],
  },
  {
    id: "hexagon",
    group: "Polygons",
    name: "Hexagon",
    radius: 32,
    smoothness: 0.62,
    color: "#ea580c",
    points: ngon(6, 156, 300, 220, 0),
  },
  {
    id: "octagon",
    group: "Polygons",
    name: "Octagon",
    radius: 24,
    smoothness: 0.7,
    color: "#0891b2",
    points: ngon(8, 160, 300, 220, Math.PI / 8),
  },
  {
    id: "star",
    group: "Stars",
    name: "Star",
    radius: 13,
    smoothness: 0.66,
    color: "#ca8a04",
    points: star(5, 166, 74),
  },
  {
    id: "badge",
    group: "Stars",
    name: "Badge",
    radius: 18,
    smoothness: 0.82,
    color: "#16a34a",
    points: badge(),
  },
  {
    id: "arrow",
    group: "UI shapes",
    name: "Arrow",
    radius: 18,
    smoothness: 0.6,
    color: "#dc2626",
    points: [
      { x: 82, y: 164 },
      { x: 374, y: 164 },
      { x: 374, y: 86 },
      { x: 526, y: 220 },
      { x: 374, y: 354 },
      { x: 374, y: 276 },
      { x: 82, y: 276 },
    ],
  },
  {
    id: "notch",
    group: "UI shapes",
    name: "Notch",
    radius: 22,
    smoothness: 0.64,
    color: "#4f46e5",
    points: [
      { x: 80, y: 74 },
      { x: 520, y: 74 },
      { x: 520, y: 356 },
      { x: 80, y: 356 },
      { x: 80, y: 262 },
      { x: 202, y: 262 },
      { x: 202, y: 158 },
      { x: 80, y: 158 },
    ],
  },
  {
    id: "cross",
    group: "UI shapes",
    name: "Cross",
    radius: 20,
    smoothness: 0.62,
    color: "#0d9488",
    points: [
      { x: 228, y: 44 },
      { x: 372, y: 44 },
      { x: 372, y: 142 },
      { x: 492, y: 142 },
      { x: 492, y: 274 },
      { x: 372, y: 274 },
      { x: 372, y: 376 },
      { x: 228, y: 376 },
      { x: 228, y: 274 },
      { x: 108, y: 274 },
      { x: 108, y: 142 },
      { x: 228, y: 142 },
    ],
  },
];
