'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Fingerprint
} from 'lucide-react';
import styles from '@/components/Shared/table.module.css';

interface UserTableProps {
  data: any[];
  onFreezeUser: (id: string, frozen: boolean) => void;
}

export default function UserTable({ data, onFreezeUser }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.account_holder_name || item.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            placeholder="Search users..." 
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
              <th className={styles.hideOnMobile}>Bank Name</th>
              <th>Account Number</th>
              <th>Status</th>
              <th className={styles.hideOnMobile}>Joined At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td><span className={styles.txId}>#{item.id.substring(0, 8)}</span></td>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {(item.account_holder_name || item.username || 'U').charAt(0)}
                    </div>
                    <span>{item.account_holder_name || item.username}</span>
                  </div>
                </td>
                <td className={styles.hideOnMobile}>{item.ifsc_code || 'N/A'}</td>
                <td className={styles.date}>{item.account_number || 'No Account'}</td>
                <td>
                  <span className={`${styles.statusBadge} ${item.is_frozen ? styles.statusFailed : styles.statusSuccess}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                    {item.is_frozen ? <UserX size={16} /> : <UserCheck size={16} />}
                    {item.is_frozen ? 'Frozen' : 'Active'}
                  </span>
                </td>
                <td className={`${styles.date} ${styles.hideOnMobile}`}>{formatDate(item.created_at)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                      onClick={() => onFreezeUser(item.id, !item.is_frozen)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: '1px solid',
                        backgroundColor: item.is_frozen ? '#ecfdf5' : '#fff1f2',
                        color: item.is_frozen ? '#059669' : '#e11d48',
                        borderColor: item.is_frozen ? '#10b981' : '#f43f5e'
                      }}
                    >
                      {item.is_frozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button className={styles.moreButton}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
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
