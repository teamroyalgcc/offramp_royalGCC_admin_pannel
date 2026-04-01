'use client';

import { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/Admins/AdminTable';
import AdminModal from '@/components/Admins/AdminModal';
import ConfirmModal from '@/components/Shared/ConfirmModal';
import { adminService } from '@/services/adminService';
import { AdminUser } from '@/types';
import styles from '../transactions/dashboard.module.css';
import TableSkeleton from '@/components/Shared/TableSkeleton';

export default function RoleManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'password'>('add');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Check authorization first
      const me = await adminService.getMe();
      if (me.role !== 'superadmin') {
        setIsAuthorized(false);
        toast.error('Unauthorized access');
        router.push('/dashboard');
        return;
      }
      setIsAuthorized(true);

      const response = await adminService.listAdmins();
      // Handle both {status: 'success', data: []} and direct []
      const adminData = Array.isArray(response) ? response : (response.data || []);
      
      const mappedAdmins = adminData.map((a: any) => ({
        ...a,
        createdAt: a.created_at || a.createdAt
      }));
      setAdmins(mappedAdmins);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
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

  const handleConfirmDelete = async () => {
    if (adminToDelete) {
      try {
        const response = await adminService.deleteAdmin(adminToDelete);
        if (response.status === 'success' || response.message || response.success) {
          toast.success(response.message || 'Administrator access revoked');
          fetchAdmins(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to revoke access');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || 'Failed to delete admin');
      } finally {
        setIsConfirmOpen(false);
        setAdminToDelete(null);
      }
    }
  };

  const handleSaveAdmin = async (data: Partial<AdminUser> & { password?: string }) => {
    try {
      if (modalMode === 'add') {
        const response = await adminService.addAdmin({
          username: data.username,
          password: data.password,
          role: data.role
        });
        if (response.status === 'success' || response.username || response.admin) {
          toast.success(response.message || 'Admin added successfully');
          fetchAdmins(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to add admin');
        }
      } else {
        if (selectedAdmin) {
          const response = await adminService.updateAdmin(selectedAdmin.id, {
            password: data.password,
            username: data.username || selectedAdmin.username
          });
          if (response.status === 'success' || response.message || response.admin) {
            toast.success(response.message || 'Admin credentials updated');
            fetchAdmins(); // Refresh to get updated data
          } else {
            toast.error(response.message || 'Failed to update credentials');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  if (isAuthorized === false) return null;

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
          <button className={styles.refreshButton} onClick={fetchAdmins} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ marginRight: '8px' }} />
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
        {loading ? (
          <TableSkeleton rows={5} />
        ) : admins.length > 0 ? (
          <AdminTable 
            data={admins} 
            onChangePassword={handleChangePassword}
            onRemove={handleRemoveClick}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserPlus size={48} />
            </div>
            <h3 className={styles.emptyTitle}>No Administrators Yet</h3>
            <p className={styles.emptyText}>Get started by creating the first administrator account for your team.</p>
            <button className={styles.emptyButton} onClick={handleAddAdmin}>
              <UserPlus size={18} style={{ marginRight: '8px' }} />
              Add First Admin
            </button>
          </div>
        )}
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
