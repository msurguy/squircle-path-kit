import { presets } from "../../presets";
import { SliderInput } from "../ui/SliderInput";
import type { PolyState } from "./state";

export function PolygonControls({
  poly,
  update,
}: {
  poly: PolyState;
  update: (patch: Partial<PolyState>) => void;
}) {
  const selectPreset = (id: string) => {
    const preset = presets.find((entry) => entry.id === id);
    if (!preset) return;
    update({
      presetId: id,
      points: null,
      radius: preset.radius,
      smoothness: preset.smoothness,
      editMode: false,
    });
  };

  return (
    <div>
      <div className="preset-row" role="listbox" aria-label="Shape presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-chip ${poly.presetId === preset.id && poly.points === null ? "active" : ""}`}
            onClick={() => selectPreset(preset.id)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <SliderInput
        label="corner radius"
        value={poly.radius}
        min={0}
        max={120}
        step={1}
        unit="px"
        onChange={(value) => update({ radius: value })}
      />
      <SliderInput
        label="corner smoothing (ξ)"
        value={poly.smoothness}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => update({ smoothness: value })}
      />
      <SliderInput
        label="precision"
        value={poly.precision}
        min={0}
        max={4}
        step={1}
        unit="dec"
        onChange={(value) => update({ precision: value })}
      />

      <label className="check-row">
        <input
          type="checkbox"
          checked={poly.showHandles}
          onChange={(event) => update({ showHandles: event.currentTarget.checked })}
        />
        show handles
      </label>

      <label className="check-row">
        <input
          type="checkbox"
          checked={poly.editMode}
          onChange={(event) => update({ editMode: event.currentTarget.checked })}
        />
        edit points
      </label>

      {poly.editMode ? (
        <p className="pg-hint">
          Click an edge to add a point, drag a handle to move it, double-click a handle to delete
          it.
        </p>
      ) : null}
    </div>
  );
}
