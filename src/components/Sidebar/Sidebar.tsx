'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { 
  Wallet, 
  ArrowRightLeft, 
  User, 
  LogOut, 
  ShieldCheck,
  Users,
  Shield,
  X
} from 'lucide-react';

import styles from './sidebar.module.css';

const menuItems = [
  { icon: Wallet, label: 'Wallet', href: '/dashboard' },
  { icon: ArrowRightLeft, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: ShieldCheck, label: 'KYC', href: '/dashboard/kyc' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Shield, label: 'Role Management', href: '/dashboard/role-management' },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin && storedAdmin !== 'undefined') {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        console.error('Failed to parse admin_user', e);
      }
    }
  }, []);

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={close} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <div className={styles.logoSquare}></div>
              <div className={styles.logoSquare}></div>
              <div className={styles.logoSquare}></div>
              <div className={styles.logoSquare}></div>
            </div>
            <span className={styles.logoText}>FinAdmin</span>
          </div>
          <button className={styles.mobileClose} onClick={close}>
            <X size={24} />
          </button>
        </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{admin?.username?.substring(0, 2).toUpperCase() || 'AD'}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{admin?.role || 'Admin'}</p>
            <p className={styles.userEmail}>{admin?.username || 'admin@fintech.com'}</p>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}

