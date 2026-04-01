import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import styles from './mobile_nav.module.css';

export default function MobileNav() {
  const { toggle } = useSidebar();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Wallet';
    if (path === '/dashboard/transactions') return 'Transactions';
    if (path === '/dashboard/kyc') return 'KYC Review';
    if (path === '/dashboard/role-management') return 'Role Management';
    if (path === '/dashboard/profile') return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className={styles.mobileNav}>
      <div className={styles.logoGroup}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        <div>
          <span className={styles.mobileLogoText}>Admin Portal</span>
          <p className={styles.pageTitle}>{getPageTitle(pathname)}</p>
        </div>
      </div>
      
      <button className={styles.toggleButton} onClick={toggle} aria-label="Toggle Menu">
        <Menu size={20} />
      </button>
    </div>
  );
}
