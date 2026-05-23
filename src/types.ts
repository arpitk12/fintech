export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: "Food & Dining" | "Shopping" | "Travel" | "Entertainment" | "Utilities" | "Groceries" | "Income" | "General/Other";
  cardLast4?: string;
  source: "gmail" | "manual" | "bank";
  status: "synced" | "pending_sync" | "cleared";
  currency?: string;
  emailId?: string; // Optional reference to scanned email
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface BillPaymentAlert {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  category: string;
  status: "upcoming" | "paid" | "overdue";
}

export interface Goal {
  id: string;
  name: string; // "HDFC Infinia Annual Waiver"
  cardName: string; // "HDFC Infinia (*4921)" or "All Cards"
  type: "annual_spend" | "quarterly_spend" | "monthly_spend" | "transaction_count";
  target: number; // Spend target (e.g., 300000) or threshold per transaction (e.g. 1000)
  targetCount?: number; // Target number of transactions, e.g. 5 (only for transaction_count type)
  current?: number; // Optionally stored, although we can also compute it on the fly
  deadline: string;
  rewardDescription: string; // "Annual fee ₹9,999 waived"
  completed?: boolean;
}

export interface SyncStatus {
  lastSyncedAt?: string;
  isSyncing: boolean;
  syncedReceiptsCount: number;
  offlineReady: boolean;
}

export interface CreditCardAccount {
  id: string;
  name: string;
  issuer: string;
  last4: string;
  gradient: string;
  theme: "dark" | "light";
  chipColor: string;
  accent: string;
  limit: number;
}

