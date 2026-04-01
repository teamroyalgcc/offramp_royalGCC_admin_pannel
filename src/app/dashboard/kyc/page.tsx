'use client';

import { useState, useEffect } from 'react';
import KYCTable from '@/components/KYC/KYCTable';
import KYCModal from '@/components/KYC/KYCModal';
import KYCMetrics from '@/components/KYC/KYCMetrics';
import { KYCRequest, KYCStatus } from '@/types';
import styles from '../transactions/dashboard.module.css';
import TableSkeleton from '@/components/Shared/TableSkeleton';

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

import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function KYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<KYCStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminService.listKyc();
        // Assume API returns kyc_status which needs to be mapped to pending/approved/rejected
        const mappedData = data.map((r: any) => ({
          ...r,
          id: r.id,
          userName: r.account_holder_name || 'Unknown',
          email: r.email || r.account_number || '', // email may be the phone number
          status: (r.kyc_status === 'submitted' || r.kyc_status === 'pending') ? 'pending' : r.kyc_status as KYCStatus,
          submittedAt: r.created_at || new Date().toISOString(),
          documents: {
             idCardFront: r.aadhaar_photo_url || r.aadhaar_image || ''
          },
          bankDetails: {
            bankName: 'N/A', // Usually resolved from IFSC if needed
            accountNumber: r.account_number || '',
            accountHolder: r.account_holder_name || '',
            ifscCode: r.ifsc_code || ''
          },
          aadhaarNumber: r.aadhaar_number,
          isBanned: r.is_banned,
          isFrozen: r.is_frozen,
          isAdmin: r.is_admin,
          accountStatus: r.account_status,
          referralCode: r.referral_code,
          referredBy: r.referred_by,
          verifiedAt: r.kyc_verified_at,
          rejectionReason: r.kyc_rejection_reason
        }));

        setRequests(mappedData);
      } catch (error: any) {
        toast.error('Failed to fetch KYC requests');
      } finally {
        setLoading(false);
      }
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

  const handleUpdateStatus = async (id: string, status: KYCStatus, reason: string = '') => {
    try {
      if (status === 'approved') {
        await adminService.approveKyc(id);
      } else if (status === 'rejected') {
        await adminService.rejectKyc(id, reason);
      }
      
      toast.success(`KYC ${id} ${status}`);
      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status } : r
      ));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update KYC status`);
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
        
        {loading ? (
          <TableSkeleton columns={7} />
        ) : (
          <KYCTable 
            data={filteredRequests} 
            onRowClick={handleRowClick} 
          />
        )}
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
