'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import styles from './table.module.css';
import { Transaction } from '@/types';

interface DataTableProps {
  data: Transaction[];
  onRowClick: (transaction: Transaction) => void;
}

const ITEMS_PER_PAGE = 8;

export default function DataTable({ data, onRowClick }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Matches the 12-digit order number, the user's name or their email.
  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data;
    return data.filter(item =>
      (item.orderNo || '').toLowerCase().includes(q) ||
      (item.userName || '').toLowerCase().includes(q) ||
      (item.userEmail || '').toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  // Stay on a valid page when the data or search shrinks the list.
  const currentPage = Math.min(page, totalPages);
  const setCurrentPage = (next: number | ((p: number) => number)) =>
    setPage(typeof next === 'function' ? next(currentPage) : next);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return styles.statusSuccess;
      case 'pending': return styles.statusPending;
      case 'failed': return styles.statusFailed;
      case 'processing': return styles.statusProcessing;
      case 'confirmed': return styles.statusConfirmed;
      case 'stuck': return styles.statusStuck;
      case 'approved': return styles.statusApproved;
      case 'refunded': return styles.statusRefunded;
      default: return '';
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by order no, name or email"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Transaction ID</th>
              <th>USDT</th>
              <th>INR</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
                  {data.length === 0 ? 'No exchange orders yet' : 'No exchange orders match this search'}
                </td>
              </tr>
            )}
            {paginatedData.map((item) => (
              <tr key={item.id} onClick={() => onRowClick(item)} className={styles.tableRow}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {(item.userName || 'U').charAt(0)}
                    </div>
                    <div>
                      <div>{item.userName || 'Unknown'}</div>
                      {item.userEmail && <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.userEmail}</div>}
                    </div>
                  </div>
                </td>
                <td><span className={styles.txId}>{item.orderNo || '—'}</span></td>
                <td>
                  <span className={styles.amount}>
                    {item.amount.toLocaleString()} USDT
                  </span>
                </td>
                <td>
                  <span className={styles.amount}>
                    {item.inr_amount != null && Number.isFinite(item.inr_amount) ? `₹${item.inr_amount.toLocaleString()}` : '—'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.date}>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>
          Showing <span>{filteredData.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span>{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span>{filteredData.length}</span> results
        </p>
        <div className={styles.paginationButtons}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={styles.pageButton}
          >
            <ChevronLeft size={18} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`${styles.pageButton} ${currentPage === i + 1 ? styles.pageActive : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={styles.pageButton}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
