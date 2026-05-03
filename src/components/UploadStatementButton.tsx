import { useRef, useState } from 'react';
import { api } from '../api';
import { Ico } from '../primitives';

type Phase = 'idle' | 'uploading' | 'extracting' | 'done' | 'error';

export const UploadStatementButton = ({ onUploaded }: { onUploaded: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pct, setPct] = useState(0);
  const [filename, setFilename] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const reset = (delay = 1800): void => {
    window.setTimeout(() => {
      setPhase('idle');
      setPct(0);
      setMessage(null);
      setFilename('');
    }, delay);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFilename(file.name);
    setPct(0);
    setMessage(null);
    setPhase('uploading');
    try {
      const result = await api.uploadStatementWithProgress(file, (p, ph) => {
        setPct(p);
        setPhase(ph);
      });
      onUploaded();
      if (result.added === 0 && result.skipped > 0) {
        setMessage(`Already imported (${result.skipped} txns)`);
      } else {
        setMessage(`Imported ${result.added} transaction${result.added === 1 ? '' : 's'}`);
      }
      setPhase('done');
      reset(2200);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
      setPhase('error');
      reset(3500);
    }
  };

  const busy = phase === 'uploading' || phase === 'extracting';
  const showProgress = busy || phase === 'done' || phase === 'error';

  if (showProgress) {
    const label =
      phase === 'uploading' ? `Uploading${filename ? ` ${filename}` : ''}…` :
      phase === 'extracting' ? 'Extracting transactions with Claude…' :
      phase === 'done' ? (message ?? 'Done') :
      (message ?? 'Upload failed');

    const barClass =
      phase === 'extracting' ? 'bar indeterminate' :
      phase === 'error' ? 'bar over' :
      phase === 'done' ? 'bar' :
      'bar';

    const barWidth =
      phase === 'extracting' ? '100%' :
      phase === 'done' ? '100%' :
      phase === 'error' ? '100%' :
      `${pct}%`;

    const accentColor =
      phase === 'error' ? 'var(--neg)' :
      phase === 'done' ? 'var(--pos)' :
      'var(--accent)';

    return (
      <div
        className="card"
        style={{
          padding: '8px 12px',
          minWidth: 280,
          borderColor: phase === 'error' ? 'var(--neg-line)' : phase === 'done' ? 'var(--accent-line)' : 'var(--line-soft)',
          background: phase === 'error' ? 'var(--neg-soft)' : phase === 'done' ? 'var(--pos-soft)' : 'var(--bg-2)',
        }}
        title={filename}
      >
        <div className="row" style={{ justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
          <span className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
            <Ico
              name={phase === 'done' ? 'check' : phase === 'error' ? 'close' : 'recur'}
              size={12}
              color={accentColor}
            />
            <span className="ellipsis" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{label}</span>
          </span>
          {phase === 'uploading' && (
            <span className="num" style={{ fontSize: 11, color: 'var(--text-mute)', flex: '0 0 auto' }}>{pct}%</span>
          )}
        </div>
        <div className={barClass}>
          <span style={{ width: barWidth, background: accentColor, transition: phase === 'uploading' ? 'width 200ms' : undefined }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => void handleChange(e)}
      />
      <button
        className="btn"
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Upload a PDF statement to import transactions"
      >
        <Ico name="plus" size={13} /> Upload statement
      </button>
    </>
  );
};
