'use client';

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
  X
} from 'lucide-react';
import styles from './sidebar.module.css';

const menuItems = [
  { icon: Wallet, label: 'Wallet', href: '/dashboard' },
  { icon: ArrowRightLeft, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: ShieldCheck, label: 'KYC', href: '/dashboard/kyc' },
  { icon: Users, label: 'Role Management', href: '/dashboard/role-management' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

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
        <Link href="/dashboard/profile" className={styles.userProfile} onClick={close}>
          <div className={styles.avatar}>AD</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>Admin User</p>
            <p className={styles.userEmail}>admin@fintech.com</p>
          </div>
        </Link>
        <button className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
