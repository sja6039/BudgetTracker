import { useMemo } from 'react';
import { money } from '../primitives';
import type { Transaction } from '../../shared/types';

type Props = {
  txs: Transaction[];
  limit?: number;
  selected?: string | null;
  onSelect?: (merchant: string | null) => void;
};

type Row = { merchant: string; total: number; count: number };

export const TopMerchants = ({ txs, limit = 10, selected = null, onSelect }: Props) => {
  const rows = useMemo<Row[]>(() => {
    const agg = new Map<string, Row>();
    for (const t of txs) {
      if (t.amount >= 0 || t.category === 'Transfer') continue;
      const key = t.merchant.trim() || '—';
      const cur = agg.get(key) ?? { merchant: key, total: 0, count: 0 };
      cur.total += -t.amount;
      cur.count += 1;
      agg.set(key, cur);
    }
    return Array.from(agg.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [txs, limit]);

  if (rows.length === 0) {
    return <div className="empty" style={{ padding: '24px 0' }}>No merchant spending in this period.</div>;
  }

  const max = rows[0].total;
  const clickable = Boolean(onSelect);

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {rows.map((r) => {
        const pct = (r.total / max) * 100;
        const isActive = selected === r.merchant;
        return (
          <button
            key={r.merchant}
            type="button"
            onClick={clickable ? () => onSelect?.(isActive ? null : r.merchant) : undefined}
            disabled={!clickable}
            title={clickable ? (isActive ? 'Clear filter' : `Filter to ${r.merchant}`) : undefined}
            style={{
              all: 'unset',
              display: 'block',
              padding: '10px 12px',
              borderRadius: 8,
              cursor: clickable ? 'pointer' : 'default',
              border: `1px solid ${isActive ? 'var(--accent-line)' : 'transparent'}`,
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              transition: 'background 120ms, border-color 120ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive && clickable) e.currentTarget.style.background = 'var(--bg-2)';
            }}
            onMouseLeave={(e) => {
              if (!isActive && clickable) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, gap: 12, minWidth: 0 }}>
              <span className="row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                <span className="ellipsis" style={{ fontSize: 13, fontWeight: 500 }}>{r.merchant}</span>
                <span className="muted" style={{ fontSize: 11, flex: '0 0 auto' }}>
                  {r.count} {r.count === 1 ? 'charge' : 'charges'}
                </span>
              </span>
              <span className="num" style={{ fontSize: 13, fontWeight: 500, flex: '0 0 auto' }}>
                {money(r.total, { dp: 0 })}
              </span>
            </div>
            <div className="bar"><span style={{ width: `${pct}%`, background: 'var(--accent)' }} /></div>
          </button>
        );
      })}
    </div>
  );
};
