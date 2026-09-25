'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import styles from '../transactions/dashboard.module.css';
import table from '@/components/Shared/table.module.css';
import panel from '@/components/Wallet/attention.module.css';
import TableSkeleton from '@/components/Shared/TableSkeleton';

const STATUS_CLASS: Record<string, string> = {
  pending: table.statusPending,
  processing: table.statusProcessing,
  completed: table.statusSuccess,
  failed: table.statusFailed,
};

/**
 * USDT withdrawals are paid by hand from the treasury wallet (e.g. TronLink).
 * The backend never holds the treasury key.
 */
export default function WithdrawalsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<{ id: string; mode: 'sent' | 'reject' } | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await adminService.listWithdrawals());
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!open || !input.trim()) return;
    setBusy(true);
    try {
      if (open.mode === 'sent') {
        await adminService.markWithdrawalSent(open.id, input.trim());
        toast.success('Verified on the blockchain and marked as sent');
      } else {
        await adminService.rejectWithdrawal(open.id, input.trim());
        toast.success('Rejected. The USDT is back in the user\'s balance.');
      }
      setOpen(null);
      setInput('');
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>USDT Withdrawals</h1>
          <p className={styles.subtitle}>
            For each Pending request: 1) open the treasury wallet, 2) send exactly the &quot;Send this&quot; amount of USDT (TRC20) to the address shown,
            3) click &quot;Mark as sent&quot; and paste the transaction hash. We check it on the blockchain before completing.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={load}>Refresh</button>
        </div>
      </header>

      {loading ? (
        <TableSkeleton columns={6} />
      ) : (
        <div className={table.tableContainer}>
          <div className={table.tableWrapper}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Send to (TRC20)</th>
                  <th>Requested</th>
                  <th>Send this</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>No withdrawal requests</td></tr>
                )}
                {rows.map((w) => {
                  const actionable = w.status === 'pending' || w.status === 'processing';
                  return (
                    <Fragment key={w.id}>
                      <tr className={table.tableRow}>
                        <td>{w.user?.account_holder_name || w.user?.phone_number || w.user_id}</td>
                        <td>
                          <span className={table.txId} style={{ wordBreak: 'break-all' }}>{w.destination_address}</span>{' '}
                          <button className={table.moreButton} onClick={() => copy(w.destination_address)} title="Copy address"><Copy size={14} /></button>
                        </td>
                        <td>{w.usdt_amount} USDT</td>
                        <td>
                          <span className={table.amount}>{w.net_amount} USDT</span>{' '}
                          <button className={table.moreButton} onClick={() => copy(String(w.net_amount))} title="Copy amount"><Copy size={14} /></button>
                        </td>
                        <td>
                          <span className={`${table.statusBadge} ${STATUS_CLASS[w.status] || ''}`}>{w.status}</span>
                          {w.tx_hash && (
                            <a href={`https://tronscan.org/#/transaction/${w.tx_hash}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>tx</a>
                          )}
                        </td>
                        <td className={table.date}>{new Date(w.created_at).toLocaleString()}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {actionable && (
                            <>
                              <button className={panel.button} onClick={() => { setOpen({ id: w.id, mode: 'sent' }); setInput(''); }}>Mark as sent</button>{' '}
                              <button className={`${panel.button} ${panel.secondary}`} onClick={() => { setOpen({ id: w.id, mode: 'reject' }); setInput(''); }}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                      {open?.id === w.id && (
                        <tr>
                          <td colSpan={7}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '8px 0' }}>
                              <input
                                autoFocus
                                className={table.searchInput}
                                style={{ flex: 1, minWidth: 280, paddingLeft: 12 }}
                                placeholder={open?.mode === 'sent' ? 'Paste the transaction hash from your wallet' : 'Reason (the user will see it)'}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                              />
                              <button className={panel.button} disabled={busy || !input.trim()} onClick={submit}>
                                {busy ? 'Checking...' : open?.mode === 'sent' ? 'Confirm sent' : 'Reject and refund'}
                              </button>
                              <button className={`${panel.button} ${panel.secondary}`} onClick={() => setOpen(null)}>Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
