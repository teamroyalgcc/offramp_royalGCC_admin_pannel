'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown,
  Filter,
  MoreVertical,
  Download
} from 'lucide-react';
import styles from './table.module.css';
import { Transaction } from '@/types';

interface DataTableProps {
  data: Transaction[];
  onRowClick: (transaction: Transaction) => void;
  onFilterChange?: (filters: any) => void;
}

export default function DataTable({ data, onRowClick }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Simple client-side search for demonstration
  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
            placeholder="Search transactions..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.actions}>
          <button className={styles.filterButton}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className={styles.exportButton}>
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <div className={styles.thContent}>
                  Transaction ID <ArrowUpDown size={14} />
                </div>
              </th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} onClick={() => onRowClick(item)} className={styles.tableRow}>
                <td><span className={styles.txId}>#{item.id}</span></td>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {(item.userName || 'U').charAt(0)}
                    </div>
                    <span>{item.userName || 'Unknown'}</span>
                  </div>
                </td>
                <td className={styles.capitalize}>{item.type}</td>
                <td>
                  <span className={styles.amount}>
                    {item.currency} {item.amount.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</td>
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
