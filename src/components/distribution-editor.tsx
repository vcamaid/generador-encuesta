type DistributionEditorProps<T extends string> = {
  title: string;
  distribution: Record<T, number>;
  labels: Readonly<Record<string, string>>;
  onChange: (value: T, amount: number) => void;
};

export function DistributionEditor<T extends string>({
  title,
  distribution,
  labels,
  onChange,
}: DistributionEditorProps<T>) {
  const total = Object.values(distribution).reduce<number>(
    (sum, amount) => sum + Number(amount),
    0,
  );
  const balanced = Math.abs(total - 100) < 0.001;
  return (
    <fieldset className="distribution">
      <legend>{title}</legend>
      {Object.entries(distribution).map(([value, amount]) => (
        <label className="distribution-row" key={value}>
          <span>{labels[value] ?? value}</span>
          <span className="percent-input">
            <input
              aria-label={`${title}: ${labels[value] ?? value}`}
              type="number"
              min="0"
              max="100"
              step="1"
              value={amount as number}
              onChange={(event) => onChange(value as T, Number(event.target.value))}
            />
            <span>%</span>
          </span>
        </label>
      ))}
      <p className={balanced ? "sum valid" : "sum invalid"}>
        Total: {total}% {balanced ? "✓" : "· debe sumar 100%"}
      </p>
    </fieldset>
  );
}
