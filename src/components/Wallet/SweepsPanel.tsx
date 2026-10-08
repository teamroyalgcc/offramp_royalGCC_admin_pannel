'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import styles from '@/components/Shared/table.module.css';

interface Purchase { provider: string; costTrx: number; orderId: string | null; at: string }
interface Sweep {
  id: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  amount: string | null;
  costTrx: number;
  purchases: Purchase[];
  txId: string | null;
  lastError: string | null;
  sweepNow: boolean;
  address: string;
  user: string | null;
  createdAt: string;
  confirmedAt: string | null;
  nextAttemptAt: string;
}
interface Funding {
  operatingWallet: { address: string; trx: number; minTrx: number } | null;
  netts: { balanceTrx: number } | { error: string } | null;
  treasury: string;
}

const STATUS: Record<Sweep['status'], [string, string]> = {
  pending: ['Waiting', styles.statusPending],
  submitted: ['Sending', styles.statusProcessing],
  confirmed: ['In treasury', styles.statusSuccess],
  failed: ['Failed', styles.statusFailed],
};

const PROVIDER: Record<string, string> = {
  netts: 'Netts energy rental (paid from the Netts balance)',
  tronnrg: 'TronNRG energy rental (paid from the operating wallet)',
  'tronnrg-unconfirmed': 'TronNRG paid, energy not confirmed (operating wallet)',
  burn: 'TRX sent to burn for energy (operating wallet)',
  activate: 'Address activation (operating wallet)',
};

const tronscan = (path: string) => `https://tronscan.org/#/${path}`;
const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;

/**
 * Transfers from users' deposit addresses to the treasury: what each one paid for energy and
 * to whom, plus the balances that pay for them. "Sweep now" skips the 24 h wait for small balances.
 */
export default function SweepsPanel() {
  const [data, setData] = useState<{ funding: Funding; sweeps: Sweep[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await adminService.listSweeps());
    } catch {
      toast.error('Could not load treasury transfers');
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  const sweepNow = async (id: string) => {
    if (!confirm('Move this balance to the treasury now? It rents energy (about 3 to 4 TRX) instead of waiting for the daily batch.')) return;
    setBusy(id);
    try {
      await adminService.sweepNow(id);
      toast.success('Started. Watch the status here; it usually takes 1 to 3 minutes.');
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Could not start the transfer');
    } finally {
      setBusy(null);
    }
  };

  const f = data?.funding;
  const op = f?.operatingWallet;
  const netts = f?.netts;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Transfers to treasury</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Deposits of 100 USDT or more move at once; smaller ones within 24 h, or now with “Sweep now”.
          </p>
        </div>
        <button className={styles.filterButton} onClick={load} title="Refresh"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 24px 16px' }}>
        <div style={card}>
          <div style={cardLabel}>Netts balance</div>
          {!netts ? <div style={cardValue}>Not configured</div>
            : 'error' in netts ? <div style={{ fontSize: 13, color: '#b91c1c' }}>{netts.error}</div>
            : <div style={{ ...cardValue, color: netts.balanceTrx < 20 ? '#b91c1c' : '#0f172a' }}>{netts.balanceTrx} TRX</div>}
          <a href="https://netts.io" target="_blank" rel="noreferrer" style={cardLink}>Top up at netts.io</a>
        </div>
        <div style={card}>
          <div style={cardLabel}>Operating wallet</div>
          {op ? (
            <>
              <div style={{ ...cardValue, color: op.trx < op.minTrx ? '#b91c1c' : '#0f172a' }}>{op.trx} TRX</div>
              <a href={tronscan(`address/${op.address}`)} target="_blank" rel="noreferrer" style={cardLink}>{short(op.address)} on Tronscan</a>
            </>
          ) : <div style={cardValue}>Not configured</div>}
        </div>
        {f && (
          <div style={card}>
            <div style={cardLabel}>Treasury</div>
            <a href={tronscan(`address/${f.treasury}`)} target="_blank" rel="noreferrer" style={{ ...cardLink, fontSize: 14 }}>{short(f.treasury)} on Tronscan</a>
          </div>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Deposit address</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Energy paid</th>
              <th>Started</th>
              <th>Transfer</th>
            </tr>
          </thead>
          <tbody>
            {data && data.sweeps.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>No transfers yet</td></tr>
            )}
            {data?.sweeps.map((s) => {
              const [label, cls] = STATUS[s.status];
              const waiting = s.status === 'pending' && !s.sweepNow && new Date(s.nextAttemptAt).getTime() > Date.now() + 60_000;
              return (
                <tr key={s.id} className={styles.tableRow}>
                  <td>
                    <a href={tronscan(`address/${s.address}`)} target="_blank" rel="noreferrer">{short(s.address)}</a>
                    {s.user && <div style={{ fontSize: 12, color: '#64748b' }}>{s.user}</div>}
                  </td>
                  <td><span className={styles.amount}>{s.amount ? `${s.amount} USDT` : '–'}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${cls}`}>{label}</span>
                    {waiting && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Due {new Date(s.nextAttemptAt).toLocaleString()}</div>}
                    {s.lastError && s.status !== 'confirmed' && <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4, maxWidth: 260 }}>{s.lastError}</div>}
                  </td>
                  <td>
                    <strong>{s.costTrx} TRX</strong>
                    {s.purchases.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                        {PROVIDER[p.provider] ?? p.provider}: {p.costTrx} TRX
                        {p.orderId && p.provider !== 'netts' && (
                          <> · <a href={tronscan(`transaction/${p.orderId}`)} target="_blank" rel="noreferrer">tx</a></>
                        )}
                        {p.orderId && p.provider === 'netts' && <> · order {p.orderId}</>}
                      </div>
                    ))}
                  </td>
                  <td className={styles.date}>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    {s.txId ? (
                      <a href={tronscan(`transaction/${s.txId}`)} target="_blank" rel="noreferrer" title="View on Tronscan"><ExternalLink size={16} /></a>
                    ) : s.status === 'pending' ? (
                      <button className={styles.filterButton} disabled={busy === s.id || s.sweepNow} onClick={() => sweepNow(s.id)}>
                        {s.sweepNow ? 'Starting…' : 'Sweep now'}
                      </button>
                    ) : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { flex: '1 1 200px', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#f8fafc' };
const cardLabel: React.CSSProperties = { fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 };
const cardValue: React.CSSProperties = { fontSize: 22, fontWeight: 800, margin: '6px 0' };
const cardLink: React.CSSProperties = { fontSize: 12, color: '#2563eb' };
