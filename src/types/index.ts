export type TransactionStatus = 'pending' | 'success' | 'failed' | 'processing';
export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'submitted';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  ifscCode: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  inr_amount?: number;
  rate?: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'exchange';
  status: TransactionStatus;
  createdAt: string;
  bankDetails?: BankDetails;
}

export interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: KYCStatus;
  submittedAt: string;
  documents: {
    idCardFront?: string;
  };
  bankDetails: BankDetails;
  aadhaarNumber?: string;
  isBanned?: boolean;
  isFrozen?: boolean;
  isAdmin?: boolean;
  accountStatus?: string;
  referralCode?: string;
  referredBy?: string | null;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}
