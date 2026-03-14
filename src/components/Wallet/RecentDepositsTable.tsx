'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';
import styles from '@/components/Shared/table.module.css';
import { Transaction } from '@/types';

interface RecentDepositsTableProps {
  data: Transaction[];
}

export default function RecentDepositsTable({ data }: RecentDepositsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter only deposits
  const depositData = useMemo(() => {
    return data.filter(item => item.type === 'deposit');
  }, [data]);

  const filteredData = useMemo(() => {
    return depositData.filter(item => 
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bankDetails.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [depositData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Recent Wallet Deposits</h3>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search deposits..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>TNX ID</th>
              <th>User Name</th>
              <th>User ID</th>
              <th>Bank Account</th>
              <th>Bank Name</th>
              <th>
                <div className={styles.thContent}>
                  Amount <ArrowUpDown size={14} />
                </div>
              </th>
              <th>Date & Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td><span className={styles.txId}>#{item.id}</span></td>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {item.userName.charAt(0)}
                    </div>
                    <span>{item.userName}</span>
                  </div>
                </td>
                <td><span className={styles.txId}>{item.userId}</span></td>
                <td className={styles.date}>{item.bankDetails.accountNumber}</td>
                <td>{item.bankDetails.bankName}</td>
                <td>
                  <span className={styles.amount}>
                    {item.currency} {item.amount.toLocaleString()}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
                <td>
                  <button className={styles.moreButton}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>
          Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span>{filteredData.length}</span> results
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
