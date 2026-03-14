'use client';

import { useState, useEffect } from 'react';
import KYCTable from '@/components/KYC/KYCTable';
import KYCModal from '@/components/KYC/KYCModal';
import KYCMetrics from '@/components/KYC/KYCMetrics';
import { KYCRequest, KYCStatus } from '@/types';
import styles from '../transactions/dashboard.module.css';

// ... (generateMockKYCRequests follows)

// Mock data generator for KYC
const generateMockKYCRequests = (count: number): KYCRequest[] => {
  const statuses: KYCStatus[] = ['pending', 'approved', 'rejected'];
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Michael Brown', 'Emily Davis'];

  return Array.from({ length: count }, (_, i) => ({
    id: `KYC${2000 + i}`,
    userId: `USR${500 + i}`,
    userName: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
    submittedAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
    status: statuses[i % statuses.length],
    documents: {
      idCardFront: 'id_front.jpg',
      idCardBack: 'id_back.jpg',
      selfie: 'selfie.jpg',
    },
    bankDetails: {
      bankName: 'Global Bank',
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      accountHolder: names[i % names.length],
      ifscCode: 'GLOB0001234',
    }
  }));
};

export default function KYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<KYCStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch KYC requests
    const fetchData = async () => {
      const mockData = generateMockKYCRequests(15);
      setRequests(mockData);
    };
    fetchData();
  }, []);

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const handleRowClick = (request: KYCRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: KYCStatus) => {
    try {
      console.log(`Updating KYC ${id} to ${status}`);
      // In reality: await api.patch(`/kyc/${id}`, { status });
      
      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status } : r
      ));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>KYC Management</h1>
          <p className={styles.subtitle}>Review and manage user identity verifications</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            Refresh Lists
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <KYCMetrics 
          requests={requests} 
          activeFilter={statusFilter} 
          onFilterChange={setStatusFilter} 
        />
        
        <KYCTable 
          data={filteredRequests} 
          onRowClick={handleRowClick} 
        />
      </section>

      <KYCModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </main>
  );
}
