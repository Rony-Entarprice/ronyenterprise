import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Account {
  id: string;
  account_name: string;
  account_type: string;
  provider: string;
  balance: number;
  icon: string;
  business_id: string;
}

interface BakiEntry {
  id: string;
  person_name: string;
  amount: number;
  date: string;
  note: string;
  status: string;
  business_id: string;
}

interface JomaEntry {
  id: string;
  person_name: string;
  amount: number;
  date: string;
  note: string;
  status: string;
  business_id: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  account_id: string | null;
  to_account_id: string | null;
  reference_name: string;
  amount: number;
  transaction_date: string;
  note: string;
  business_id: string;
}

interface LedgerContextType {
  businessId: string | null;
  businessName: string;
  accounts: Account[];
  bakiList: BakiEntry[];
  jomaList: JomaEntry[];
  transactions: Transaction[];
  totalBalance: number;
  totalBaki: number;
  totalJoma: number;
  totalAccountBalance: number;
  totalIncome: number;
  totalExpense: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'business_id'>) => Promise<void>;
  addBaki: (b: { person_name: string; amount: number; date: string; note: string; status: string }) => Promise<void>;
  addJoma: (j: { person_name: string; amount: number; date: string; note: string; status: string }) => Promise<void>;
  editBaki: (id: string, updates: Partial<BakiEntry>) => Promise<void>;
  editJoma: (id: string, updates: Partial<JomaEntry>) => Promise<void>;
  deleteBaki: (id: string) => Promise<void>;
  deleteJoma: (id: string) => Promise<void>;
  toggleBakiStatus: (id: string) => Promise<void>;
  toggleJomaStatus: (id: string) => Promise<void>;
  addAccount: (a: { account_name: string; account_type: string; provider: string; balance: number; icon: string }) => Promise<void>;
  editAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setBusinessName: (name: string) => Promise<void>;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessNameState] = useState('Rony Enterprise');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [bakiList, setBakiList] = useState<BakiEntry[]>([]);
  const [jomaList, setJomaList] = useState<JomaEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const totalAccountBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalBaki = bakiList.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.amount, 0);
  const totalJoma = jomaList.filter(j => j.status === 'pending').reduce((s, j) => s + j.amount, 0);
  const totalBalance = totalAccountBalance + totalBaki - totalJoma;
  const totalIncome = transactions.filter(t => t.transaction_type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get business
    const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).limit(1).single();
    if (biz) {
      setBusinessId(biz.id);
      setBusinessNameState(biz.business_name);

      const [accRes, bakiRes, jomaRes, txRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('business_id', biz.id).order('created_at'),
        supabase.from('baki_pabo').select('*').eq('business_id', biz.id).order('created_at', { ascending: false }),
        supabase.from('joma_debo').select('*').eq('business_id', biz.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('business_id', biz.id).order('created_at', { ascending: false }),
      ]);

      setAccounts(accRes.data || []);
      setBakiList(bakiRes.data || []);
      setJomaList(jomaRes.data || []);
      setTransactions(txRes.data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id' | 'business_id'>) => {
    if (!businessId) return;
    
    // Update account balances
    if (t.account_id) {
      if (t.transaction_type === 'income') {
        await supabase.from('accounts').update({ balance: accounts.find(a => a.id === t.account_id)!.balance + t.amount }).eq('id', t.account_id);
      }
      if (t.transaction_type === 'expense') {
        await supabase.from('accounts').update({ balance: accounts.find(a => a.id === t.account_id)!.balance - t.amount }).eq('id', t.account_id);
      }
      if (t.transaction_type === 'transfer' && t.to_account_id) {
        await supabase.from('accounts').update({ balance: accounts.find(a => a.id === t.account_id)!.balance - t.amount }).eq('id', t.account_id);
        await supabase.from('accounts').update({ balance: accounts.find(a => a.id === t.to_account_id)!.balance + t.amount }).eq('id', t.to_account_id);
      }
    }

    await supabase.from('transactions').insert({ ...t, business_id: businessId });
    await refresh();
  }, [businessId, accounts, refresh]);

  const addBaki = useCallback(async (b: { person_name: string; amount: number; date: string; note: string; status: string }) => {
    if (!businessId) return;
    await supabase.from('baki_pabo').insert({ ...b, business_id: businessId });
    await refresh();
  }, [businessId, refresh]);

  const addJoma = useCallback(async (j: { person_name: string; amount: number; date: string; note: string; status: string }) => {
    if (!businessId) return;
    await supabase.from('joma_debo').insert({ ...j, business_id: businessId });
    await refresh();
  }, [businessId, refresh]);

  const editBaki = useCallback(async (id: string, updates: Partial<BakiEntry>) => {
    await supabase.from('baki_pabo').update(updates).eq('id', id);
    await refresh();
  }, [refresh]);

  const editJoma = useCallback(async (id: string, updates: Partial<JomaEntry>) => {
    await supabase.from('joma_debo').update(updates).eq('id', id);
    await refresh();
  }, [refresh]);

  const deleteBaki = useCallback(async (id: string) => {
    await supabase.from('baki_pabo').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  const deleteJoma = useCallback(async (id: string) => {
    await supabase.from('joma_debo').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  const toggleBakiStatus = useCallback(async (id: string) => {
    const item = bakiList.find(b => b.id === id);
    if (item) {
      await supabase.from('baki_pabo').update({ status: item.status === 'unpaid' ? 'paid' : 'unpaid' }).eq('id', id);
      await refresh();
    }
  }, [bakiList, refresh]);

  const toggleJomaStatus = useCallback(async (id: string) => {
    const item = jomaList.find(j => j.id === id);
    if (item) {
      await supabase.from('joma_debo').update({ status: item.status === 'pending' ? 'returned' : 'pending' }).eq('id', id);
      await refresh();
    }
  }, [jomaList, refresh]);

  const addAccount = useCallback(async (a: { account_name: string; account_type: string; provider: string; balance: number; icon: string }) => {
    if (!businessId) return;
    await supabase.from('accounts').insert({ ...a, business_id: businessId });
    await refresh();
  }, [businessId, refresh]);

  const editAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    const { business_id, id: _, ...clean } = updates as any;
    await supabase.from('accounts').update(clean).eq('id', id);
    await refresh();
  }, [refresh]);

  const deleteAccount = useCallback(async (id: string) => {
    await supabase.from('accounts').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  const setBusinessName = useCallback(async (name: string) => {
    if (!businessId) return;
    await supabase.from('businesses').update({ business_name: name }).eq('id', businessId);
    setBusinessNameState(name);
  }, [businessId]);

  return (
    <LedgerContext.Provider value={{
      businessId, businessName, accounts, bakiList, jomaList, transactions,
      totalBalance, totalBaki, totalJoma, totalAccountBalance, totalIncome, totalExpense, loading,
      refresh, addTransaction, addBaki, addJoma, editBaki, editJoma, deleteBaki, deleteJoma,
      toggleBakiStatus, toggleJomaStatus, addAccount, editAccount, deleteAccount, setBusinessName,
    }}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider');
  return ctx;
}
