import { getSquircleRectPath } from "../../../../src";
import { SliderInput } from "../ui/SliderInput";
import type { RectCorners, RectState } from "./state";

const cornerLabels: Array<{ key: keyof RectCorners; label: string }> = [
  { key: "tl", label: "top left" },
  { key: "tr", label: "top right" },
  { key: "br", label: "bottom right" },
  { key: "bl", label: "bottom left" },
];

function CornerDiagram({ rect }: { rect: RectState }) {
  const { corners, cornerRadius, cornerSmoothing } = rect;
  const d = getSquircleRectPath({
    x: 6,
    y: 6,
    width: 96,
    height: 60,
    topLeftRadius: Math.min(30, (corners.tl ?? cornerRadius) / 3),
    topRightRadius: Math.min(30, (corners.tr ?? cornerRadius) / 3),
    bottomRightRadius: Math.min(30, (corners.br ?? cornerRadius) / 3),
    bottomLeftRadius: Math.min(30, (corners.bl ?? cornerRadius) / 3),
    cornerSmoothing,
  });
  const dots = [
    [6, 6],
    [102, 6],
    [102, 66],
    [6, 66],
  ];
  return (
    <svg width="108" height="72" viewBox="0 0 108 72" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--ink-blue)" strokeWidth="1.6" />
      {dots.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="3" fill="var(--paper-raised)" stroke="var(--ink)" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

export function RectangleControls({
  rect,
  update,
}: {
  rect: RectState;
  update: (patch: Partial<RectState>) => void;
}) {
  const setCorner = (key: keyof RectCorners, value: number | null) =>
    update({ corners: { ...rect.corners, [key]: value } });

  const dim = (label: string, key: "width" | "height") => (
    <div className="field-row" key={key}>
      <label htmlFor={`pg-${key}`}>{label}</label>
      <input
        id={`pg-${key}`}
        className="num-input"
        type="number"
        min={20}
        max={2000}
        value={rect[key]}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (!Number.isNaN(next)) update({ [key]: Math.max(20, Math.min(2000, next)) });
        }}
      />
      <span className="field-unit">px</span>
    </div>
  );

  return (
    <div>
      {dim("width", "width")}
      {dim("height", "height")}

      <SliderInput
        label="corner radius"
        value={rect.cornerRadius}
        min={0}
        max={Math.floor(Math.min(rect.width, rect.height) / 2)}
        step={1}
        unit="px"
        onChange={(value) => update({ cornerRadius: value })}
      />
      <SliderInput
        label="corner smoothing (ξ)"
        value={rect.cornerSmoothing}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => update({ cornerSmoothing: value })}
      />

      <details className="pg-collapse">
        <summary>per-corner radii</summary>
        <div className="corner-editor">
          <div className="corner-fields">
            {cornerLabels.map(({ key, label }) => (
              <div className="field-row" key={key}>
                <label htmlFor={`pg-corner-${key}`}>{label}</label>
                <input
                  id={`pg-corner-${key}`}
                  className="num-input"
                  type="number"
                  min={0}
                  placeholder={String(rect.cornerRadius)}
                  value={rect.corners[key] ?? ""}
                  onChange={(event) => {
                    const raw = event.currentTarget.value;
                    if (raw === "") {
                      setCorner(key, null);
                      return;
                    }
                    const next = Number(raw);
                    if (!Number.isNaN(next)) setCorner(key, Math.max(0, next));
                  }}
                />
                <span className="field-unit">px</span>
              </div>
            ))}
          </div>
          <div className="corner-diagram">
            <CornerDiagram rect={rect} />
          </div>
        </div>
      </details>

      <SliderInput
        label="precision"
        value={rect.precision}
        min={0}
        max={4}
        step={1}
        unit="dec"
        onChange={(value) => update({ precision: value })}
      />

      <label className="check-row">
        <input
          type="checkbox"
          checked={rect.showHandles}
          onChange={(event) => update({ showHandles: event.currentTarget.checked })}
        />
        show handles
      </label>
    </div>
  );
}
