import { useMemo } from 'react';

export type IconName =
  | 'home' | 'chart' | 'wallet' | 'recur' | 'pie' | 'gear' | 'bell' | 'search'
  | 'plus' | 'arrowUp' | 'arrowDown' | 'arrowRight' | 'food' | 'car' | 'home2'
  | 'shop' | 'film' | 'plane' | 'health' | 'book' | 'spark' | 'check' | 'dots'
  | 'filter' | 'cal' | 'tag' | 'bolt' | 'gift' | 'btc' | 'close';

type IcoProps = { name: IconName; size?: number; color?: string };

export const Ico = ({ name, size = 16, color = 'currentColor' }: IcoProps) => {
  const s = {
    width: size,
    height: size,
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'home': return <svg viewBox="0 0 24 24" {...s}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>;
    case 'chart': return <svg viewBox="0 0 24 24" {...s}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>;
    case 'wallet': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2"/><path d="M3 10h18"/></svg>;
    case 'recur': return <svg viewBox="0 0 24 24" {...s}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 20v-4h4"/></svg>;
    case 'pie': return <svg viewBox="0 0 24 24" {...s}><path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M14 3.2A9 9 0 0 1 20.8 10H14z"/></svg>;
    case 'gear': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case 'bell': return <svg viewBox="0 0 24 24" {...s}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'search': return <svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'plus': return <svg viewBox="0 0 24 24" {...s}><path d="M12 5v14M5 12h14"/></svg>;
    case 'arrowUp': return <svg viewBox="0 0 24 24" {...s}><path d="M7 14l5-5 5 5"/></svg>;
    case 'arrowDown': return <svg viewBox="0 0 24 24" {...s}><path d="M7 10l5 5 5-5"/></svg>;
    case 'arrowRight': return <svg viewBox="0 0 24 24" {...s}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'food': return <svg viewBox="0 0 24 24" {...s}><path d="M4 3v8a4 4 0 0 0 4 4v6"/><path d="M8 3v8"/><path d="M16 3c-2 2-2 7 0 9v9"/></svg>;
    case 'car': return <svg viewBox="0 0 24 24" {...s}><path d="M5 17h14"/><path d="M3 17v-4l2-5h14l2 5v4"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>;
    case 'home2': return <svg viewBox="0 0 24 24" {...s}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>;
    case 'shop': return <svg viewBox="0 0 24 24" {...s}><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>;
    case 'film': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/></svg>;
    case 'plane': return <svg viewBox="0 0 24 24" {...s}><path d="M2 12l20-7-7 20-3-9z"/></svg>;
    case 'health': return <svg viewBox="0 0 24 24" {...s}><path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/></svg>;
    case 'book': return <svg viewBox="0 0 24 24" {...s}><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></svg>;
    case 'spark': return <svg viewBox="0 0 24 24" {...s}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>;
    case 'check': return <svg viewBox="0 0 24 24" {...s}><path d="m5 12 5 5L20 7"/></svg>;
    case 'dots': return <svg viewBox="0 0 24 24" {...s}><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>;
    case 'filter': return <svg viewBox="0 0 24 24" {...s}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>;
    case 'cal': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'tag': return <svg viewBox="0 0 24 24" {...s}><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1"/></svg>;
    case 'bolt': return <svg viewBox="0 0 24 24" {...s}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>;
    case 'gift': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0c0 2 2 3 4 3a2 2 0 0 0 0-4"/></svg>;
    case 'btc': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M9 7v10M9 12h5a2.5 2.5 0 0 0 0-5H9M9 12h6a2.5 2.5 0 0 1 0 5H9M11 5v2M11 17v2M14 5v2M14 17v2"/></svg>;
    case 'close': return <svg viewBox="0 0 24 24" {...s}><path d="M6 6l12 12M18 6L6 18"/></svg>;
  }
};

export type ChartStyle = 'area' | 'bar' | 'stepped';

type AreaLineProps = {
  data: number[];
  height?: number;
  accent?: string;
  style?: ChartStyle;
  padX?: number;
  padY?: number;
};

export const AreaLine = ({
  data,
  height = 200,
  accent = 'var(--accent)',
  style = 'area',
  padX = 0,
  padY = 14,
}: AreaLineProps) => {
  const w = 100;
  const h = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts: Array<[number, number]> = data.map((v, i) => [
    (i / (data.length - 1 || 1)) * (w - padX * 2) + padX,
    h - padY - ((v - min) / range) * (h - padY * 2),
  ]);
  const id = useMemo(() => 'g' + Math.random().toString(36).slice(2, 8), []);

  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const area = path + ` L ${w - padX} ${h} L ${padX} ${h} Z`;

  if (style === 'bar') {
    const bw = ((w - padX * 2) / data.length) * 0.6;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        {data.map((v, i) => {
          const x = (i / (data.length - 1 || 1)) * (w - padX * 2) + padX - bw / 2;
          const y = h - padY - ((v - min) / range) * (h - padY * 2);
          return <rect key={i} x={x} y={y} width={bw} height={h - padY - y} rx="0.6" fill={accent} opacity="0.9" />;
        })}
      </svg>
    );
  }
  if (style === 'stepped') {
    const stepped = pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      return acc + ` L ${p[0]} ${prev[1]} L ${p[0]} ${p[1]}`;
    }, '');
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        <path d={stepped} fill="none" stroke={accent} strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={accent} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

type SparkProps = { data: number[]; color?: string; height?: number; width?: number };

export const Spark = ({ data, color = 'var(--accent)', height = 36, width = 110 }: SparkProps) => {
  if (data.length === 0) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts: Array<[number, number]> = data.map((v, i) => [
    (i / (data.length - 1 || 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
};

export type DonutSlice = { label: string; value: number; color: string };

type DonutProps = { slices: DonutSlice[]; size?: number; thickness?: number };

export const Donut = ({ slices, size = 180, thickness = 22 }: DonutProps) => {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={thickness} />
      {slices.map((sl, i) => {
        const len = (sl.value / total) * c;
        const dasharray = `${len} ${c - len}`;
        const dashoffset = -((acc / total) * c);
        acc += sl.value;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={sl.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
};

type MoneyOpts = { sign?: boolean; k?: boolean; dp?: number };

export const money = (n: number, opts: MoneyOpts = {}): string => {
  const { sign = false, k = false, dp = 2 } = opts;
  const abs = Math.abs(n);
  let s: string;
  if (k && abs >= 1000) s = '$' + (abs / 1000).toFixed(abs >= 10000 ? 1 : 2) + 'k';
  else s = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  if (sign) s = (n < 0 ? '−' : '+') + s;
  else if (n < 0) s = '−' + s;
  return s;
};

export const StatNumber = ({ value, dp = 0 }: { value: number; dp?: number }) => {
  const formatted = money(value, { dp });
  const match = formatted.match(/^([−+-]?)(\$)(.+)$/);
  if (!match) return <div className="stat-value num">{formatted}</div>;
  const [, prefix, dollar, rest] = match;
  return (
    <div className="stat-value num">
      {prefix && <span style={{ color: 'var(--text-dim)', marginRight: 1 }}>{prefix}</span>}
      <span style={{ color: 'var(--text-dim)', fontSize: '0.65em', fontWeight: 500, marginRight: 2, verticalAlign: '0.18em' }}>{dollar}</span>
      <span>{rest}</span>
    </div>
  );
};

type PctOpts = { sign?: boolean; dp?: number };

export const formatPct = (n: number, opts: PctOpts = {}): string => {
  const { sign = false, dp = 1 } = opts;
  const abs = Math.abs(n);
  const s = abs.toFixed(dp) + '%';
  if (sign) return (n < 0 ? '−' : '+') + s;
  return n < 0 ? '−' + s : s;
};

export const safeDays = (iso: string): number | null => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86400000);
};

export const categoryColors: Record<string, string> = {
  Housing: 'var(--info)',
  'Food & Dining': 'var(--warn)',
  Transport: 'var(--accent)',
  Shopping: 'var(--neg)',
  Entertainment: 'var(--account-dot-violet)',
  Health: 'var(--pos)',
  Travel: 'var(--account-dot-amber)',
  Subscriptions: 'var(--account-dot-warm)',
  'Gifts & Misc': 'var(--text-dim)',
  'Venmo/PayPal': 'var(--account-dot-violet)',
  Transfer: 'var(--text-mute)',
  Income: 'var(--pos)',
  Other: 'var(--text-mute)',
};

export const categoryIcons: Record<string, IconName> = {
  Housing: 'home2',
  'Food & Dining': 'food',
  Transport: 'car',
  Shopping: 'shop',
  Entertainment: 'film',
  Health: 'health',
  Travel: 'plane',
  Subscriptions: 'recur',
  'Gifts & Misc': 'gift',
  'Venmo/PayPal': 'wallet',
  Transfer: 'recur',
  Income: 'arrowDown',
  Other: 'tag',
};
