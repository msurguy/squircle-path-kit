import { test } from "node:test";
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { getSquirclePath } from "../dist/index.js";

test("react-native package entry points at the ESM build", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.strictEqual(pkg["react-native"], "./dist/index.js");
  assert.ok(existsSync(new URL("../dist/index.js", import.meta.url)));
});

test("point radius falls back to default radius when omitted", () => {
  const inherited = getSquirclePath(
    [
      { x: 0, y: 0, radius: 0 },
      { x: 120, y: 0 },
      { x: 120, y: 120, radius: 0 },
      { x: 0, y: 120, radius: 0 },
    ],
    { defaultRadius: 24, defaultSmoothness: 0.6 }
  );
  const explicit = getSquirclePath(
    [
      { x: 0, y: 0, radius: 0 },
      { x: 120, y: 0, radius: 24 },
      { x: 120, y: 120, radius: 0 },
      { x: 0, y: 120, radius: 0 },
    ],
    { defaultRadius: 24, defaultSmoothness: 0.6 }
  );

  assert.strictEqual(inherited, explicit);
});

test("concave polygons generate a closed finite path", () => {
  const path = getSquirclePath(
    [
      { x: 0, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 80 },
      { x: 88, y: 80 },
      { x: 88, y: 160 },
      { x: 0, y: 160 },
    ],
    { defaultRadius: 18, defaultSmoothness: 0.65 }
  );

  assert.match(path, /^M /);
  assert.match(path, / Z$/);
  assert.doesNotMatch(path, /NaN|Infinity/);
});

test("precision option controls decimal output", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 123, y: 0 },
    { x: 92, y: 88 },
    { x: 0, y: 101 },
  ];
  const low = getSquirclePath(points, { defaultRadius: 17, defaultSmoothness: 0.55, precision: 0 });
  const high = getSquirclePath(points, { defaultRadius: 17, defaultSmoothness: 0.55, precision: 3 });

  assert.doesNotMatch(low, /\.\d/);
  assert.match(high, /\.\d{2,3}/);
});
