'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  UserPlus, 
  Mail, 
  Shield, 
  Calendar,
  Lock,
  Trash2,
  MoreVertical
} from 'lucide-react';
import styles from '@/components/Shared/table.module.css';
import { AdminUser } from '@/types';

interface AdminTableProps {
  data: AdminUser[];
  onChangePassword: (admin: AdminUser) => void;
  onRemove: (id: string) => void;
}

export default function AdminTable({ data, onChangePassword, onRemove }: AdminTableProps) {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Admin Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((admin) => (
              <tr key={admin.id} className={styles.tableRow}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {admin.userName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{admin.userName}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <Mail size={14} />
                    {admin.email}
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${admin.role === 'super_admin' ? styles.statusSuccess : styles.statusPending}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', textTransform: 'capitalize' }}>
                    <Shield size={14} />
                    {admin.role.replace('_', ' ')}
                  </span>
                </td>
                <td className={styles.date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      className={styles.moreButton} 
                      onClick={() => onChangePassword(admin)}
                      title="Change Password"
                    >
                      <Lock size={18} />
                    </button>
                    <button 
                      className={styles.moreButton} 
                      style={{ color: '#ef4444' }}
                      onClick={() => onRemove(admin.id)}
                      title="Remove Access"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
