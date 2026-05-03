import { useState } from 'react';
import { money } from '../primitives';

type Props = {
  data: number[];
  monthYm: string;
  height?: number;
  accent?: string;
  colors?: string[];
  selectedDay?: number | null;
  onSelectDay?: (dayIdx: number | null) => void;
};

export const DailyBarChart = ({
  data,
  monthYm,
  height = 180,
  accent = 'var(--accent)',
  colors,
  selectedDay = null,
  onSelectDay,
}: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const clickable = Boolean(onSelectDay);
  const w = 100;
  const h = 100;
  const padX = 1;
  const padY = 14;
  const max = Math.max(...data, 1);
  const slotW = (w - padX * 2) / data.length;
  const bw = slotW * 0.6;

  const [yy, mm] = monthYm.split('-').map(Number);
  const dateLabel = (idx: number): string => {
    const d = new Date(yy, mm - 1, idx + 1);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {hover !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${((hover + 0.5) / data.length) * 100}%`,
            bottom: height + 6,
            transform: 'translateX(-50%)',
            background: 'var(--bg-1)',
            border: '1px solid var(--line-soft)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: 500 }}>{dateLabel(hover)}</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
            {data[hover] > 0 ? money(data[hover], { dp: 2 }) : 'No spend'}
          </div>
        </div>
      )}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
        onMouseLeave={() => setHover(null)}
      >
        {data.map((v, i) => {
          const cx = padX + (i + 0.5) * slotW;
          const barY = h - padY - (v / max) * (h - padY * 2);
          const isHover = hover === i;
          const isSelected = selectedDay === i;
          const opacity =
            selectedDay !== null && selectedDay !== undefined
              ? isSelected ? 0.95 : 0.3
              : hover === null || isHover ? 0.9 : 0.4;
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onClick={clickable ? () => onSelectDay?.(isSelected ? null : i) : undefined}
              style={clickable ? { cursor: 'pointer' } : undefined}
            >
              <rect x={cx - slotW / 2} y={0} width={slotW} height={h} fill="transparent" />
              <rect
                x={cx - bw / 2}
                y={barY}
                width={bw}
                height={h - padY - barY}
                rx="0.6"
                fill={colors?.[i] ?? accent}
                opacity={opacity}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
