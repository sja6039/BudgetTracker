import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Ico } from './primitives';
import type { IconName } from './primitives';

type NavId = 'home' | 'invest' | 'spend' | 'subs' | 'budget';

const navItems: Array<{ id: NavId; label: string; icon: IconName; path: string }> = [
  { id: 'home', label: 'Overview', icon: 'home', path: '/' },
  { id: 'invest', label: 'Investments', icon: 'chart', path: '/investments' },
  { id: 'spend', label: 'Spending', icon: 'wallet', path: '/spending' },
  { id: 'subs', label: 'Subscriptions', icon: 'recur', path: '/subscriptions' },
  { id: 'budget', label: 'Budgets', icon: 'pie', path: '/budgets' },
];

type ShellProps = {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  density?: 'spacious' | 'compact';
};

const monthLabel = (): string => {
  const d = new Date();
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const Shell = ({ title, sub, action, children, density = 'spacious' }: ShellProps) => {
  return (
    <div className={`budget-app ${density === 'compact' ? 'compact' : ''}`}>
      <aside className="sb">
        <div className="sb-brand">
          <div className="sb-mark">B</div>
          <div>
            <div className="sb-brand-name">BUdget</div>
            <div className="sb-brand-sub">Personal · {monthLabel()}</div>
          </div>
        </div>
        <div className="sb-section">Workspace</div>
        {navItems.map((n) => (
          <NavLink
            key={n.id}
            to={n.path}
            end={n.path === '/'}
            className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          >
            <span className="ico"><Ico name={n.icon} size={16} /></span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div className="sb-foot">
          <div className="sb-avatar" />
          <div className="sb-foot-text">
            <div className="sb-foot-name">You</div>
            <div className="sb-foot-sub">Personal</div>
          </div>
          <span className="sb-foot-icon">
            <Ico name="gear" size={15} />
          </span>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="crumb">Home / {title}</div>
            <div className="h1">{title}</div>
            {sub && <div className="sub">{sub}</div>}
          </div>
          <div className="spacer" />
          <button className="btn ghost" style={{ padding: 8 }} type="button" aria-label="Notifications">
            <Ico name="bell" size={16} />
          </button>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
};
