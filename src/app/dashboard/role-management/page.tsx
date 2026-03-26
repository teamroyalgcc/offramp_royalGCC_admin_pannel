'use client';

import { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import AdminTable from '@/components/Admins/AdminTable';
import AdminModal from '@/components/Admins/AdminModal';
import ConfirmModal from '@/components/Shared/ConfirmModal';
import { AdminUser } from '@/types';
import styles from '../transactions/dashboard.module.css';

// Mock data generator for Admins
const generateMockAdmins = (): AdminUser[] => [
  {
    id: 'ADM001',
    username: 'SuperAdmin',
    email: 'admin@fintech.com',
    role: 'super_admin',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'ADM002',
    username: 'FinanceManager',
    email: 'finance@fintech.com',
    role: 'admin',
    createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'ADM003',
    username: 'KYCReviewer',
    email: 'kyc@fintech.com',
    role: 'admin',
    createdAt: new Date('2024-03-10').toISOString(),
  }
];

export default function RoleManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'password'>('add');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  // Custom confirmation state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);

  useEffect(() => {
    setAdmins(generateMockAdmins());
  }, []);

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleChangePassword = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setModalMode('password');
    setIsModalOpen(true);
  };

  const handleRemoveClick = (id: string) => {
    setAdminToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      setAdmins(prev => prev.filter(admin => admin.id !== adminToDelete));
      toast.success('Administrator access revoked');
      setAdminToDelete(null);
    }
  };

  const handleSaveAdmin = (data: Partial<AdminUser> & { password?: string }) => {
    if (modalMode === 'add') {
      const newAdmin: AdminUser = {
        id: `ADM${100 + admins.length + 1}`,
        username: data.username!,
        email: data.email!,
        role: data.role as any,
        createdAt: new Date().toISOString(),
      };
      setAdmins(prev => [...prev, newAdmin]);
    } else {
      // Password update logic simulated
      console.log('Password updated for admin:', data.id);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Shield size={24} color="#4f46e5" />
            <h1 className={styles.title}>Role Management</h1>
          </div>
          <p className={styles.subtitle}>Manage administrator accounts and portal access permissions</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => setAdmins(generateMockAdmins())}>
            <RefreshCw size={18} style={{ marginRight: '8px' }} />
            Refresh
          </button>
          <button 
            className={styles.refreshButton} 
            style={{ backgroundColor: '#4f46e5', color: 'white', borderColor: '#4338ca' }}
            onClick={handleAddAdmin}
          >
            <UserPlus size={18} style={{ marginRight: '8px' }} />
            Add Admin
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <AdminTable 
          data={admins} 
          onChangePassword={handleChangePassword}
          onRemove={handleRemoveClick}
        />
      </section>

      <AdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAdmin}
        editingAdmin={selectedAdmin}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Revoke Admin Access?"
        message="This action will immediately remove this user's ability to log in and manage the portal. This action cannot be undone."
        confirmText="Revoke Access"
      />
    </main>
  );
}
