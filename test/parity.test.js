// Figma-parity tests: verify generated paths against ground-truth control
// points extracted from Figma's own SVG exports (Squircle Test Case
// Generator plugin, 2026-07-03 dataset).
import { test } from "node:test";
import assert from "node:assert";
import { getSquirclePath, getSquircleRectPath } from "../dist/index.js";

// Parse an SVG path into a flat list of absolute coordinates
function parsePath(d) {
  const tokens = d.match(/[MLHVCZ]|-?[\d.]+(?:e-?\d+)?/gi);
  const coords = [];
  let i = 0, x = 0, y = 0;
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === "M" || t === "L") { x = +tokens[i++]; y = +tokens[i++]; coords.push([x, y]); }
    else if (t === "H") { x = +tokens[i++]; coords.push([x, y]); }
    else if (t === "V") { y = +tokens[i++]; coords.push([x, y]); }
    else if (t === "C") {
      for (let k = 0; k < 3; k++) { const a = +tokens[i++], b = +tokens[i++]; coords.push([a, b]); }
      x = coords[coords.length - 1][0]; y = coords[coords.length - 1][1];
    }
  }
  return coords;
}

function maxErrorAgainst(path, truthPoints, tolerance = 0.02) {
  const gen = parsePath(path);
  let maxErr = 0;
  for (const [name, pt] of Object.entries(truthPoints)) {
    let best = Infinity;
    for (const g of gen) best = Math.min(best, Math.hypot(g[0] - pt[0], g[1] - pt[1]));
    assert.ok(best < tolerance, `${name}: nearest generated point ${best.toFixed(4)}px away (> ${tolerance})`);
    maxErr = Math.max(maxErr, best);
  }
  return maxErr;
}

test("per-corner rectangle matches Figma (90° corners, radii 10/40/80/0, ξ=0.6)", () => {
  const path = getSquircleRectPath({
    width: 240, height: 240,
    topLeftRadius: 10, topRightRadius: 40, bottomRightRadius: 80, bottomLeftRadius: 0,
    cornerSmoothing: 0.6,
  });
  // Ground truth: rect-percorner-a
  maxErrorAgainst(path, {
    "TL P0": [0, 16], "TL cp1": [0, 10.3995], "TL cp2": [0, 7.59921], "TL P3": [1.08993, 5.46009],
    "BR P0": [240, 112], "BR cp1": [240, 156.804], "BR cp2": [240, 179.206], "BR P3": [231.281, 196.319],
    "BR arc cp1": [223.611, 211.372], "BR arc cp2": [211.372, 223.611], "BR arcEnd": [196.319, 231.281],
    "BR out cp1": [179.206, 240], "BR out cp2": [156.804, 240], "BR end": [112, 240],
  });
});

test("hexagon matches Figma (120° corners, R=40, ξ=0.6)", () => {
  const cx = 103.923, cy = 113.812, R = 120;
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const th = ((-90 + k * 60) * Math.PI) / 180;
    pts.push({ x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) });
  }
  const path = getSquirclePath(pts, { defaultRadius: 40, defaultSmoothness: 0.6 });
  // Ground truth: poly6-r40-s0.6, top corner
  maxErrorAgainst(path, {
    P0: [71.9231, 12.2872], cp1: [83.5808, 5.55663], cp2: [89.4097, 2.19133],
    P3: [95.6066, 0.874129], "arc cp1": [101.09, -0.291332], "arc cp2": [106.756, -0.291332],
    arcEnd: [112.24, 0.874129], "out cp1": [118.436, 2.19133], "out cp2": [124.265, 5.55663],
    end: [135.923, 12.2872],
  });
});

test("triangle budget clamping matches Figma (60° corners, ξ=0.6 and ξ=1 clamp identically)", () => {
  const V = [
    { x: 74.641, y: -40 },
    { x: 178.564, y: 140 },
    { x: -29.282, y: 140 },
  ];
  const truth = {
    P0: [22.6795, 50], cp1: [37.7991, 23.812], cp2: [45.359, 10.718], P3: [54.641, 5.35897],
    "arc cp1": [67.017, -1.78632], "arc cp2": [82.2649, -1.78632], arcEnd: [94.641, 5.35897],
    end: [126.603, 50],
  };
  // Ground truth: poly3-r40-s0.6 and poly3-r40-s1 are identical (both clamped)
  const p06 = getSquirclePath(V, { defaultRadius: 40, defaultSmoothness: 0.6 });
  const p10 = getSquirclePath(V, { defaultRadius: 40, defaultSmoothness: 1.0 });
  maxErrorAgainst(p06, truth);
  maxErrorAgainst(p10, truth);
});

test("ξ=0 produces a plain rounded rectangle", () => {
  const path = getSquircleRectPath({ width: 200, height: 200, cornerRadius: 30, cornerSmoothing: 0 });
  // Tangent points at exactly r from each corner
  maxErrorAgainst(path, {
    "top-left tangent A": [0, 30],
    "top-left tangent B": [30, 0],
    "bottom-right tangent A": [200, 170],
    "bottom-right tangent B": [170, 200],
  });
});

test("radius 0 produces sharp corners", () => {
  const path = getSquircleRectPath({ width: 100, height: 100, cornerRadius: 0, cornerSmoothing: 0.6 });
  maxErrorAgainst(path, {
    c0: [0, 0], c1: [100, 0], c2: [100, 100], c3: [0, 100],
  });
});

test("radius clamps to half the short side (Figma rx behavior)", () => {
  // Figma: 300x100 rect with r=60 renders as rx=50
  const path = getSquircleRectPath({ width: 300, height: 100, cornerRadius: 60, cornerSmoothing: 0 });
  maxErrorAgainst(path, {
    "left tangent": [0, 50],
    "top tangent": [50, 0],
  });
});

test("fewer than 3 points returns empty string", () => {
  assert.strictEqual(getSquirclePath([{ x: 0, y: 0 }, { x: 10, y: 10 }]), "");
});
