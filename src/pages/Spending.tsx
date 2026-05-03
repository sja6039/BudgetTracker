import { useEffect, useMemo, useState } from 'react';
import type { AppContextValue } from '../App';
import { api } from '../api';
import { Ico, money, formatPct, categoryColors } from '../primitives';
import { Shell } from '../Shell';
import { UploadStatementButton } from '../components/UploadStatementButton';
import { MonthPicker, formatMonthLabel } from '../components/MonthPicker';
import { DailyBarChart } from '../components/DailyBarChart';
import { TopMerchants } from '../components/TopMerchants';
import type { Transaction } from '../../shared/types';
import { SPEND_CATEGORIES } from '../../shared/types';

const pad2 = (n: number): string => String(n).padStart(2, '0');

const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const monthBoundsFor = (ym: string): { from: string; to: string; days: number } => {
  const [y, m] = ym.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  return { from: `${y}-${pad2(m)}-01`, to: `${y}-${pad2(m)}-${pad2(days)}`, days };
};

const isSpend = (t: Transaction): boolean => t.amount < 0 && t.category !== 'Transfer';
const isIncome = (t: Transaction): boolean => t.amount > 0 && t.category !== 'Transfer';

const dailyColor = (v: number, avg: number): string => {
  if (v === 0) return 'var(--bg-3)';
  if (avg === 0 || v <= avg) return 'var(--accent)';
  if (v <= 2 * avg) return 'var(--warn)';
  return 'var(--neg)';
};

const dailyColors = (buckets: number[]): string[] => {
  const nonZero = buckets.filter((v) => v > 0);
  const avg = nonZero.length > 0 ? nonZero.reduce((s, v) => s + v, 0) / nonZero.length : 0;
  return buckets.map((v) => dailyColor(v, avg));
};

const dayChipLabel = (ym: string, dayIdx: number): string => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, dayIdx + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const DotLabel = ({ color, label }: { color: string; label: string }) => (
  <span className="row" style={{ gap: 6 }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flex: '0 0 8px' }} />
    {label}
  </span>
);

const FilterChip = ({ label, onClear }: { label: string; onClear: () => void }) => (
  <button
    type="button"
    onClick={onClear}
    className="chip"
    title="Clear filter"
    style={{
      cursor: 'pointer',
      background: 'var(--accent-soft)',
      borderColor: 'var(--accent-line)',
      color: 'var(--accent)',
      display: 'inline-flex',
      gap: 6,
      alignItems: 'center',
    }}
  >
    {label}
    <Ico name="close" size={11} />
  </button>
);

const dailyBuckets = (txs: Transaction[], days: number): number[] => {
  const buckets = Array(days).fill(0) as number[];
  for (const t of txs) {
    if (!isSpend(t)) continue;
    const d = Number(t.date.slice(8, 10));
    if (d >= 1 && d <= days) buckets[d - 1] += -t.amount;
  }
  return buckets;
};

export const Spending = ({ ctx }: { ctx: AppContextValue }) => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<string[]>([]);
  const [month, setMonth] = useState<string>(currentMonth());
  const [monthInitialized, setMonthInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const bounds = useMemo(() => monthBoundsFor(month), [month]);

  const reload = async (forMonth: string): Promise<void> => {
    setLoading(true);
    try {
      const b = monthBoundsFor(forMonth);
      const data = await api.transactions({ from: b.from, to: b.to });
      setTxs(data);
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let off = false;
    api.months()
      .then((ms) => {
        if (off) return;
        setMonths(ms);
        if (!monthInitialized && ms.length > 0) {
          setMonth(ms[0]);
          setMonthInitialized(true);
        } else if (!monthInitialized) {
          setMonthInitialized(true);
        }
      })
      .catch(() => {
        if (!off) setMonthInitialized(true);
      });
    return () => { off = true; };
  }, [ctx.syncing]);

  useEffect(() => {
    if (!monthInitialized) return;
    void reload(month);
  }, [month, monthInitialized, ctx.syncing]);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedDay(null);
    setSelectedMerchant(null);
  }, [month]);

  const visibleTxs = useMemo(
    () =>
      txs.filter((t) => {
        if (selectedCategory && t.category !== selectedCategory) return false;
        if (selectedDay !== null && Number(t.date.slice(8, 10)) !== selectedDay + 1) return false;
        if (selectedMerchant && t.merchant !== selectedMerchant) return false;
        return true;
      }),
    [txs, selectedCategory, selectedDay, selectedMerchant],
  );

  const stats = useMemo(() => {
    const spent = txs.filter(isSpend).reduce((s, t) => s + -t.amount, 0);
    const income = txs.filter(isIncome).reduce((s, t) => s + t.amount, 0);
    const byCat: Record<string, number> = Object.fromEntries(SPEND_CATEGORIES.map((c) => [c, 0]));
    for (const t of txs) {
      if (!isSpend(t)) continue;
      byCat[t.category] = (byCat[t.category] ?? 0) + -t.amount;
    }
    const orderIdx = (cat: string): number => {
      const i = SPEND_CATEGORIES.indexOf(cat as (typeof SPEND_CATEGORIES)[number]);
      return i === -1 ? SPEND_CATEGORIES.length : i;
    };
    const sortedCats = Object.entries(byCat).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return orderIdx(a[0]) - orderIdx(b[0]);
    });
    const isCurrent = month === currentMonth();
    const elapsedDays = isCurrent ? new Date().getDate() : bounds.days;
    return {
      spent,
      income,
      byCat: sortedCats,
      perDay: spent / Math.max(1, elapsedDays),
      top: sortedCats[0],
    };
  }, [txs, month, bounds.days]);

  const action = (
    <div className="row" style={{ gap: 8 }}>
      <MonthPicker months={months} value={month} onChange={setMonth} disabled={loading} />
      <button className="btn" type="button" onClick={() => void reload(month)} disabled={loading}>
        <Ico name="recur" size={13} /> {loading ? 'Loading…' : 'Refresh'}
      </button>
      <UploadStatementButton onUploaded={() => void ctx.triggerSync()} />
    </div>
  );

  const monthLabel = formatMonthLabel(month);
  const monthName = monthLabel.split(' ')[0];

  return (
    <Shell title="Spending" sub={`${monthLabel} · ${txs.length} transactions`} action={action}>
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Total spent</div>
          <div className="stat-value num">{money(stats.spent, { dp: 0 })}</div>
        </div>
        <div className="card">
          <div className="stat-label">Avg / day</div>
          <div className="stat-value num">{money(stats.perDay, { dp: 0 })}</div>
        </div>
        <div className="card">
          <div className="stat-label">Income</div>
          <div className="stat-value num pos">+{money(stats.income, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Net: {money(stats.income - stats.spent, { sign: true, dp: 0 })}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Largest category</div>
          <div className="stat-value num" style={{ fontSize: 22 }}>
            {stats.top ? stats.top[0] : '—'}
          </div>
          {stats.top && (
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              {money(stats.top[1], { dp: 0 })} · {formatPct((stats.top[1] / Math.max(1, stats.spent)) * 100, { dp: 0 })} of spend
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div className="card-title">Daily spend — {monthName}</div>
          <span className="muted" style={{ fontSize: 11.5 }}>Click a bar to filter to that day</span>
        </div>
        {txs.length === 0 ? (
          <div className="empty" style={{ padding: '40px 0' }}>
            {loading ? 'Loading…' : 'No transactions in this period.'}
          </div>
        ) : (() => {
          const buckets = dailyBuckets(txs, bounds.days);
          const colors = dailyColors(buckets);
          return (
            <>
              <DailyBarChart
                data={buckets}
                colors={colors}
                monthYm={month}
                height={180}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
              <div className="row" style={{ gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--text-dim)' }}>
                <DotLabel color="var(--bg-3)" label="No spend" />
                <DotLabel color="var(--accent)" label="Normal" />
                <DotLabel color="var(--warn)" label="Above avg" />
                <DotLabel color="var(--neg)" label="Heavy (>2× avg)" />
              </div>
            </>
          );
        })()}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div className="card-title">Top merchants — {monthName}</div>
          <span className="muted" style={{ fontSize: 11.5 }}>Click a row to filter the table</span>
        </div>
        <TopMerchants txs={txs} limit={10} selected={selectedMerchant} onSelect={setSelectedMerchant} />
      </div>

      <div className="grid cols-2-3">
        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px', gap: 12, flexWrap: 'wrap' }}>
            <div className="row" style={{ gap: 8, alignItems: 'center', minWidth: 0, flexWrap: 'wrap' }}>
              <div className="card-title">Transactions</div>
              {selectedCategory && (
                <FilterChip label={selectedCategory} onClear={() => setSelectedCategory(null)} />
              )}
              {selectedDay !== null && (
                <FilterChip
                  label={dayChipLabel(month, selectedDay)}
                  onClear={() => setSelectedDay(null)}
                />
              )}
              {selectedMerchant && (
                <FilterChip label={selectedMerchant} onClear={() => setSelectedMerchant(null)} />
              )}
            </div>
            <span className="muted" style={{ fontSize: 12 }}>
              Showing {visibleTxs.length}{(selectedCategory || selectedDay !== null || selectedMerchant) ? ` of ${txs.length}` : ''}
            </span>
          </div>
          {visibleTxs.length === 0 ? (
            <div className="empty">
              <div className="h2">
                {selectedCategory || selectedDay !== null || selectedMerchant
                  ? 'No transactions match the current filter'
                  : `No transactions for ${monthLabel}`}
              </div>
              <div>
                {selectedCategory || selectedDay !== null || selectedMerchant
                  ? 'Clear filters or pick another month.'
                  : 'Pick another month or upload a PDF statement.'}
              </div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Merchant</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Date</th>
                  <th className="right" style={{ paddingRight: 24 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleTxs.map((t) => (
                  <tr key={t.transaction_id}>
                    <td style={{ paddingLeft: 24, maxWidth: 240 }}>
                      <div className="ellipsis" style={{ fontWeight: 500 }}>{t.merchant}</div>
                      {t.is_subscription && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>Subscription</div>}
                    </td>
                    <td><span className="chip">{t.category}</span></td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{t.account_name}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{t.date}</td>
                    <td className="right num" style={{ paddingRight: 24, fontWeight: 500, color: t.amount > 0 ? 'var(--pos)' : 'var(--text)' }}>
                      {money(t.amount, { sign: t.amount > 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">By category</div>
            <span className="muted" style={{ fontSize: 11 }}>{monthName}</span>
          </div>
          {stats.byCat.length === 0 ? (
            <div className="empty" style={{ padding: '20px 0' }}>—</div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {stats.byCat.map(([cat, val]) => {
                const pct = (val / Math.max(1, stats.spent)) * 100;
                const color = categoryColors[cat] ?? 'var(--text-mute)';
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(isActive ? null : cat)}
                    title={isActive ? 'Clear filter' : `Filter transactions to ${cat}`}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      display: 'block',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? 'var(--accent-line)' : 'transparent'}`,
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      transition: 'background 120ms, border-color 120ms',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--bg-2)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                      <span className="row ellipsis" style={{ gap: 8, flex: 1 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flex: '0 0 8px' }} />
                        <span className="ellipsis" style={{ fontSize: 13 }}>{cat}</span>
                      </span>
                      <span className="num" style={{ fontSize: 13, fontWeight: 500 }}>{money(val, { dp: 0 })}</span>
                    </div>
                    <div className="bar"><span style={{ width: Math.min(pct, 100) + '%', background: color }} /></div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{formatPct(pct, { dp: 1 })} of total</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};
