'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import styles from '../transactions/dashboard.module.css';
import UserMetrics from '@/components/Users/UserMetrics';
import UserTable from '@/components/Users/UserTable';


export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminService.listUsers();
        setUsers(data);
      } catch (error: any) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFreezeUser = async (id: string, is_frozen: boolean) => {
    try {
      await adminService.freezeUser(id, is_frozen);
      toast.success(`User ${is_frozen ? 'frozen' : 'unfrozen'} successfully`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_frozen } : u));
    } catch (error: any) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = useMemo(() => {
    if (statusFilter === 'all') return users;
    if (statusFilter === 'active') return users.filter(u => !u.is_frozen);
    if (statusFilter === 'frozen') return users.filter(u => u.is_frozen);
    return users;
  }, [users, statusFilter]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage customer accounts and account statuses</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            Refresh List
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <UserMetrics 
            users={users} 
            activeFilter={statusFilter} 
            onFilterChange={setStatusFilter} 
        />
        
        <UserTable 
            data={filteredUsers} 
            onFreezeUser={handleFreezeUser} 
        />
      </section>
    </main>
  );
}

