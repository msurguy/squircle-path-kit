import type { SquirclePoint } from "../../../../src";

export type PlaygroundTab = "rect" | "poly";

export interface RectCorners {
  tl: number | null;
  tr: number | null;
  br: number | null;
  bl: number | null;
}

export interface RectState {
  width: number;
  height: number;
  cornerRadius: number;
  cornerSmoothing: number;
  corners: RectCorners; // null = inherit cornerRadius
  precision: number;
  showHandles: boolean;
}

export interface PolyState {
  presetId: string;
  points: SquirclePoint[] | null; // null = untouched preset points
  radius: number;
  smoothness: number;
  precision: number;
  showHandles: boolean;
  editMode: boolean;
}

export const defaultRectState: RectState = {
  width: 320,
  height: 180,
  cornerRadius: 48,
  cornerSmoothing: 0.68,
  corners: { tl: null, tr: null, br: null, bl: null },
  precision: 2,
  showHandles: true,
};

export const defaultPolyState: PolyState = {
  presetId: "hexagon",
  points: null,
  radius: 32,
  smoothness: 0.62,
  precision: 2,
  showHandles: true,
  editMode: false,
};

export function rectToPoints(rect: RectState): SquirclePoint[] {
  const { width, height, cornerRadius, corners } = rect;
  return [
    { x: 0, y: 0, radius: corners.tl ?? cornerRadius },
    { x: width, y: 0, radius: corners.tr ?? cornerRadius },
    { x: width, y: height, radius: corners.br ?? cornerRadius },
    { x: 0, y: height, radius: corners.bl ?? cornerRadius },
  ];
}
