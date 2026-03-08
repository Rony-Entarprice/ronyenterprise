export interface Account {
  id: string;
  name: string;
  category: string;
  balance: number;
  icon: string;
}

export type BakiStatus = 'unpaid' | 'paid';
export type JomaStatus = 'pending' | 'returned';

export interface BakiEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  note: string;
  status: BakiStatus;
}

export interface JomaEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  note: string;
  status: JomaStatus;
}

export type TransactionType = 'income' | 'expense' | 'baki' | 'joma' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  name: string;
  amount: number;
  date: string;
  note: string;
}

export interface BusinessData {
  businessName: string;
  accounts: Account[];
  bakiList: BakiEntry[];
  jomaList: JomaEntry[];
  transactions: Transaction[];
}
