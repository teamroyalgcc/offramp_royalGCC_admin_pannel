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
  onUpdateStatus: (id: string, status: KYCStatus) => void;
}

export default function KYCModal({ request, isOpen, onClose, onUpdateStatus }: KYCModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<KYCStatus>(request?.status || 'pending');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    onUpdateStatus(request.id, selectedStatus);
    toast.success(`KYC Request #${request.id} has been ${selectedStatus}`);
    setIsConfirming(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>KYC Review</h2>
            <p className={styles.subtitle}>Request ID: #{request.id}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <User size={16} /> User Profile
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{request.userName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email Address</span>
                <span className={styles.value}>{request.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value}>{request.userId}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Submitted At</span>
                <span className={styles.value}>{new Date(request.submittedAt).toLocaleString()}</span>
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
            <div className={styles.documentGrid}>
              <div className={styles.documentCard}>
                <span className={styles.docLabel}>ID Card (Front)</span>
                <div className={styles.imagePlaceholder}>
                  <ImageIcon size={32} />
                  <span>Preview</span>
                </div>
                <button className={styles.viewButton}>View Fullsize</button>
              </div>
              <div className={styles.documentCard}>
                <span className={styles.docLabel}>ID Card (Back)</span>
                <div className={styles.imagePlaceholder}>
                  <ImageIcon size={32} />
                  <span>Preview</span>
                </div>
                <button className={styles.viewButton}>View Fullsize</button>
              </div>
              <div className={styles.documentCard}>
                <span className={styles.docLabel}>Selfie with ID</span>
                <div className={styles.imagePlaceholder}>
                  <ImageIcon size={32} />
                  <span>Preview</span>
                </div>
                <button className={styles.viewButton}>View Fullsize</button>
              </div>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.decisionSection}>
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
          </div>
        </div>

        <div className={styles.footer}>
          {!isConfirming ? (
            <>
              <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
              <button 
                className={styles.saveButton} 
                onClick={() => setIsConfirming(true)}
                disabled={selectedStatus === request.status}
              >
                Continue to Confirm
              </button>
            </>
          ) : (
            <div className={styles.confirmBox}>
              <p>Are you sure you want to <strong>{selectedStatus}</strong> this KYC?</p>
              <div className={styles.confirmActions}>
                <button className={styles.backButton} onClick={() => setIsConfirming(false)}>Back</button>
                <button className={styles.confirmButton} onClick={handleConfirm}>Confirm Decision</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
