import type {
  ExpenseCategory,
  PaymentMode,
  TransactionCategory,
  TransactionType,
} from '@/constants/finance';

export interface Profile {
  user_id: string;
  full_name: string;
  monthly_allowance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  payment_mode: PaymentMode;
  note: string;
  txn_date: string;
  created_at: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  payment_mode: PaymentMode;
  note: string;
  txn_date: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  monthly_limit: number;
  created_at: string;
}
