/* global React, Shell, Ico, AreaLine, Spark, Donut, money */

// 12 months of net worth, ascending with realistic noise
const netWorthSeries = [102.4, 104.1, 101.8, 106.5, 110.2, 108.7, 113.4, 117.9, 121.2, 119.6, 126.8, 132.7];
const months = ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'];

const spendBreakdown = [
  { label: 'Housing',       value: 1850, color: 'oklch(0.74 0.14 155)' },
  { label: 'Food & Dining', value: 642,  color: 'oklch(0.72 0.13 240)' },
  { label: 'Transport',     value: 318,  color: 'oklch(0.78 0.14 80)'  },
  { label: 'Shopping',      value: 412,  color: 'oklch(0.70 0.16 30)'  },
  { label: 'Entertainment', value: 189,  color: 'oklch(0.65 0.15 320)' },
  { label: 'Health',        value: 145,  color: 'oklch(0.72 0.10 200)' },
];

const recentTx = [
  { name: 'Whole Foods Market',  cat: 'Food & Dining', acct: 'Checking · 4429', amt: -84.22, date: 'Today, 6:14p', ico: 'food' },
  { name: 'Stripe payroll',      cat: 'Income',        acct: 'Checking · 4429', amt: 4280.00, date: 'Today, 9:00a', ico: 'arrowDown' },
  { name: 'Spotify',             cat: 'Subscription',  acct: 'Visa · 1182',     amt: -11.99, date: 'Yesterday',    ico: 'film' },
  { name: 'Shell Gas Station',   cat: 'Transport',     acct: 'Visa · 1182',     amt: -42.10, date: 'Yesterday',    ico: 'car' },
  { name: 'Uniqlo',              cat: 'Shopping',      acct: 'Visa · 1182',     amt: -126.40, date: 'Apr 27',      ico: 'shop' },
  { name: 'Trader Joe\u2019s',   cat: 'Food & Dining', acct: 'Checking · 4429', amt: -52.88, date: 'Apr 26',       ico: 'food' },
];

const upcomingBills = [
  { name: 'Rent — Eastlake', amt: 1850, due: 'May 1', daysLeft: 2 },
  { name: 'Comcast Internet', amt: 79.99, due: 'May 4', daysLeft: 5 },
  { name: 'Geico Auto', amt: 142.30, due: 'May 7', daysLeft: 8 },
];

const Overview = ({ density }) => {
  const totalSpend = spendBreakdown.reduce((s, x) => s + x.value, 0);
  return (
    <Shell active="home" title="Overview" sub="Tuesday, April 29" density={density}>
      {/* KPI row */}
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Net worth</div>
          <div className="stat-value num">$132,718</div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span className="stat-delta pos"><Ico name="arrowUp" size={11}/> +5.86% MoM</span>
            <Spark data={netWorthSeries} color="var(--pos)" width={90} height={28}/>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Cash on hand</div>
          <div className="stat-value num">$32,541</div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span className="muted" style={{ fontSize: 12 }}>Across 2 accounts</span>
            <Spark data={[28,30,29,31,30,32.5]} color="var(--info)" width={90} height={28}/>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Spent this month</div>
          <div className="stat-value num">$3,556</div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span className="stat-delta neg"><Ico name="arrowUp" size={11}/> +12% vs Mar</span>
            <Spark data={[2.8,3.1,3.6,3.4,3.0,3.5]} color="var(--neg)" width={90} height={28}/>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Investable / Crypto</div>
          <div className="stat-value num">$100,177</div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span className="stat-delta pos"><Ico name="arrowUp" size={11}/> +2.4% today</span>
            <Spark data={[88,91,90,94,98,100.2]} color="var(--accent)" width={90} height={28}/>
          </div>
        </div>
      </div>

      {/* Net worth chart + Donut */}
      <div className="grid cols-2-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Net worth</div>
              <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: '-0.025em' }}>$132,718.42</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <span className="pos num">+$30,318</span>
                <span className="muted"> · last 12 mo</span>
              </div>
            </div>
            <div className="seg">
              <span>1M</span><span>3M</span><span>6M</span><span className="on">1Y</span><span>All</span>
            </div>
          </div>
          <AreaLine data={netWorthSeries} height={220} accent="var(--accent)"/>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, padding: '0 4px' }}>
            {months.filter((_,i)=>i%2===0).map(m => <span key={m} className="muted" style={{ fontSize: 11 }}>{m}</span>)}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">April spending</div>
            <span className="chip"><span className="dot"></span>by category</span>
          </div>
          <div className="row" style={{ gap: 24, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
            <div style={{ position: 'relative' }}>
              <Donut slices={spendBreakdown} size={170} thickness={20}/>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Total</div>
                  <div className="num" style={{ fontSize: 19, fontWeight: 600 }}>${totalSpend.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            {spendBreakdown.map(s => (
              <div key={s.label} className="row" style={{ justifyContent: 'space-between', fontSize: 12.5 }}>
                <span className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }}></span>
                  <span className="dim">{s.label}</span>
                </span>
                <span className="num">${s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + upcoming */}
      <div className="grid cols-2-3">
        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 12px' }}>
            <div className="card-title">Recent transactions</div>
            <span className="muted" style={{ fontSize: 12 }}>View all <Ico name="arrowRight" size={11}/></span>
          </div>
          <table className="tbl">
            <tbody>
              {recentTx.map((t,i) => (
                <tr key={i}>
                  <td style={{ width: 0, paddingLeft: 24 }}>
                    <span className="cat-ico"><Ico name={t.ico} size={15}/></span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{t.cat} · {t.acct}</div>
                  </td>
                  <td className="muted right" style={{ fontSize: 12 }}>{t.date}</td>
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
            <div className="card-title">Upcoming bills</div>
            <span className="muted" style={{ fontSize: 11 }}>Next 14 days</span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {upcomingBills.map((b,i) => (
              <div key={i}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>{b.name}</span>
                  <span className="num" style={{ fontWeight: 500 }}>${b.amt.toFixed(2)}</span>
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="muted" style={{ fontSize: 11.5 }}>{b.due} · in {b.daysLeft} days</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>autopay</span>
                </div>
                <div className="bar" style={{ marginTop: 8 }}>
                  <span style={{ width: `${100 - (b.daysLeft / 14) * 100}%`, background: b.daysLeft <= 3 ? 'var(--warn)' : 'var(--accent)' }}></span>
                </div>
              </div>
            ))}
          </div>
          <hr className="div" style={{ margin: '18px 0' }}/>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="muted" style={{ fontSize: 11.5 }}>Total due</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>$2,072.29</div>
            </div>
            <button className="btn">Pay schedule</button>
          </div>
        </div>
      </div>
    </Shell>
  );
};

window.Overview = Overview;
