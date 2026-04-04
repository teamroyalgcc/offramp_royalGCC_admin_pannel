export type TransactionStatus = 'pending' | 'success' | 'failed' | 'processing' | 'stuck' | 'confirmed' | 'approved' | 'refunded';
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
  userEmail?: string;
  amount: number;
  inr_amount?: number;
  rate?: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'exchange';
  status: TransactionStatus;
  createdAt: string;
  bankDetails?: BankDetails;
  gatewayRefId?: string | null;
  failureReason?: string | null;
}

export interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  status: KYCStatus;
  submittedAt: string;
  documents: {
    idCardFront?: string;
  };
  bankDetails?: BankDetails;
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
  role: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  currency: string;
  pair: string;
  rate: number;
  updatedAt: string;
  updatedBy?: string;
}
