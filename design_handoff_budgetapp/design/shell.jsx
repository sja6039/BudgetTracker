/* global React, Ico */

const navItems = [
  { id: 'home', label: 'Overview', icon: 'home' },
  { id: 'invest', label: 'Investments', icon: 'chart' },
  { id: 'spend', label: 'Spending', icon: 'wallet' },
  { id: 'subs', label: 'Subscriptions', icon: 'recur', badge: '14' },
  { id: 'budget', label: 'Budgets', icon: 'pie' },
];

const Shell = ({ active, title, sub, action, children, density = 'spacious' }) => {
  return (
    <div className={`budget-app ${density === 'compact' ? 'compact' : ''}`}>
      <aside className="sb">
        <div className="sb-brand">
          <div className="sb-mark">B</div>
          <div>
            <div className="sb-brand-name">BUdget</div>
            <div className="sb-brand-sub">Personal · April 2026</div>
          </div>
        </div>
        <div className="sb-section">Workspace</div>
        {navItems.map(n => (
          <div key={n.id} className={`sb-item ${active === n.id ? 'active' : ''}`}>
            <span className="ico"><Ico name={n.icon} size={16}/></span>
            <span>{n.label}</span>
            {n.badge && <span className="badge">{n.badge}</span>}
          </div>
        ))}
        <div className="sb-section">Accounts</div>
        <div className="sb-item">
          <span className="ico" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--info)', flex: '0 0 8px', marginLeft: 4 }}></span>
          <span>Checking · 4429</span>
          <span className="badge num">$8,412</span>
        </div>
        <div className="sb-item">
          <span className="ico" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)', flex: '0 0 8px', marginLeft: 4 }}></span>
          <span>Savings · 7710</span>
          <span className="badge num">$24.1k</span>
        </div>
        <div className="sb-item">
          <span className="ico" style={{ width: 8, height: 8, borderRadius: 999, background: 'oklch(0.7 0.13 30)', flex: '0 0 8px', marginLeft: 4 }}></span>
          <span>Brokerage</span>
          <span className="badge num">$87.4k</span>
        </div>
        <div className="sb-item">
          <span className="ico" style={{ width: 8, height: 8, borderRadius: 999, background: 'oklch(0.75 0.14 80)', flex: '0 0 8px', marginLeft: 4 }}></span>
          <span>Coinbase</span>
          <span className="badge num">$12.8k</span>
        </div>

        <div className="sb-foot">
          <div className="sb-avatar"></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Morgan Chen</div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>morgan@hey.com</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-mute)' }}><Ico name="gear" size={15}/></span>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="crumb">Home / {title}</div>
            <div className="h1">{title}</div>
            {sub && <div className="sub">{sub}</div>}
          </div>
          <div className="spacer"></div>
          <div className="search"><Ico name="search" size={14}/> <span>Search transactions, tickers…</span></div>
          <button className="btn ghost" style={{ padding: 8 }}><Ico name="bell" size={16}/></button>
          {action || <button className="btn primary"><Ico name="plus" size={14}/> {title === 'Investments' ? 'Add holding' : title === 'Subscriptions' ? 'Track new' : title === 'Budgets' ? 'New category' : 'Add transaction'}</button>}
        </div>
        {children}
      </main>
    </div>
  );
};

window.Shell = Shell;
