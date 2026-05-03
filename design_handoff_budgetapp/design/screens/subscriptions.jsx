/* global React, Shell, Ico, money */

const subs = [
  { name: 'Netflix',          cat: 'Streaming',   amt: 22.99,  cycle: 'Monthly', next: 'May 3',  cost: 'film',  status: 'Active', usage: 'Daily', yearly: 275.88 },
  { name: 'Spotify Premium',  cat: 'Music',       amt: 11.99,  cycle: 'Monthly', next: 'May 5',  cost: 'film',  status: 'Active', usage: 'Daily', yearly: 143.88 },
  { name: 'iCloud+ 2TB',      cat: 'Storage',     amt: 9.99,   cycle: 'Monthly', next: 'May 8',  cost: 'gear',  status: 'Active', usage: 'Always', yearly: 119.88 },
  { name: 'NYTimes',          cat: 'News',        amt: 17.00,  cycle: 'Monthly', next: 'May 11', cost: 'book',  status: 'Active', usage: 'Weekly', yearly: 204.00 },
  { name: 'GitHub Pro',       cat: 'Software',    amt: 4.00,   cycle: 'Monthly', next: 'May 12', cost: 'bolt',  status: 'Active', usage: 'Daily', yearly: 48.00 },
  { name: 'Notion',           cat: 'Software',    amt: 10.00,  cycle: 'Monthly', next: 'May 14', cost: 'book',  status: 'Active', usage: 'Daily', yearly: 120.00 },
  { name: 'Adobe Creative',   cat: 'Software',    amt: 59.99,  cycle: 'Monthly', next: 'May 16', cost: 'spark', status: 'Active', usage: 'Weekly', yearly: 719.88 },
  { name: 'Disney+',          cat: 'Streaming',   amt: 13.99,  cycle: 'Monthly', next: 'May 18', cost: 'film',  status: 'Idle',   usage: 'Rare',   yearly: 167.88 },
  { name: 'Peloton App',      cat: 'Fitness',     amt: 24.00,  cycle: 'Monthly', next: 'May 20', cost: 'health',status: 'Idle',   usage: 'Rare',   yearly: 288.00 },
  { name: 'Audible',          cat: 'Books',       amt: 14.95,  cycle: 'Monthly', next: 'May 22', cost: 'book',  status: 'Active', usage: 'Weekly', yearly: 179.40 },
  { name: 'NYT Cooking',      cat: 'Food',        amt: 5.00,   cycle: 'Monthly', next: 'May 24', cost: 'food',  status: 'Active', usage: 'Weekly', yearly: 60.00 },
  { name: 'Dropbox Plus',     cat: 'Storage',     amt: 11.99,  cycle: 'Monthly', next: 'May 25', cost: 'gear',  status: 'Idle',   usage: 'Rare',   yearly: 143.88 },
  { name: 'AmazonPrime',      cat: 'Membership',  amt: 139.00, cycle: 'Yearly',  next: 'Aug 14', cost: 'shop',  status: 'Active', usage: 'Weekly', yearly: 139.00 },
  { name: 'Costco Gold',      cat: 'Membership',  amt: 65.00,  cycle: 'Yearly',  next: 'Nov 2',  cost: 'shop',  status: 'Active', usage: 'Monthly',yearly: 65.00 },
];

const Subscriptions = ({ density }) => {
  const monthly = subs.filter(s => s.cycle === 'Monthly').reduce((s,x) => s + x.amt, 0);
  const yearly = subs.reduce((s,x) => s + x.yearly, 0);
  const idle = subs.filter(s => s.status === 'Idle');
  const idleCost = idle.reduce((s,x) => s + x.yearly, 0);

  return (
    <Shell active="subs" title="Subscriptions" sub={`${subs.length} active services across 4 cards`} density={density}>
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Monthly recurring</div>
          <div className="stat-value num">${monthly.toFixed(2)}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{subs.filter(s=>s.cycle==='Monthly').length} monthly subs</div>
        </div>
        <div className="card">
          <div className="stat-label">Annualized cost</div>
          <div className="stat-value num">${yearly.toFixed(0)}</div>
          <div className="stat-delta neg" style={{ marginTop: 10 }}><Ico name="arrowUp" size={11}/> +$48 vs Q1</div>
        </div>
        <div className="card">
          <div className="stat-label">Idle subscriptions</div>
          <div className="stat-value num" style={{ color: 'var(--warn)' }}>{idle.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Wasting <span className="num">${idleCost.toFixed(0)}/yr</span></div>
        </div>
        <div className="card">
          <div className="stat-label">Next 7 days</div>
          <div className="stat-value num">$48.97</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>3 charges scheduled</div>
        </div>
      </div>

      {/* Idle alert */}
      <div className="card" style={{ marginBottom: 18, borderColor: 'oklch(0.80 0.14 80 / 0.4)', background: 'oklch(0.80 0.14 80 / 0.06)' }}>
        <div className="row" style={{ gap: 14 }}>
          <span className="cat-ico" style={{ background: 'oklch(0.80 0.14 80 / 0.18)', borderColor: 'oklch(0.80 0.14 80 / 0.4)', color: 'var(--warn)' }}><Ico name="bell" size={15}/></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>3 subscriptions look idle</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Disney+, Peloton, and Dropbox haven't seen activity in 60+ days. Cancelling could save <span className="num pos">$599.76/year</span>.</div>
          </div>
          <button className="btn">Review idle</button>
          <button className="btn primary">Cancel all 3</button>
        </div>
      </div>

      {/* Sub list */}
      <div className="card" style={{ padding: 0, marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div className="card-title">All subscriptions</div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip">All</span>
            <span className="chip solid">Monthly</span>
            <span className="chip">Yearly</span>
            <span className="chip" style={{ color: 'var(--warn)', borderColor: 'oklch(0.80 0.14 80 / 0.4)' }}>Idle</span>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Service</th>
              <th>Category</th>
              <th>Cycle</th>
              <th>Usage</th>
              <th>Next charge</th>
              <th className="right">Monthly</th>
              <th className="right" style={{ paddingRight: 24 }}>Yearly</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s,i) => (
              <tr key={i}>
                <td style={{ paddingLeft: 24 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <span className="cat-ico"><Ico name={s.cost} size={15}/></span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{s.cat}</div>
                    </div>
                  </div>
                </td>
                <td><span className="chip">{s.cat}</span></td>
                <td className="muted" style={{ fontSize: 12.5 }}>{s.cycle}</td>
                <td>
                  <span className="chip" style={s.status === 'Idle'
                    ? { color: 'var(--warn)', borderColor: 'oklch(0.80 0.14 80 / 0.4)', background: 'oklch(0.80 0.14 80 / 0.08)' }
                    : { color: 'var(--pos)', borderColor: 'oklch(0.78 0.15 150 / 0.35)', background: 'oklch(0.78 0.15 150 / 0.08)' }}>
                    <span className="dot" style={{ background: s.status === 'Idle' ? 'var(--warn)' : 'var(--pos)' }}></span>
                    {s.usage}
                  </span>
                </td>
                <td className="muted" style={{ fontSize: 12.5 }}>{s.next}</td>
                <td className="right num" style={{ fontWeight: 500 }}>${(s.cycle === 'Yearly' ? s.amt/12 : s.amt).toFixed(2)}</td>
                <td className="right num" style={{ paddingRight: 24 }}>${s.yearly.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
};

window.Subscriptions = Subscriptions;
