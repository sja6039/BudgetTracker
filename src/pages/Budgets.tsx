import { useEffect, useMemo, useState } from 'react';
import type { AppContextValue } from '../App';
import { api } from '../api';
import { Ico, money, formatPct, categoryColors, categoryIcons } from '../primitives';
import { Shell } from '../Shell';
import type { Budget, Category, Transaction } from '../../shared/types';
import { CATEGORIES } from '../../shared/types';

const startOfMonth = (): string => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const endOfMonth = (): string => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const NewBudgetForm = ({
  existing,
  onSaved,
  onCancel,
}: {
  existing: Budget[];
  onSaved: () => void;
  onCancel: () => void;
}) => {
  const taken = new Set(existing.map((b) => b.category));
  const available = CATEGORIES.filter((c) => !taken.has(c) && c !== 'Income');
  const [category, setCategory] = useState<Category>(available[0] ?? 'Other');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const n = Number(limit);
    if (!Number.isFinite(n) || n <= 0) return;
    setSaving(true);
    try {
      await api.upsertBudget({ category, monthly_limit: n });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const limitNum = Number(limit);
  const limitValid = Number.isFinite(limitNum) && limitNum > 0;

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 18 }}>
      <div className="card-head">
        <div className="card-title">New budget</div>
      </div>
      <div className="grid cols-3" style={{ gap: 14 }}>
        <div>
          <label className="field-label">Category</label>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {available.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Monthly limit ($)</label>
          <input
            className="field"
            type="number"
            step="0.01"
            min="0.01"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14, gap: 8 }}>
        <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn primary" disabled={saving || !limitValid}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export const Budgets = ({ ctx }: { ctx: AppContextValue }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const reload = async (): Promise<void> => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([
        api.budgets(),
        api.transactions({ from: startOfMonth(), to: endOfMonth() }),
      ]);
      setBudgets(b);
      setTxs(t);
    } catch {
      setBudgets([]);
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [ctx.syncing]);

  const spentByCategory = useMemo(() => {
    const m: Record<string, { spent: number; count: number }> = {};
    for (const t of txs) {
      if (t.amount >= 0) continue;
      const e = m[t.category] ?? { spent: 0, count: 0 };
      e.spent += -t.amount;
      e.count += 1;
      m[t.category] = e;
    }
    return m;
  }, [txs]);

  const totalLimit = budgets.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category]?.spent ?? 0), 0);
  const remaining = totalLimit - totalSpent;
  const overCount = budgets.filter((b) => (spentByCategory[b.category]?.spent ?? 0) > b.monthly_limit).length;
  const overallPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projected = totalSpent / Math.max(1, dayOfMonth) * daysInMonth;
  const paceMarkerPct = Math.min(100, Math.max(0, (dayOfMonth / daysInMonth) * 100));

  const action = (
    <button className="btn primary" type="button" onClick={() => setAdding(true)}>
      <Ico name="plus" size={14} /> New budget
    </button>
  );

  const handleDelete = async (cat: Category): Promise<void> => {
    if (!confirm(`Remove budget for ${cat}?`)) return;
    await api.deleteBudget(cat);
    void reload();
  };

  return (
    <Shell
      title="Budgets"
      sub={budgets.length === 0
        ? 'No budgets set'
        : `${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })} · day ${dayOfMonth} of ${daysInMonth} · ${overCount} over limit`}
      action={action}
    >
      {adding && (
        <NewBudgetForm
          existing={budgets}
          onSaved={() => { setAdding(false); void reload(); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Monthly limit</div>
          <div className="stat-value num">{money(totalLimit, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{budgets.length} categories tracked</div>
        </div>
        <div className="card">
          <div className="stat-label">Spent so far</div>
          <div className="stat-value num">{money(totalSpent, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {formatPct(overallPct, { dp: 0 })} of limit · day {dayOfMonth}/{daysInMonth}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Remaining</div>
          <div className={`stat-value num ${remaining >= 0 ? 'pos' : 'neg'}`}>{money(remaining, { dp: 0 })}</div>
        </div>
        <div className="card">
          <div className="stat-label">Pacing</div>
          <div className="stat-value num" style={{ fontSize: 22 }}>
            {projected > totalLimit ? 'Over pace' : 'On pace'}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Projected {money(projected, { dp: 0 })} by month-end</div>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Overall budget</div>
              <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: '-0.025em' }}>
                {money(totalSpent, { dp: 0 })} <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>of {money(totalLimit, { dp: 0 })}</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 14, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0, width: Math.min(overallPct, 100) + '%',
              background: 'linear-gradient(90deg, var(--accent), var(--info))', borderRadius: 999,
            }} />
            <div style={{ position: 'absolute', top: -4, bottom: -4, left: paceMarkerPct + '%', width: 2, background: 'var(--text-dim)' }} />
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
            <span className="muted">$0</span>
            <span style={{ color: 'var(--text-dim)' }}>Day {dayOfMonth} pace · {money(totalLimit * paceMarkerPct / 100, { dp: 0 })}</span>
            <span className="muted">{money(totalLimit, { dp: 0 })}</span>
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="card empty">
          <div className="h2">{loading ? 'Loading…' : 'No budgets yet'}</div>
          {!loading && <div>Click "New budget" to set a monthly limit on a category.</div>}
        </div>
      ) : (
        <div className="grid cols-3">
          {budgets.map((b) => {
            const stat = spentByCategory[b.category] ?? { spent: 0, count: 0 };
            const pct = b.monthly_limit > 0 ? (stat.spent / b.monthly_limit) * 100 : 0;
            const over = stat.spent > b.monthly_limit;
            const warn = pct >= 90 && !over;
            const left = b.monthly_limit - stat.spent;
            const color = categoryColors[b.category] ?? 'var(--accent)';
            const iconName = categoryIcons[b.category] ?? 'tag';
            return (
              <div key={b.category} className="card">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div className="row" style={{ gap: 12, minWidth: 0, flex: 1 }}>
                    <span className="cat-ico" style={{ background: 'transparent', borderColor: 'var(--line-soft)', color }}>
                      <Ico name={iconName} size={15} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="ellipsis" style={{ fontWeight: 500 }}>{b.category}</div>
                      <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{stat.count} transactions</div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="chip" style={over
                      ? { color: 'var(--neg)', borderColor: 'var(--neg-line)', background: 'var(--neg-soft)' }
                      : warn
                        ? { color: 'var(--warn)', borderColor: 'var(--warn-line)', background: 'var(--warn-soft)' }
                        : {}}>
                      {over ? `${money(stat.spent - b.monthly_limit, { sign: true, dp: 0 })} over` : warn ? 'Near limit' : 'On track'}
                    </span>
                    <button className="btn ghost" type="button" onClick={() => void handleDelete(b.category)} style={{ padding: '4px 6px' }}>
                      <Ico name="dots" size={14} />
                    </button>
                  </div>
                </div>

                <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
                  <div>
                    <div className="num" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.025em' }}>{money(stat.spent, { dp: 0 })}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>of {money(b.monthly_limit, { dp: 0 })} limit</div>
                  </div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 500, color: over ? 'var(--neg)' : 'var(--text-dim)' }}>
                    {over ? money(left, { dp: 0 }) : `${money(left, { dp: 0 })} left`}
                  </div>
                </div>

                <div className={`bar ${over ? 'over' : warn ? 'warn' : ''}`} style={{ marginTop: 14 }}>
                  <span style={{ width: Math.min(pct, 100) + '%', background: over ? 'var(--neg)' : warn ? 'var(--warn)' : color }} />
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                  <span className="muted num">{formatPct(pct, { dp: 0 })}</span>
                  <span className="muted">~{money(stat.spent / Math.max(1, dayOfMonth), { dp: 0 })}/day</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
};
