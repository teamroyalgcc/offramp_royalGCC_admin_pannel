'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink, User, Building2, FileText, Image as ImageIcon, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import styles from './modal.module.css';
import { KYCRequest, KYCStatus } from '@/types';
import CustomSelect from '@/components/Shared/CustomSelect';

interface KYCModalProps {
  request: KYCRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: KYCStatus, reason?: string) => void;
}

export default function KYCModal({ request, isOpen, onClose, onUpdateStatus }: KYCModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<KYCStatus>(request?.status || 'pending');
  const [isConfirming, setIsConfirming] = useState(false);
  const [reason, setReason] = useState('');

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    onUpdateStatus(request.id, selectedStatus, reason);
    setIsConfirming(false);
    onClose();
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>KYC Review</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <p className={styles.subtitle}>Request ID: #{request.id}</p>
              {request.isBanned && (
                <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Banned</span>
              )}
              {request.isFrozen && (
                <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Frozen</span>
              )}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.layoutContainer}>
            {/* Main Info Section */}
            <div className={styles.mainInfo}>
              {request.rejectionReason && request.status === 'rejected' && (
                <div className={styles.section} style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                   <h3 className={styles.sectionTitle} style={{ color: '#ef4444', marginBottom: '8px' }}>
                     <AlertCircle size={16} /> Rejection Reason
                   </h3>
                   <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>{request.rejectionReason}</p>
                </div>
              )}

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <User size={16} /> User Profile
                </h3>
                <div className={styles.bankCard}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Full Name</span>
                    <span className={styles.value}>{request.userName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Email Address</span>
                    <span className={styles.value}>{request.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Aadhaar Number</span>
                    <span className={styles.value}>{request.aadhaarNumber || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Submitted At</span>
                    <span className={styles.value}>{formatDate(request.submittedAt)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Is Admin</span>
                    <span className={styles.value}>{request.isAdmin ? 'Yes' : 'No'}</span>
                  </div>
                  {request.verifiedAt && (
                    <div className={styles.infoItem}>
                       <span className={styles.label}>Verified At</span>
                       <span className={styles.value}>{formatDate(request.verifiedAt)}</span>
                    </div>
                  )}
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Referral Code</span>
                    <span className={styles.value}>{request.referralCode || 'None'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Referred By</span>
                    <span className={styles.value}>{request.referredBy || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <Building2 size={16} /> Bank Information
                </h3>
                <div className={styles.bankCard}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Bank Name</span>
                    <span className={styles.value}>{request.bankDetails.bankName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Account Number</span>
                    <span className={styles.value}>{request.bankDetails.accountNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Account Holder</span>
                    <span className={styles.value}>{request.bankDetails.accountHolder}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>IFSC Code</span>
                    <span className={styles.value}>{request.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FileText size={16} /> Identity Documents
                </h3>
                <div className={styles.documentGrid} style={{ gridTemplateColumns: '1fr' }}>
                  <div className={styles.documentCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.docLabel}>Aadhaar Photo</span>
                      {request.documents?.idCardFront && (
                        <button className={styles.viewButton} onClick={() => window.open(request.documents.idCardFront, '_blank')}>View Fullsize <ExternalLink size={12} /></button>
                      )}
                    </div>
                    {request.documents?.idCardFront ? (
                      <div style={{ width: '100%', height: '240px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={request.documents.idCardFront} alt="Aadhaar" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div className={styles.imagePlaceholder} style={{ height: '200px' }}>
                        <ImageIcon size={48} />
                        <span>No Photo Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className={styles.sidebar}>
              <div className={styles.stickyContainer}>
                <div className={styles.decisionSection}>
                  <h3 className={styles.sectionTitle} style={{ color: '#4c1d95', marginBottom: '16px' }}>
                    <ClipboardCheck size={16} /> Process KYC
                  </h3>
                  <CustomSelect
                    label="KYC Decision"
                    value={selectedStatus}
                    onChange={(val) => setSelectedStatus(val as KYCStatus)}
                    options={[
                      { label: 'Keep Pending', value: 'pending' },
                      { label: 'Approve KYC', value: 'approved' },
                      { label: 'Reject KYC', value: 'rejected' },
                    ]}
                    icon={ClipboardCheck}
                  />
                  {selectedStatus === 'rejected' && (
                    <div className={styles.reasonSection} style={{ marginTop: '16px' }}>
                      <label className={styles.reasonLabel}>Rejection Reason</label>
                      <textarea
                        className={styles.reasonInput}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Identity document is unreadable"
                        required
                        rows={4}
                      />
                    </div>
                  )}
                  
                  <div style={{ marginTop: '24px' }}>
                    {!isConfirming ? (
                      <button 
                        className={styles.primaryActionButton} 
                        onClick={() => setIsConfirming(true)}
                        disabled={selectedStatus === request.status}
                      >
                        {selectedStatus === 'approved' ? 'Approve Account' : selectedStatus === 'rejected' ? 'Reject Application' : 'Save Changes'}
                      </button>
                    ) : (
                      <div className={styles.confirmInline}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px', textAlign: 'center' }}>
                          Are you sure you want to <strong>{selectedStatus}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className={styles.backButtonMini} onClick={() => setIsConfirming(false)}>Back</button>
                          <button className={styles.confirmButtonMini} onClick={handleConfirm}>Confirm</button>
                        </div>
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '12px' }}>
                      Updates will be reflected immediately after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
