import { useState } from 'react';
import { SPEND_CATEGORIES } from '../../shared/types';
import type { MonthlyTrendBar } from '../../shared/types';
import { categoryColors, money } from '../primitives';

type Props = {
  data: MonthlyTrendBar[];
  height?: number;
};

const monthShort = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' });
};

const monthLong = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const MonthlyTrendChart = ({ data, height = 200 }: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.total), 1);

  const presentCats = SPEND_CATEGORIES.filter((c) =>
    data.some((d) => (d.by_category[c] ?? 0) > 0),
  );

  const tooltipFor = (i: number): { label: string; value: number; color: string }[] =>
    SPEND_CATEGORIES
      .filter((c) => (data[i].by_category[c] ?? 0) > 0)
      .map((c) => ({ label: c, value: data[i].by_category[c], color: categoryColors[c] ?? 'var(--text-mute)' }))
      .sort((a, b) => b.value - a.value);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {hover !== null && data[hover].total > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${((hover + 0.5) / data.length) * 100}%`,
              bottom: height + 8,
              transform: 'translateX(-50%)',
              background: 'var(--bg-1)',
              border: '1px solid var(--line-soft)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 12,
              minWidth: 180,
              boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
              <span style={{ fontWeight: 500 }}>{monthLong(data[hover].month)}</span>
              <span className="num" style={{ fontWeight: 600 }}>{money(data[hover].total, { dp: 0 })}</span>
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              {tooltipFor(hover).map((s) => (
                <div key={s.label} className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                  <span className="row" style={{ gap: 6, minWidth: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, flex: '0 0 7px' }} />
                    <span className="ellipsis dim" style={{ fontSize: 11.5 }}>{s.label}</span>
                  </span>
                  <span className="num" style={{ fontSize: 11.5 }}>{money(s.value, { dp: 0 })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height,
            paddingBottom: 1,
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          {data.map((bar, i) => {
            const dim = hover !== null && hover !== i;
            const stack = SPEND_CATEGORIES
              .map((c) => ({ cat: c, v: bar.by_category[c] ?? 0 }))
              .filter((s) => s.v > 0);
            return (
              <div
                key={bar.month}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  cursor: 'default',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '70%',
                    maxWidth: 56,
                    height: `${(bar.total / max) * 100}%`,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    overflow: 'hidden',
                    borderRadius: '4px 4px 0 0',
                    transition: 'opacity 120ms',
                    opacity: dim ? 0.4 : 1,
                  }}
                >
                  {stack.map(({ cat, v }) => (
                    <div
                      key={cat}
                      style={{
                        height: `${(v / bar.total) * 100}%`,
                        background: categoryColors[cat] ?? 'var(--text-mute)',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {data.map((bar) => (
            <div
              key={bar.month}
              style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              {monthShort(bar.month)}
            </div>
          ))}
        </div>
      </div>

      {presentCats.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 18 }}>
          {presentCats.map((c) => (
            <span key={c} className="row" style={{ gap: 6, fontSize: 11.5, color: 'var(--text-dim)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: categoryColors[c] ?? 'var(--text-mute)', flex: '0 0 8px' }} />
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
