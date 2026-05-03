/* global React, Shell, Ico, AreaLine, money */

const txData = [
  { name: 'Whole Foods Market',  cat: 'Food & Dining', acct: 'Checking', amt: -84.22,  date: 'Apr 29', ico: 'food', tag: 'Groceries' },
  { name: 'Stripe payroll',      cat: 'Income',        acct: 'Checking', amt: 4280.00, date: 'Apr 29', ico: 'arrowDown', tag: 'Salary' },
  { name: 'Spotify',             cat: 'Subscriptions', acct: 'Visa',     amt: -11.99,  date: 'Apr 28', ico: 'film', tag: 'Music' },
  { name: 'Shell Gas Station',   cat: 'Transport',     acct: 'Visa',     amt: -42.10,  date: 'Apr 28', ico: 'car', tag: 'Fuel' },
  { name: 'Uniqlo',              cat: 'Shopping',      acct: 'Visa',     amt: -126.40, date: 'Apr 27', ico: 'shop', tag: 'Apparel' },
  { name: 'Trader Joe\u2019s',   cat: 'Food & Dining', acct: 'Checking', amt: -52.88,  date: 'Apr 26', ico: 'food', tag: 'Groceries' },
  { name: 'Lyft',                cat: 'Transport',     acct: 'Visa',     amt: -18.40,  date: 'Apr 26', ico: 'car', tag: 'Rideshare' },
  { name: 'AMC Theatres',        cat: 'Entertainment', acct: 'Visa',     amt: -32.50,  date: 'Apr 25', ico: 'film', tag: 'Movies' },
  { name: 'Walgreens',           cat: 'Health',        acct: 'Checking', amt: -28.14,  date: 'Apr 24', ico: 'health', tag: 'Pharmacy' },
  { name: 'Delta Airlines',      cat: 'Travel',        acct: 'Visa',     amt: -384.20, date: 'Apr 23', ico: 'plane', tag: 'Flight' },
  { name: 'Sweetgreen',          cat: 'Food & Dining', acct: 'Visa',     amt: -16.85,  date: 'Apr 23', ico: 'food', tag: 'Lunch' },
  { name: 'Apartment rent',      cat: 'Housing',       acct: 'Checking', amt: -1850.00,date: 'Apr 22', ico: 'home2', tag: 'Rent' },
  { name: 'Amazon',              cat: 'Shopping',      acct: 'Visa',     amt: -68.95,  date: 'Apr 22', ico: 'shop', tag: 'Household' },
  { name: 'Etsy refund',         cat: 'Shopping',      acct: 'Visa',     amt: 24.00,   date: 'Apr 21', ico: 'arrowDown', tag: 'Refund' },
];

const dailySpend = [120, 84, 156, 0, 220, 64, 88, 142, 38, 78, 200, 110, 0, 96, 184, 72, 148, 0, 60, 110, 88, 1985, 80, 410, 28, 50, 16, 60, 84];

const Spending = ({ density, chartStyle = 'bar' }) => {
  const cats = [
    { label: 'Housing',       value: 1850, pct: 52, color: 'oklch(0.74 0.14 155)' },
    { label: 'Food & Dining', value: 642,  pct: 18, color: 'oklch(0.72 0.13 240)' },
    { label: 'Shopping',      value: 412,  pct: 11.6, color: 'oklch(0.70 0.16 30)' },
    { label: 'Transport',     value: 318,  pct: 8.9,  color: 'oklch(0.78 0.14 80)' },
    { label: 'Entertainment', value: 189,  pct: 5.3,  color: 'oklch(0.65 0.15 320)' },
    { label: 'Health',        value: 145,  pct: 4.1,  color: 'oklch(0.72 0.10 200)' },
  ];

  return (
    <Shell active="spend" title="Spending" sub="April 2026 · 47 transactions" density={density}>
      {/* Filter band */}
      <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <span className="chip solid"><Ico name="cal" size={11}/> Apr 1 — Apr 30</span>
        <span className="chip"><Ico name="wallet" size={11}/> All accounts</span>
        <span className="chip"><Ico name="tag" size={11}/> All categories</span>
        <span className="chip"><Ico name="filter" size={11}/> Amount: any</span>
        <div className="spacer"></div>
        <div className="seg"><span>List</span><span className="on">By day</span><span>By category</span></div>
      </div>

      {/* Stat row */}
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Total spent</div>
          <div className="stat-value num">$3,556.42</div>
          <div className="stat-delta neg" style={{ marginTop: 10 }}><Ico name="arrowUp" size={11}/> +$382 vs Mar</div>
        </div>
        <div className="card">
          <div className="stat-label">Avg / day</div>
          <div className="stat-value num">$118.55</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Highest day: $1,985 (Apr 22)</div>
        </div>
        <div className="card">
          <div className="stat-label">Income</div>
          <div className="stat-value num pos">+$4,280</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Net: +$723.58</div>
        </div>
        <div className="card">
          <div className="stat-label">Largest category</div>
          <div className="stat-value num">Housing</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>$1,850 · 52% of spend</div>
        </div>
      </div>

      {/* Daily chart */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Daily spend — April</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Hover bars to inspect · spike on Apr 22 = rent</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip"><span className="dot"></span>Daily total</span>
            <div className="seg"><span>Day</span><span className="on">Week</span><span>Month</span></div>
          </div>
        </div>
        <AreaLine data={dailySpend} height={180} accent="var(--accent)" style={chartStyle} padX={1}/>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, padding: '0 4px' }}>
          {[1,5,10,15,20,25,30].map(d => <span key={d} className="muted" style={{ fontSize: 11 }}>Apr {d}</span>)}
        </div>
      </div>

      {/* Category breakdown + tx list */}
      <div className="grid cols-2-3">
        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
            <div className="card-title">Transactions</div>
            <span className="muted" style={{ fontSize: 12 }}>Showing {txData.length} of 47</span>
          </div>
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
              {txData.map((t,i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div className="row" style={{ gap: 12 }}>
                      <span className="cat-ico"><Ico name={t.ico} size={15}/></span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{t.tag}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{t.cat}</span></td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{t.acct}</td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{t.date}</td>
                  <td className="right num" style={{ paddingRight: 24, fontWeight: 500, color: t.amt > 0 ? 'var(--pos)' : 'var(--text)' }}>
                    {money(t.amt, { sign: t.amt > 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">By category</div>
            <span className="muted" style={{ fontSize: 11 }}>April</span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {cats.map(c => (
              <div key={c.label}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="row" style={{ gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}></span>
                    <span style={{ fontSize: 13 }}>{c.label}</span>
                  </span>
                  <span className="num" style={{ fontSize: 13, fontWeight: 500 }}>${c.value}</span>
                </div>
                <div className="bar"><span style={{ width: c.pct + '%', background: c.color }}></span></div>
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{c.pct}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
};

window.Spending = Spending;
