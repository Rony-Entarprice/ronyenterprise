import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BusinessData, Account, BakiEntry, JomaEntry, Transaction, TransactionType } from '@/types/ledger';
import { loadData, saveData, generateId } from '@/lib/data';

interface LedgerContextType {
  data: BusinessData;
  totalBalance: number;
  totalBaki: number;
  totalJoma: number;
  totalAccountBalance: number;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addBaki: (b: Omit<BakiEntry, 'id'>) => void;
  addJoma: (j: Omit<JomaEntry, 'id'>) => void;
  editBaki: (id: string, updates: Partial<Omit<BakiEntry, 'id'>>) => void;
  editJoma: (id: string, updates: Partial<Omit<JomaEntry, 'id'>>) => void;
  deleteBaki: (id: string) => void;
  deleteJoma: (id: string) => void;
  updateAccountBalance: (id: string, amount: number) => void;
  setBusinessName: (name: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  editAccount: (id: string, updates: Partial<Omit<Account, 'id'>>) => void;
  deleteAccount: (id: string) => void;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BusinessData>(loadData);

  useEffect(() => { saveData(data); }, [data]);

  const totalAccountBalance = data.accounts.reduce((s, a) => s + a.balance, 0);
  const totalBaki = data.bakiList.reduce((s, b) => s + b.amount, 0);
  const totalJoma = data.jomaList.reduce((s, j) => s + j.amount, 0);
  const totalBalance = totalAccountBalance + totalBaki - totalJoma;

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setData(prev => {
      const newTx = { ...t, id: generateId() };
      const accounts = [...prev.accounts];
      const idx = accounts.findIndex(a => a.id === t.accountId);
      if (idx >= 0) {
        if (t.type === 'income') accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance + t.amount };
        if (t.type === 'expense') accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance - t.amount };
        if (t.type === 'transfer') {
          accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance - t.amount };
          const toIdx = accounts.findIndex(a => a.id === t.toAccountId);
          if (toIdx >= 0) accounts[toIdx] = { ...accounts[toIdx], balance: accounts[toIdx].balance + t.amount };
        }
      }
      return { ...prev, accounts, transactions: [newTx, ...prev.transactions] };
    });
  }, []);

  const addBaki = useCallback((b: Omit<BakiEntry, 'id'>) => {
    setData(prev => ({ ...prev, bakiList: [{ ...b, id: generateId() }, ...prev.bakiList] }));
  }, []);

  const addJoma = useCallback((j: Omit<JomaEntry, 'id'>) => {
    setData(prev => ({ ...prev, jomaList: [{ ...j, id: generateId() }, ...prev.jomaList] }));
  }, []);

  const editBaki = useCallback((id: string, updates: Partial<Omit<BakiEntry, 'id'>>) => {
    setData(prev => ({ ...prev, bakiList: prev.bakiList.map(b => b.id === id ? { ...b, ...updates } : b) }));
  }, []);

  const editJoma = useCallback((id: string, updates: Partial<Omit<JomaEntry, 'id'>>) => {
    setData(prev => ({ ...prev, jomaList: prev.jomaList.map(j => j.id === id ? { ...j, ...updates } : j) }));
  }, []);

  const deleteBaki = useCallback((id: string) => {
    setData(prev => ({ ...prev, bakiList: prev.bakiList.filter(b => b.id !== id) }));
  }, []);

  const deleteJoma = useCallback((id: string) => {
    setData(prev => ({ ...prev, jomaList: prev.jomaList.filter(j => j.id !== id) }));
  }, []);

  const updateAccountBalance = useCallback((id: string, amount: number) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, balance: amount } : a),
    }));
  }, []);

  const setBusinessName = useCallback((name: string) => {
    setData(prev => ({ ...prev, businessName: name }));
  }, []);

  const addAccount = useCallback((a: Omit<Account, 'id'>) => {
    setData(prev => ({ ...prev, accounts: [...prev.accounts, { ...a, id: generateId() }] }));
  }, []);

  const editAccount = useCallback((id: string, updates: Partial<Omit<Account, 'id'>>) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  }, []);

  return (
    <LedgerContext.Provider value={{
      data, totalBalance, totalBaki, totalJoma, totalAccountBalance,
      addTransaction, addBaki, addJoma, deleteBaki, deleteJoma,
      updateAccountBalance, setBusinessName, addAccount, editAccount, deleteAccount,
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
