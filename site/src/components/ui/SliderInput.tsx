/**
 * The mockup's control pattern: label — slider — linked numeric input — unit.
 */
export function SliderInput({
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
  const clamp = (raw: number) => Math.min(max, Math.max(min, raw));

  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <input
        className="num-input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={`${label} value`}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (!Number.isNaN(next)) onChange(clamp(next));
        }}
      />
      {unit ? <span className="field-unit">{unit}</span> : null}
    </div>
  );
}
