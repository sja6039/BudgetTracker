import { useEffect, useState } from 'react';
import { api } from '../api';
import { AreaLine, Ico, Spark, money, formatPct } from '../primitives';
import { Shell } from '../Shell';
import type { EnrichedInvestment, Investment } from '../../shared/types';

type FormState = {
  symbol: string;
  name: string;
  shares: string;
  cost_basis: string;
  asset_type: 'stock' | 'crypto';
  account: string;
};

const emptyForm: FormState = {
  symbol: '',
  name: '',
  shares: '',
  cost_basis: '',
  asset_type: 'stock',
  account: 'Brokerage',
};

const AddHoldingForm = ({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) => {
  const [f, setF] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const inv: Omit<Investment, 'id' | 'added_date'> = {
        symbol: f.symbol.trim().toUpperCase(),
        name: f.name.trim() || f.symbol.trim().toUpperCase(),
        shares: Number(f.shares),
        cost_basis: Number(f.cost_basis),
        asset_type: f.asset_type,
        account: f.account.trim() || 'Brokerage',
      };
      if (!inv.symbol || !inv.shares || !inv.cost_basis) {
        throw new Error('Symbol, shares, and cost basis are required');
      }
      await api.addInvestment(inv);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 18 }}>
      <div className="card-head">
        <div className="card-title">Add holding</div>
      </div>
      <div className="grid cols-3" style={{ gap: 14 }}>
        <div>
          <label className="field-label">Asset type</label>
          <select
            className="field"
            value={f.asset_type}
            onChange={(e) => setF({ ...f, asset_type: e.target.value as 'stock' | 'crypto' })}
          >
            <option value="stock">Stock / ETF</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div>
          <label className="field-label">Symbol</label>
          <input
            className="field"
            placeholder={f.asset_type === 'crypto' ? 'BTC' : 'AAPL'}
            value={f.symbol}
            onChange={(e) => setF({ ...f, symbol: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Name (optional)</label>
          <input
            className="field"
            placeholder="Apple Inc."
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">{f.asset_type === 'crypto' ? 'Quantity' : 'Shares'}</label>
          <input
            className="field"
            type="number"
            step="any"
            value={f.shares}
            onChange={(e) => setF({ ...f, shares: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Cost basis (total $)</label>
          <input
            className="field"
            type="number"
            step="any"
            value={f.cost_basis}
            onChange={(e) => setF({ ...f, cost_basis: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Account label</label>
          <input
            className="field"
            value={f.account}
            onChange={(e) => setF({ ...f, account: e.target.value })}
          />
        </div>
      </div>
      {error && <div className="neg" style={{ fontSize: 12, marginTop: 12 }}>{error}</div>}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14, gap: 8 }}>
        <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
};

const Row = ({ a, onDelete }: { a: EnrichedInvestment; onDelete: () => void }) => {
  const isCrypto = a.asset_type === 'crypto';
  const initials = a.symbol.length > 4 ? a.symbol.slice(0, 3) : a.symbol;
  return (
    <tr>
      <td style={{ paddingLeft: 24, maxWidth: 240 }}>
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <span className="cat-ico">
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '-0.02em' }}>{initials}</span>
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="ellipsis" style={{ fontWeight: 500 }}>{a.symbol}</div>
            <div className="muted ellipsis" style={{ fontSize: 11.5, marginTop: 1 }}>{a.name}</div>
          </div>
        </div>
      </td>
      <td className="num">{isCrypto ? a.shares.toFixed(a.shares < 1 ? 4 : 2) : a.shares}</td>
      <td className="num">{money(a.current_price)}</td>
      <td className={`num ${a.day_change_pct >= 0 ? 'pos' : 'neg'}`}>
        {formatPct(a.day_change_pct, { sign: true, dp: 2 })}
      </td>
      <td><Spark data={a.spark} color={a.day_change_pct >= 0 ? 'var(--pos)' : 'var(--neg)'} width={90} height={28} /></td>
      <td className="num right" style={{ fontWeight: 500 }}>{money(a.market_value, { dp: 0 })}</td>
      <td className={`num right ${a.total_gain >= 0 ? 'pos' : 'neg'}`}>
        {money(a.total_gain, { sign: true, dp: 0 })}{' '}
        <span style={{ opacity: 0.7, fontSize: 11.5 }}>({formatPct(a.total_gain_pct, { sign: true, dp: 1 })})</span>
      </td>
      <td className="right" style={{ paddingRight: 24 }}>
        <button className="btn ghost" type="button" onClick={onDelete} title="Delete" style={{ padding: '4px 8px' }}>
          <Ico name="dots" size={14} />
        </button>
      </td>
    </tr>
  );
};

export const Investments = () => {
  const [items, setItems] = useState<EnrichedInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const reload = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await api.investments();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const stocks = items.filter((i) => i.asset_type === 'stock');
  const cryptos = items.filter((i) => i.asset_type === 'crypto');
  const totalEquity = stocks.reduce((s, x) => s + x.market_value, 0);
  const totalCrypto = cryptos.reduce((s, x) => s + x.market_value, 0);
  const total = totalEquity + totalCrypto;
  const totalCost = items.reduce((s, x) => s + x.cost_basis, 0);
  const gain = total - totalCost;
  const gainPct = totalCost > 0 ? (gain / totalCost) * 100 : 0;
  const dayPnl = items.reduce((s, x) => s + (x.market_value * x.day_change_pct) / 100, 0);

  const portfolioSeries = items.length === 0
    ? []
    : items[0].spark.map((_, i) => items.reduce((s, x) => s + (x.spark[i] ?? x.current_price) * x.shares, 0));

  const action = (
    <button className="btn primary" type="button" onClick={() => setAdding(true)}>
      <Ico name="plus" size={14} /> Add holding
    </button>
  );

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this holding?')) return;
    await api.deleteInvestment(id);
    void reload();
  };

  return (
    <Shell
      title="Investments"
      sub={items.length === 0 ? 'No holdings yet' : `${items.length} positions across stocks + crypto`}
      action={action}
    >
      {adding && (
        <AddHoldingForm
          onSaved={() => { setAdding(false); void reload(); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Portfolio value</div>
          <div className="stat-value num">{money(total, { dp: 0 })}</div>
          {items.length > 0 && (
            <div className={`stat-delta ${dayPnl >= 0 ? 'pos' : 'neg'}`} style={{ marginTop: 10 }}>
              <Ico name={dayPnl >= 0 ? 'arrowUp' : 'arrowDown'} size={11} />
              {money(dayPnl, { sign: true, dp: 0 })} today
            </div>
          )}
        </div>
        <div className="card">
          <div className="stat-label">All-time gain</div>
          <div className={`stat-value num ${gain >= 0 ? 'pos' : 'neg'}`}>
            {gain >= 0 ? '+' : '−'}{money(Math.abs(gain), { dp: 0 })}
          </div>
          {totalCost > 0 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              {formatPct(gainPct, { sign: true, dp: 1 })} on cost basis
            </div>
          )}
        </div>
        <div className="card">
          <div className="stat-label">Equities</div>
          <div className="stat-value num">{money(totalEquity, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {total > 0 ? `${formatPct((totalEquity / total) * 100, { dp: 0 })} of portfolio` : '—'} · {stocks.length} holdings
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Crypto</div>
          <div className="stat-value num">{money(totalCrypto, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {total > 0 ? `${formatPct((totalCrypto / total) * 100, { dp: 0 })} of portfolio` : '—'} · {cryptos.length} assets
          </div>
        </div>
      </div>

      {portfolioSeries.length > 1 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Portfolio performance</div>
              <div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 6, letterSpacing: '-0.025em' }}>
                {money(total)}
              </div>
            </div>
            <div className="seg"><span className="on">30D</span></div>
          </div>
          <AreaLine data={portfolioSeries} height={240} accent="var(--accent)" />
        </div>
      )}

      <div className="card" style={{ padding: 0, marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div>
            <div className="card-title">Stocks & ETFs</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
              {stocks.length} positions{stocks.length > 0 ? ` · cost basis ${money(stocks.reduce((s, x) => s + x.cost_basis, 0), { dp: 0 })}` : ''}
            </div>
          </div>
        </div>
        {stocks.length === 0 ? (
          <div className="empty">
            <div className="h2">{loading ? 'Loading…' : 'No equity holdings'}</div>
            {!loading && <div>Click "Add holding" to enter a stock or ETF position.</div>}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Asset</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Today</th>
                <th>30d</th>
                <th className="right">Value</th>
                <th className="right">Gain</th>
                <th />
              </tr>
            </thead>
            <tbody>{stocks.map((s) => <Row key={s.id} a={s} onDelete={() => void handleDelete(s.id)} />)}</tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div>
            <div className="card-title">Crypto</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
              {cryptos.length} assets{cryptos.length > 0 ? ' · prices via CoinGecko' : ''}
            </div>
          </div>
        </div>
        {cryptos.length === 0 ? (
          <div className="empty">
            <div className="h2">{loading ? 'Loading…' : 'No crypto holdings'}</div>
            {!loading && <div>Use "Add holding" with type Crypto to add a position.</div>}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Asset</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>24h</th>
                <th>30d</th>
                <th className="right">Value</th>
                <th className="right">Gain</th>
                <th />
              </tr>
            </thead>
            <tbody>{cryptos.map((c) => <Row key={c.id} a={c} onDelete={() => void handleDelete(c.id)} />)}</tbody>
          </table>
        )}
      </div>
    </Shell>
  );
};
