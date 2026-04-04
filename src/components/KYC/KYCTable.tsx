'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown,
  Filter,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Clock
} from 'lucide-react';
import styles from '@/components/Shared/table.module.css';
import { KYCRequest } from '@/types';

interface KYCTableProps {
  data: KYCRequest[];
  onRowClick: (request: KYCRequest) => void;
}

export default function KYCTable({ data, onRowClick }: KYCTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <ShieldCheck size={16} />;
      case 'rejected': return <ShieldAlert size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return styles.statusSuccess;
      case 'rejected': return styles.statusFailed;
      default: return styles.statusPending;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search KYC requests..." 
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
              <th>ID</th>
              <th>User</th>
              <th>Status</th>
              <th>Submitted At</th>
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

                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </td>
                <td className={styles.date}>{formatDate(item.submittedAt)}</td>
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
