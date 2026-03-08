import { BusinessData } from '@/types/ledger';

const STORAGE_KEY = 'rony-enterprise-ledger';

export const defaultData: BusinessData = {
  businessName: 'Rony Enterprise',
  accounts: [
    { id: 'dbbl-madar', name: 'DBBL Madar', category: 'DBBL', balance: 25000, icon: 'Landmark' },
    { id: 'dbbl-personal', name: 'DBBL Personal', category: 'DBBL', balance: 18500, icon: 'Landmark' },
    { id: 'bkash-agent', name: 'bKash Agent', category: 'bKash', balance: 45000, icon: 'Smartphone' },
    { id: 'bkash-personal', name: 'bKash Personal', category: 'bKash', balance: 12000, icon: 'Smartphone' },
    { id: 'bkash-payment', name: 'bKash Payment', category: 'bKash', balance: 8500, icon: 'Smartphone' },
    { id: 'rocket-agent', name: 'Rocket Agent', category: 'Rocket', balance: 22000, icon: 'Zap' },
    { id: 'rocket-personal', name: 'Rocket Personal', category: 'Rocket', balance: 7500, icon: 'Zap' },
    { id: 'nagad-agent', name: 'Nagad Agent', category: 'Nagad', balance: 31000, icon: 'Wallet' },
    { id: 'nagad-personal', name: 'Nagad Personal', category: 'Nagad', balance: 9000, icon: 'Wallet' },
    { id: 'cash', name: 'Cash Balance', category: 'Cash', balance: 55000, icon: 'Banknote' },
  ],
  bakiList: [
    { id: 'b1', name: 'Jemi', amount: 3019, date: '2026-03-01', note: '', status: 'unpaid' },
    { id: 'b2', name: 'Salma Kaki', amount: 3518, date: '2026-03-02', note: '', status: 'unpaid' },
    { id: 'b3', name: 'Bakul Kaka', amount: 13000, date: '2026-02-15', note: '', status: 'unpaid' },
    { id: 'b4', name: 'Laki Kaka', amount: 15500, date: '2026-02-20', note: '', status: 'unpaid' },
    { id: 'b5', name: 'Tuhin Vai', amount: 12000, date: '2026-02-28', note: '', status: 'unpaid' },
    { id: 'b6', name: 'Baki TK', amount: 19342, date: '2026-03-05', note: '', status: 'unpaid' },
  ],
  jomaList: [
    { id: 'j1', name: 'Shohab Kaka', amount: 4700, date: '2026-03-01', note: '', status: 'pending' },
    { id: 'j2', name: 'Bill Joma', amount: 1550, date: '2026-03-03', note: '', status: 'pending' },
    { id: 'j3', name: 'Bill Joma', amount: 1786, date: '2026-03-05', note: '', status: 'pending' },
  ],
  transactions: [
    { id: 't1', type: 'income', accountId: 'bkash-agent', name: 'Daily Sales', amount: 15000, date: '2026-03-07', note: 'Shop sales' },
    { id: 't2', type: 'expense', accountId: 'cash', name: 'Rent Payment', amount: 8000, date: '2026-03-06', note: 'Monthly rent' },
    { id: 't3', type: 'transfer', accountId: 'bkash-agent', toAccountId: 'dbbl-madar', name: 'Transfer to DBBL', amount: 10000, date: '2026-03-05', note: '' },
    { id: 't4', type: 'income', accountId: 'nagad-agent', name: 'Commission', amount: 2500, date: '2026-03-04', note: 'Agent commission' },
    { id: 't5', type: 'expense', accountId: 'cash', name: 'Supplies', amount: 3200, date: '2026-03-03', note: 'Office supplies' },
  ],
};

export function loadData(): BusinessData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old data without status fields
      if (parsed.bakiList) {
        parsed.bakiList = parsed.bakiList.map((b: any) => ({ ...b, status: b.status || 'unpaid' }));
      }
      if (parsed.jomaList) {
        parsed.jomaList = parsed.jomaList.map((j: any) => ({ ...j, status: j.status || 'pending' }));
      }
      return parsed;
    }
  } catch {}
  return defaultData;
}

export function saveData(data: BusinessData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportToCSV(transactions: BusinessData['transactions'], accounts: BusinessData['accounts']): string {
  const headers = ['Date', 'Type', 'Name', 'Account', 'Amount', 'Note'];
  const rows = transactions.map(t => {
    const acc = accounts.find(a => a.id === t.accountId);
    return [t.date, t.type, t.name, acc?.name || '', t.amount.toString(), t.note];
  });
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
