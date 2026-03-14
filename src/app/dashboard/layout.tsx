'use client';

import Sidebar from '@/components/Sidebar/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';
import MobileNav from '@/components/Dashboard/MobileNav';
import styles from './dashboard_layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className={styles.layoutContainer}>
        <Sidebar />
        <div className={styles.mainWrapper}>
          <MobileNav />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
