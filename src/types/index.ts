export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionType = 'withdraw' | 'transfer' | 'deposit';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    ifscCode?: string;
    swiftCode?: string;
  };
  proofUrl?: string;
}

export interface Metrics {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  totalVolume: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: string;
  userName: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: KYCStatus;
  documents: {
    idCardFront: string;
    idCardBack: string;
    selfie: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    ifscCode: string;
  };
}
