'use client';

import { useMemo, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import styles from '@/components/Shared/table.module.css';

export interface Deposit {
  id: string;
  txId: string;
  user: { id: string; email?: string; name?: string };
  fromAddress: string;
  depositAddress: string;
  amount: string;
  status: 'credited' | 'on_hold';
  treasuryTransfer: 'done' | 'in_progress' | 'failed' | 'on_hold';
  receivedAt: string;
}

const TRANSFER_LABEL: Record<Deposit['treasuryTransfer'], [string, string]> = {
  done: ['Moved to treasury', styles.statusSuccess],
  in_progress: ['Moving to treasury', styles.statusProcessing],
  failed: ['Transfer failed', styles.statusFailed],
  on_hold: ['On hold', styles.statusPending],
};

const PAGE = 10;

export default function RecentDepositsTable({ data }: { data: Deposit[] }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter((d) =>
      [d.user.email, d.user.name, d.txId, d.fromAddress].some((v) => (v || '').toLowerCase().includes(s)),
    );
  }, [data, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>USDT Deposits</h3>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by user, email or tx..."
            className={styles.searchInput}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Credited to user</th>
              <th>Treasury</th>
              <th>Received</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>No deposits yet</td></tr>
            )}
            {shown.map((d) => {
              const [label, cls] = TRANSFER_LABEL[d.treasuryTransfer];
              return (
                <tr key={d.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>{(d.user.name || d.user.email || 'U').charAt(0).toUpperCase()}</div>
                      <span>{d.user.name || d.user.email || d.user.id}</span>
                    </div>
                  </td>
                  <td><span className={styles.amount}>{d.amount} USDT</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${d.status === 'credited' ? styles.statusSuccess : styles.statusPending}`}>
                      {d.status === 'credited' ? 'Credited' : 'On hold (below minimum)'}
                    </span>
                  </td>
                  <td><span className={`${styles.statusBadge} ${cls}`}>{label}</span></td>
                  <td className={styles.date}>{new Date(d.receivedAt).toLocaleString()}</td>
                  <td>
                    <a href={`https://tronscan.org/#/transaction/${d.txId}`} target="_blank" rel="noreferrer" title="View on Tronscan">
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>
          Page <span>{page}</span> of <span>{pages}</span> · <span>{rows.length}</span> deposits
        </p>
        <div className={styles.paginationButtons}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className={styles.pageButton}>‹</button>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className={styles.pageButton}>›</button>
        </div>
      </div>
    </div>
  );
}
