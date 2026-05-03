export const formatMonthLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const MonthPicker = ({
  months,
  value,
  onChange,
  disabled,
}: {
  months: string[];
  value: string;
  onChange: (ym: string) => void;
  disabled?: boolean;
}) => {
  if (months.length === 0) return null;
  const options = months.includes(value) ? months : [value, ...months];
  return (
    <select
      className="btn"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{ minWidth: 150, paddingRight: 26 }}
    >
      {options.map((ym) => (
        <option key={ym} value={ym}>{formatMonthLabel(ym)}</option>
      ))}
    </select>
  );
};
