/* global React, Shell, Ico, AreaLine, Spark, money */

const portfolioSeries = [
  62, 64, 61, 66, 70, 68, 72, 75, 78, 82, 80, 86, 84, 89, 92, 90, 94, 97, 95, 99, 100.2
];

const stocks = [
  { sym: 'AAPL', name: 'Apple Inc.',         shares: 42,    price: 218.42, day: +1.84, total: 9173.64,  cost: 7421.00, spark: [7.2,7.5,7.4,7.7,8.1,8.4,8.7,9.0,9.17] },
  { sym: 'MSFT', name: 'Microsoft Corp.',    shares: 18,    price: 432.10, day: +0.62, total: 7777.80,  cost: 6210.00, spark: [5.9,6.1,6.4,6.6,6.9,7.2,7.4,7.6,7.78] },
  { sym: 'NVDA', name: 'NVIDIA Corp.',       shares: 24,    price: 921.55, day: +3.12, total: 22117.20, cost: 12480.00, spark: [11,12.5,14,15.6,17,18.8,19.4,21,22.1] },
  { sym: 'VTI',  name: 'Vanguard Total Mkt', shares: 86,    price: 268.71, day: +0.41, total: 23109.06, cost: 19840.00, spark: [19,19.4,19.9,20.4,20.8,21.5,22,22.7,23.1] },
  { sym: 'GOOG', name: 'Alphabet Inc.',      shares: 22,    price: 174.30, day: -0.55, total: 3834.60,  cost: 3520.00, spark: [3.4,3.6,3.55,3.7,3.65,3.78,3.82,3.8,3.83] },
  { sym: 'TSLA', name: 'Tesla Inc.',         shares: 12,    price: 192.40, day: -1.42, total: 2308.80,  cost: 3120.00, spark: [3.1,3.0,2.9,2.7,2.55,2.4,2.5,2.35,2.31] },
];

const cryptoHoldings = [
  { sym: 'BTC',  name: 'Bitcoin',  qty: 0.184,  price: 64210.00, day: +2.41, total: 11814.64, cost: 8420.00,  spark: [7.4,7.9,8.6,9.2,9.8,10.4,10.9,11.3,11.81] },
  { sym: 'ETH',  name: 'Ethereum', qty: 1.42,   price: 3280.00,  day: +1.18, total: 4657.60,  cost: 3960.00,  spark: [3.6,3.8,3.9,4.0,4.2,4.35,4.5,4.6,4.66] },
  { sym: 'SOL',  name: 'Solana',   qty: 28.4,   price: 142.10,   day: +4.62, total: 4035.64,  cost: 2840.00,  spark: [2.5,2.7,2.9,3.1,3.4,3.6,3.7,3.95,4.04] },
  { sym: 'LINK', name: 'Chainlink',qty: 120,    price: 14.62,    day: -0.84, total: 1754.40,  cost: 1620.00,  spark: [1.6,1.65,1.7,1.72,1.78,1.74,1.78,1.76,1.75] },
];

const Investments = ({ density, chartStyle = 'area' }) => {
  const totalEquity = stocks.reduce((s, x) => s + x.total, 0);
  const totalCrypto = cryptoHoldings.reduce((s, x) => s + x.total, 0);
  const total = totalEquity + totalCrypto;
  const totalCost = stocks.reduce((s,x)=>s+x.cost,0) + cryptoHoldings.reduce((s,x)=>s+x.cost,0);
  const gain = total - totalCost;
  const gainPct = (gain / totalCost) * 100;

  const Row = ({ a, isCrypto }) => {
    const g = a.total - a.cost;
    const gp = (g / a.cost) * 100;
    return (
      <tr>
        <td style={{ paddingLeft: 24 }}>
          <div className="row" style={{ gap: 12 }}>
            <span className="cat-ico" style={{ background: isCrypto ? 'oklch(0.75 0.14 80 / 0.15)' : 'var(--bg-2)', borderColor: isCrypto ? 'oklch(0.75 0.14 80 / 0.3)' : 'var(--line-soft)', color: isCrypto ? 'oklch(0.85 0.14 80)' : 'var(--text)' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '-0.02em' }}>{a.sym.slice(0,3)}</span>
            </span>
            <div>
              <div style={{ fontWeight: 500 }}>{a.sym}</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{a.name}</div>
            </div>
          </div>
        </td>
        <td className="num">{isCrypto ? a.qty.toFixed(a.qty < 1 ? 4 : 2) : a.shares}</td>
        <td className="num">{money(a.price)}</td>
        <td className={`num ${a.day >= 0 ? 'pos' : 'neg'}`}>{a.day >= 0 ? '+' : ''}{a.day.toFixed(2)}%</td>
        <td><Spark data={a.spark} color={a.day >= 0 ? 'var(--pos)' : 'var(--neg)'} width={90} height={28}/></td>
        <td className="num right" style={{ fontWeight: 500 }}>{money(a.total)}</td>
        <td className={`num right ${g >= 0 ? 'pos' : 'neg'}`} style={{ paddingRight: 24 }}>
          {g >= 0 ? '+' : '−'}{money(Math.abs(g))} <span style={{ opacity: 0.7, fontSize: 11.5 }}>({gp >= 0 ? '+' : ''}{gp.toFixed(1)}%)</span>
        </td>
      </tr>
    );
  };

  return (
    <Shell active="invest" title="Investments" sub="Brokerage + Coinbase · live as of 4:32p ET" density={density}>
      {/* Top stat band */}
      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Portfolio value</div>
          <div className="stat-value num">{money(total, { dp: 0 })}</div>
          <div className="stat-delta pos" style={{ marginTop: 10 }}><Ico name="arrowUp" size={11}/> +$2,318 today</div>
        </div>
        <div className="card">
          <div className="stat-label">All-time gain</div>
          <div className="stat-value num pos">+{money(gain, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>+{gainPct.toFixed(1)}% on cost basis</div>
        </div>
        <div className="card">
          <div className="stat-label">Equities</div>
          <div className="stat-value num">{money(totalEquity, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{((totalEquity/total)*100).toFixed(0)}% of portfolio · 6 holdings</div>
        </div>
        <div className="card">
          <div className="stat-label">Crypto</div>
          <div className="stat-value num">{money(totalCrypto, { dp: 0 })}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{((totalCrypto/total)*100).toFixed(0)}% of portfolio · {cryptoHoldings.length} assets</div>
        </div>
      </div>

      {/* Big chart */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Portfolio performance</div>
            <div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 6, letterSpacing: '-0.025em' }}>{money(total, { dp: 2 })}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <span className="pos num">+{money(gain, { dp: 0 })}</span>
              <span className="muted"> all-time · </span>
              <span className="pos num">+12.4%</span>
              <span className="muted"> YTD</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip"><span className="dot" style={{ background: 'var(--accent)' }}></span>Equities</span>
            <span className="chip"><span className="dot" style={{ background: 'oklch(0.75 0.14 80)' }}></span>Crypto</span>
            <div className="seg">
              <span>1D</span><span>1W</span><span>1M</span><span>3M</span><span>6M</span><span className="on">1Y</span><span>All</span>
            </div>
          </div>
        </div>
        <AreaLine data={portfolioSeries} height={260} accent="var(--accent)" style={chartStyle}/>
      </div>

      {/* Stocks table */}
      <div className="card" style={{ padding: 0, marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div>
            <div className="card-title">Stocks & ETFs</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{stocks.length} positions · cost basis ${stocks.reduce((s,x)=>s+x.cost,0).toLocaleString()}</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost"><Ico name="filter" size={13}/> Filter</button>
            <button className="btn">Sort: Value</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Asset</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Today</th>
              <th>30d</th>
              <th className="right">Value</th>
              <th className="right" style={{ paddingRight: 24 }}>Gain</th>
            </tr>
          </thead>
          <tbody>{stocks.map(s => <Row key={s.sym} a={s}/>)}</tbody>
        </table>
      </div>

      {/* Crypto table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '20px 24px 14px' }}>
          <div>
            <div className="card-title">Crypto</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{cryptoHoldings.length} assets · synced from Coinbase</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip solid"><Ico name="bolt" size={11}/>Live prices</span>
            <button className="btn">Sort: Value</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Asset</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>24h</th>
              <th>30d</th>
              <th className="right">Value</th>
              <th className="right" style={{ paddingRight: 24 }}>Gain</th>
            </tr>
          </thead>
          <tbody>{cryptoHoldings.map(c => <Row key={c.sym} a={c} isCrypto/>)}</tbody>
        </table>
      </div>
    </Shell>
  );
};

window.Investments = Investments;
