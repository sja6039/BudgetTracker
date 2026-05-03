import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppContextValue } from '../App';
import { api } from '../api';
import { Donut, Ico, Spark, StatNumber, money, formatPct } from '../primitives';
import { Shell } from '../Shell';
import { MonthPicker, formatMonthLabel } from '../components/MonthPicker';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import type { OverviewData } from '../../shared/types';

const todayLabel = (): string => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

export const Overview = ({ ctx }: { ctx: AppContextValue }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string | undefined>(undefined);

  useEffect(() => {
    let off = false;
    api.overview(month)
      .then((d) => { if (!off) setData(d); })
      .catch((e: Error) => { if (!off) setError(e.message); });
    return () => { off = true; };
  }, [ctx.syncing, month]);

  const action = (
    <div className="row" style={{ gap: 8 }}>
      {data && (
        <MonthPicker
          months={data.available_months}
          value={data.selected_month}
          onChange={setMonth}
        />
      )}
      <Link to="/spending" className="btn primary" style={{ textDecoration: 'none' }}>
        <Ico name="plus" size={14} /> Add transaction
      </Link>
    </div>
  );

  if (error) {
    return (
      <Shell title="Overview" sub={todayLabel()} action={action}>
        <div className="card empty">
          <div className="h2">Backend not reachable</div>
          <div>{error}</div>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell title="Overview" sub={todayLabel()} action={action}>
        <div className="card empty">Loading…</div>
      </Shell>
    );
  }

  const totalSpend = data.spend_breakdown.reduce((s, x) => s + x.value, 0);
  const monthDelta = data.spent_last_month
    ? ((data.spent_this_month - data.spent_last_month) / data.spent_last_month) * 100
    : 0;

  return (
    <Shell title="Overview" sub={todayLabel()} action={action}>
      <div className="grid cols-3" style={{ marginBottom: 18 }}>
        <div className="card stat-card" style={{ ['--card-accent' as never]: 'var(--pos)' }}>
          <div className="stat-label">Net worth</div>
          <StatNumber value={data.net_worth} />
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            {data.net_worth_history.length > 1 && (
              <Spark data={data.net_worth_history} color="var(--pos)" width={90} height={28} />
            )}
          </div>
        </div>
        <div className="card stat-card" style={{ ['--card-accent' as never]: 'var(--warn)' }}>
          <div className="stat-label">Spent in {formatMonthLabel(data.selected_month).split(' ')[0]}</div>
          <StatNumber value={data.spent_this_month} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            {data.spent_last_month > 0 && (
              <span className={`stat-delta ${monthDelta >= 0 ? 'neg' : 'pos'}`}>
                <Ico name={monthDelta >= 0 ? 'arrowUp' : 'arrowDown'} size={11} />
                {formatPct(Math.abs(monthDelta), { dp: 0 })} vs prev
              </span>
            )}
          </div>
        </div>
        <div className="card stat-card" style={{ ['--card-accent' as never]: 'var(--info)' }}>
          <div className="stat-label">Investable / Crypto</div>
          <StatNumber value={data.investable} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span className={`stat-delta ${data.investable_day_change_pct >= 0 ? 'pos' : 'neg'}`}>
              <Ico name={data.investable_day_change_pct >= 0 ? 'arrowUp' : 'arrowDown'} size={11} />
              {formatPct(Math.abs(data.investable_day_change_pct), { dp: 2 })} today
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div className="card-title">Spending trend — last 6 months</div>
          <span className="muted" style={{ fontSize: 11.5 }}>Hover a bar for the breakdown</span>
        </div>
        {data.monthly_trend.every((m) => m.total === 0) ? (
          <div className="empty" style={{ padding: '40px 0' }}>
            No spending recorded in the last 6 months.
          </div>
        ) : (
          <MonthlyTrendChart data={data.monthly_trend} height={200} />
        )}
      </div>

      <div className="grid cols-2-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">{formatMonthLabel(data.selected_month).split(' ')[0]} spending by category</div>
            <span className="chip"><span className="dot" />donut</span>
          </div>
          {data.spend_breakdown.length === 0 ? (
            <div className="empty">No spending recorded for {formatMonthLabel(data.selected_month)}.</div>
          ) : (
            <div className="row" style={{ alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '0 0 auto' }}>
                <Donut slices={data.spend_breakdown} size={170} thickness={20} />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>Total</div>
                    <div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(totalSpend, { dp: 0 })}</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                {data.spend_breakdown.map((s) => (
                  <div key={s.label} className="row" style={{ justifyContent: 'space-between', fontSize: 12.5, minWidth: 0 }}>
                    <span className="row" style={{ gap: 8, minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block', flex: '0 0 8px' }} />
                      <span className="dim ellipsis">{s.label}</span>
                    </span>
                    <span className="num">{money(s.value, { dp: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Upcoming bills</div>
            <span className="muted" style={{ fontSize: 11 }}>Next 14 days</span>
          </div>
          {data.upcoming_bills.length === 0 ? (
            <div className="empty">Nothing scheduled.</div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {data.upcoming_bills.map((b) => (
                <div key={b.name}>
                  <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                    <span className="ellipsis" style={{ fontWeight: 500, flex: 1 }}>{b.name}</span>
                    <span className="num" style={{ fontWeight: 500 }}>{money(b.amount)}</span>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                    <span className="muted" style={{ fontSize: 11.5 }}>{b.due} · in {b.days_left} day{b.days_left === 1 ? '' : 's'}</span>
                  </div>
                  <div className="bar" style={{ marginTop: 8 }}>
                    <span style={{
                      width: `${100 - Math.min(100, (b.days_left / 14) * 100)}%`,
                      background: b.days_left <= 3 ? 'var(--warn)' : 'var(--accent)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 12px' }}>
          <div className="card-title">Recent transactions</div>
          <Link to="/spending" className="muted" style={{ fontSize: 12, textDecoration: 'none' }}>
            View all <Ico name="arrowRight" size={11} />
          </Link>
        </div>
        {data.recent_transactions.length === 0 ? (
          <div className="empty">
            <div className="h2">No transactions yet</div>
            <div>Upload a PDF statement from the Spending tab to start importing.</div>
          </div>
        ) : (
          <table className="tbl">
            <tbody>
              {data.recent_transactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td style={{ paddingLeft: 24, maxWidth: 0 }}>
                    <div className="ellipsis" style={{ fontWeight: 500 }}>{t.merchant}</div>
                    <div className="muted ellipsis" style={{ fontSize: 11.5, marginTop: 2 }}>
                      {t.category} · {t.account_name}
                    </div>
                  </td>
                  <td className="muted right" style={{ fontSize: 12 }}>{t.date}</td>
                  <td className="right num" style={{ paddingRight: 24, fontWeight: 500, color: t.amount > 0 ? 'var(--pos)' : 'var(--text)' }}>
                    {money(t.amount, { sign: t.amount > 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
};
