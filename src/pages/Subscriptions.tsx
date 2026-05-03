import { useEffect, useState } from 'react';
import type { AppContextValue } from '../App';
import { api } from '../api';
import { Ico, money, safeDays } from '../primitives';
import type { IconName } from '../primitives';
import { Shell } from '../Shell';
import type { Subscription } from '../../shared/types';

const ICON_BY_CATEGORY: Partial<Record<string, IconName>> = {
  Streaming: 'film',
  Music: 'film',
  Storage: 'gear',
  News: 'book',
  Software: 'bolt',
  Books: 'book',
  Food: 'food',
  Membership: 'shop',
  Fitness: 'health',
  Other: 'recur',
};

export const Subscriptions = ({ ctx }: { ctx: AppContextValue }) => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await api.subscriptions();
      setSubs(data);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [ctx.syncing]);

  const dismiss = async (merchant: string): Promise<void> => {
    setSubs((prev) => prev.filter((s) => s.merchant !== merchant));
    try {
      await api.updateSubscription(merchant, 'dismissed');
    } catch {
      void reload();
    }
  };

  const monthly = subs.filter((s) => s.cycle === 'Monthly').reduce((sum, x) => sum + x.amount, 0);
  const yearly = subs.reduce((sum, x) => sum + x.yearly_cost, 0);
  const idle = subs.filter((s) => s.status === 'Idle');
  const idleCost = idle.reduce((sum, x) => sum + x.yearly_cost, 0);
  const next7 = subs.filter((s) => {
    const days = safeDays(s.next_charge);
    return days !== null && days >= 0 && days <= 7;
  });
  const next7Total = next7.reduce((sum, x) => sum + x.amount, 0);

  const action = (
    <button className="btn primary" type="button" onClick={() => void reload()} disabled={loading}>
      <Ico name="recur" size={14} /> {loading ? 'Detecting…' : 'Re-detect'}
    </button>
  );

  return (
    <Shell
      title="Subscriptions"
      sub={subs.length === 0 ? 'No recurring charges detected' : `${subs.length} services detected from your transaction history`}
      action={action}
    >
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Monthly recurring</div>
          <div className="stat-value num">{money(monthly, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {subs.filter((s) => s.cycle === 'Monthly').length} monthly subs
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Annualized cost</div>
          <div className="stat-value num">{money(yearly, { dp: 0 })}</div>
        </div>
        <div className="card">
          <div className="stat-label">Idle subscriptions</div>
          <div className="stat-value num" style={{ color: idle.length > 0 ? 'var(--warn)' : undefined }}>{idle.length}</div>
          {idle.length > 0 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              Wasting <span className="num">{money(idleCost, { dp: 0 })}/yr</span>
            </div>
          )}
        </div>
        <div className="card">
          <div className="stat-label">Next 7 days</div>
          <div className="stat-value num">{money(next7Total, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {next7.length} charge{next7.length === 1 ? '' : 's'} scheduled
          </div>
        </div>
      </div>

      {idle.length > 0 && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--warn-line)', background: 'var(--warn-soft)' }}>
          <div className="row" style={{ gap: 14 }}>
            <span className="cat-ico" style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn-line)', color: 'var(--warn)' }}>
              <Ico name="bell" size={15} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{idle.length} subscription{idle.length === 1 ? '' : 's'} look idle</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {idle.map((s) => s.merchant).slice(0, 3).join(', ')}
                {idle.length > 3 && ` and ${idle.length - 3} more`} haven't charged in 60+ days. Cancelling could save{' '}
                <span className="num pos">{money(idleCost, { dp: 0 })}/year</span>.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div className="card-title">All subscriptions</div>
        </div>
        {subs.length === 0 ? (
          <div className="empty">
            <div className="h2">{loading ? 'Detecting…' : 'No subscriptions detected'}</div>
            {!loading && <div>Upload a statement and Claude will flag recurring charges as it imports them.</div>}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Service</th>
                <th>Category</th>
                <th>Cycle</th>
                <th>Next charge</th>
                <th>Status</th>
                <th className="right">Monthly</th>
                <th className="right">Yearly</th>
                <th className="right" style={{ paddingRight: 24 }}></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const days = safeDays(s.next_charge);
                const monthlyEquiv = s.cycle === 'Yearly' ? s.amount / 12 : s.amount;
                return (
                  <tr key={s.merchant}>
                    <td style={{ paddingLeft: 24, maxWidth: 240 }}>
                      <div className="row" style={{ gap: 12, minWidth: 0 }}>
                        <span className="cat-ico"><Ico name={ICON_BY_CATEGORY[s.category] ?? 'recur'} size={15} /></span>
                        <div style={{ minWidth: 0 }}>
                          <div className="ellipsis" style={{ fontWeight: 500 }}>{s.merchant}</div>
                          <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{s.charge_count} charges seen</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="chip">{s.category}</span></td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{s.cycle}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>
                      {days === null ? '—' : s.next_charge}
                    </td>
                    <td>
                      <span className="chip" style={s.status === 'Idle'
                        ? { color: 'var(--warn)', borderColor: 'var(--warn-line)', background: 'var(--warn-soft)' }
                        : { color: 'var(--pos)', borderColor: 'var(--accent-line)', background: 'var(--pos-soft)' }}>
                        <span className="dot" style={{ background: s.status === 'Idle' ? 'var(--warn)' : 'var(--pos)' }} />
                        {s.status}
                      </span>
                    </td>
                    <td className="right num" style={{ fontWeight: 500 }}>{money(monthlyEquiv)}</td>
                    <td className="right num">{money(s.yearly_cost)}</td>
                    <td className="right" style={{ paddingRight: 24 }}>
                      <button
                        type="button"
                        onClick={() => void dismiss(s.merchant)}
                        title="Mark as not a subscription"
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: 11.5, color: 'var(--text-mute)' }}
                      >
                        <Ico name="close" size={12} /> Not a sub
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
};
