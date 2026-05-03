import { listEnriched } from './investments.js';
import { loadTransactions, listAvailableMonths } from './statements.js';
import { detectSubscriptions } from './subscriptions.js';
import type { OverviewData } from '../shared/types.js';

const CATEGORY_COLORS: Record<string, string> = {
  Housing: 'oklch(0.74 0.14 155)',
  'Food & Dining': 'oklch(0.72 0.13 240)',
  Transport: 'oklch(0.78 0.14 80)',
  Shopping: 'oklch(0.70 0.16 30)',
  Entertainment: 'oklch(0.65 0.15 320)',
  Health: 'oklch(0.72 0.10 200)',
  Travel: 'oklch(0.70 0.13 200)',
  Subscriptions: 'oklch(0.65 0.10 290)',
  'Gifts & Misc': 'oklch(0.70 0.10 100)',
  'Venmo/PayPal': 'oklch(0.68 0.14 260)',
  Transfer: 'oklch(0.55 0.010 260)',
  Other: 'oklch(0.55 0.010 260)',
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

const monthBoundsFor = (ym: string): { from: string; to: string } => {
  const [y, m] = ym.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { from: `${y}-${pad2(m)}-01`, to: `${y}-${pad2(m)}-${pad2(lastDay)}` };
};

const prevMonth = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}-${pad2(pm)}`;
};

const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const monthsBackFromToday = (n: number): string[] => {
  const out: string[] = [];
  let cur = currentMonth();
  for (let i = 0; i < n; i++) {
    out.unshift(cur);
    cur = prevMonth(cur);
  }
  return out;
};

const resolveMonth = (requested: string | undefined, available: string[]): string => {
  if (requested && /^\d{4}-\d{2}$/.test(requested)) return requested;
  return available[0] ?? currentMonth();
};

export const buildOverview = async (requestedMonth?: string): Promise<OverviewData> => {
  const available_months = listAvailableMonths();
  const selected_month = resolveMonth(requestedMonth, available_months);

  const cur = monthBoundsFor(selected_month);
  const prev = monthBoundsFor(prevMonth(selected_month));
  const curTxs = loadTransactions(cur.from, cur.to);
  const prevTxs = loadTransactions(prev.from, prev.to);

  let investable = 0;
  let day_change_dollars = 0;
  try {
    const inv = await listEnriched();
    investable = inv.reduce((s, i) => s + i.market_value, 0);
    day_change_dollars = inv.reduce((s, i) => s + (i.market_value * i.day_change_pct) / 100, 0);
  } catch {
    // ignore — no investments or price fetch failed
  }
  const investable_day_change_pct = investable > 0 ? (day_change_dollars / investable) * 100 : 0;

  const net_worth = investable;

  const isSpend = (t: { amount: number; category: string }): boolean =>
    t.amount < 0 && t.category !== 'Transfer';

  const spent_this_month = curTxs.filter(isSpend).reduce((s, t) => s + -t.amount, 0);
  const spent_last_month = prevTxs.filter(isSpend).reduce((s, t) => s + -t.amount, 0);

  const breakdownMap: Record<string, number> = {};
  for (const t of curTxs) {
    if (!isSpend(t)) continue;
    breakdownMap[t.category] = (breakdownMap[t.category] ?? 0) + -t.amount;
  }
  const spend_breakdown = Object.entries(breakdownMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2)),
      color: CATEGORY_COLORS[label] ?? CATEGORY_COLORS.Other,
    }));

  const recent_transactions = curTxs.slice(0, 6);

  const subs = detectSubscriptions();
  const upcoming_bills = subs
    .filter((s) => s.status !== 'Idle' && s.user_status !== 'cancelled')
    .map((s) => {
      const next = new Date(s.next_charge);
      const days = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        name: s.merchant,
        amount: s.amount,
        due: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        days_left: days,
      };
    })
    .filter((b) => b.days_left >= 0 && b.days_left <= 14)
    .sort((a, b) => a.days_left - b.days_left);

  const monthDeltas = monthsBackFromToday(12).map((ym) => {
    const b = monthBoundsFor(ym);
    const txs = loadTransactions(b.from, b.to).filter((t) => t.category !== 'Transfer');
    const monthSpend = txs.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
    const monthIncome = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    return monthIncome - monthSpend;
  });
  let acc = net_worth - monthDeltas.reduce((s, x) => s + x, 0);
  const net_worth_history = monthDeltas.map((m) => {
    acc += m;
    return acc;
  });

  const trendMonths: string[] = [];
  let trendCur = selected_month;
  for (let i = 0; i < 6; i++) {
    trendMonths.unshift(trendCur);
    trendCur = prevMonth(trendCur);
  }
  const monthly_trend = trendMonths.map((ym) => {
    const b = monthBoundsFor(ym);
    const txs = loadTransactions(b.from, b.to);
    const by_category: Record<string, number> = {};
    let total = 0;
    for (const t of txs) {
      if (t.amount >= 0 || t.category === 'Transfer') continue;
      const v = -t.amount;
      by_category[t.category] = (by_category[t.category] ?? 0) + v;
      total += v;
    }
    for (const k of Object.keys(by_category)) by_category[k] = Number(by_category[k].toFixed(2));
    return { month: ym, total: Number(total.toFixed(2)), by_category };
  });

  return {
    net_worth,
    spent_this_month,
    spent_last_month,
    investable,
    investable_day_change_pct,
    net_worth_history,
    spend_breakdown,
    recent_transactions,
    upcoming_bills,
    selected_month,
    available_months,
    monthly_trend,
  };
};
