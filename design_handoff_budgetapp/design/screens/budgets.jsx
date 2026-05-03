/* global React, Shell, Ico, AreaLine, money */

const cats = [
  { name: 'Housing',       limit: 2000, spent: 1850,  color: 'oklch(0.74 0.14 155)', ico: 'home2', tx: 1 },
  { name: 'Food & Dining', limit: 700,  spent: 642,   color: 'oklch(0.72 0.13 240)', ico: 'food',  tx: 18 },
  { name: 'Transport',     limit: 400,  spent: 318,   color: 'oklch(0.78 0.14 80)',  ico: 'car',   tx: 9 },
  { name: 'Shopping',      limit: 300,  spent: 412,   color: 'oklch(0.70 0.16 30)',  ico: 'shop',  tx: 7 },
  { name: 'Entertainment', limit: 200,  spent: 189,   color: 'oklch(0.65 0.15 320)', ico: 'film',  tx: 5 },
  { name: 'Health',        limit: 200,  spent: 145,   color: 'oklch(0.72 0.10 200)', ico: 'health',tx: 4 },
  { name: 'Travel',        limit: 600,  spent: 384,   color: 'oklch(0.70 0.13 200)', ico: 'plane', tx: 1 },
  { name: 'Subscriptions', limit: 250,  spent: 205.91,color: 'oklch(0.65 0.10 290)', ico: 'recur', tx: 12 },
  { name: 'Gifts & Misc',  limit: 150,  spent: 38,    color: 'oklch(0.70 0.10 100)', ico: 'gift',  tx: 2 },
];

const Budgets = ({ density }) => {
  const totalLimit = cats.reduce((s,c) => s + c.limit, 0);
  const totalSpent = cats.reduce((s,c) => s + c.spent, 0);
  const remaining = totalLimit - totalSpent;
  const overCount = cats.filter(c => c.spent > c.limit).length;

  const overallPct = (totalSpent / totalLimit) * 100;

  return (
    <Shell active="budget" title="Budgets" sub={`April 2026 · day 29 of 30 · ${overCount} categor${overCount===1?'y':'ies'} over limit`} density={density}>
      {/* Top stat band */}
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Monthly limit</div>
          <div className="stat-value num">${totalLimit.toLocaleString()}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>9 categories tracked</div>
        </div>
        <div className="card">
          <div className="stat-label">Spent so far</div>
          <div className="stat-value num">${totalSpent.toFixed(0)}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{overallPct.toFixed(0)}% of limit · day 29/30</div>
        </div>
        <div className="card">
          <div className="stat-label">Remaining</div>
          <div className={`stat-value num ${remaining >= 0 ? 'pos' : 'neg'}`}>${remaining.toFixed(0)}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>~$32/day pace recommended</div>
        </div>
        <div className="card">
          <div className="stat-label">Pacing</div>
          <div className="stat-value num" style={{ color: 'var(--warn)' }}>On pace</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Projected ${(totalSpent / 29 * 30).toFixed(0)} by month-end</div>
        </div>
      </div>

      {/* Overall progress card */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Overall budget</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: '-0.025em' }}>${totalSpent.toFixed(0)} <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>of ${totalLimit.toLocaleString()}</span></div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip"><span className="dot"></span>Spent</span>
            <span className="chip"><span className="dot" style={{ background: 'var(--text-mute)' }}></span>Pace marker</span>
            <div className="seg"><span>Apr</span><span className="on">This month</span><span>Custom</span></div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 14, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, width: overallPct + '%', background: 'linear-gradient(90deg, var(--accent), oklch(0.72 0.13 240))', borderRadius: 999 }}></div>
          <div style={{ position: 'absolute', top: -4, bottom: -4, left: '96.6%', width: 2, background: 'var(--text-dim)' }}></div>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
          <span className="muted">$0</span>
          <span style={{ color: 'var(--text-dim)' }}>Day 29 pace marker · ${(totalLimit * 29/30).toFixed(0)}</span>
          <span className="muted">${totalLimit.toLocaleString()}</span>
        </div>
      </div>

      {/* Category cards grid */}
      <div className="grid cols-3">
        {cats.map(c => {
          const pct = (c.spent / c.limit) * 100;
          const over = c.spent > c.limit;
          const warn = pct >= 90 && !over;
          const remaining = c.limit - c.spent;
          return (
            <div key={c.name} className="card">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 12 }}>
                  <span className="cat-ico" style={{ background: 'transparent', borderColor: c.color + '40', color: c.color }}><Ico name={c.ico} size={15}/></span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{c.tx} transactions</div>
                  </div>
                </div>
                <span className="chip" style={over
                  ? { color: 'var(--neg)', borderColor: 'oklch(0.70 0.18 25 / 0.35)', background: 'oklch(0.70 0.18 25 / 0.08)' }
                  : warn
                  ? { color: 'var(--warn)', borderColor: 'oklch(0.80 0.14 80 / 0.35)', background: 'oklch(0.80 0.14 80 / 0.08)' }
                  : {}}>
                  {over ? `+$${(c.spent - c.limit).toFixed(0)} over` : warn ? 'Near limit' : 'On track'}
                </span>
              </div>

              <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
                <div>
                  <div className="num" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.025em' }}>${c.spent.toFixed(0)}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>of ${c.limit} limit</div>
                </div>
                <div className="num" style={{ fontSize: 13, fontWeight: 500, color: over ? 'var(--neg)' : 'var(--text-dim)' }}>
                  {over ? `−$${Math.abs(remaining).toFixed(0)}` : `$${remaining.toFixed(0)} left`}
                </div>
              </div>

              <div className={`bar ${over ? 'over' : warn ? 'warn' : ''}`} style={{ marginTop: 14 }}>
                <span style={{ width: Math.min(pct, 100) + '%', background: over ? 'var(--neg)' : warn ? 'var(--warn)' : c.color }}></span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                <span className="muted num">{pct.toFixed(0)}%</span>
                <span className="muted">~${(c.spent / 29).toFixed(0)}/day</span>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

window.Budgets = Budgets;
