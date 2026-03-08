import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Users, HandCoins, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  income: { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' },
  expense: { icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-destructive/10' },
  transfer: { icon: ArrowLeftRight, color: 'text-primary', bg: 'bg-primary/10' },
  baki_entry: { icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  joma_entry: { icon: HandCoins, color: 'text-warning', bg: 'bg-warning/10' },
};

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

type Filter = 'all' | 'income' | 'expense' | 'transfer';

export default function TransactionsPage() {
  const { transactions, accounts, loading } = useLedger();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'transfer', label: 'Transfer' },
  ];

  const filtered = transactions
    .filter(t => filter === 'all' || t.transaction_type === filter)
    .filter(t => !search || t.reference_name.toLowerCase().includes(search.toLowerCase()) || t.note.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Name', 'Account', 'Amount', 'Note'];
    const rows = transactions.map(t => {
      const acc = accounts.find(a => a.id === t.account_id);
      return [t.transaction_date, t.transaction_type, t.reference_name, acc?.account_name || '', t.amount.toString(), t.note];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-28 animate-fade-in">
      <PageHeader title="Transactions" subtitle="All transaction history" />

      <div className="mx-4 mb-3 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl bg-card border-border/50" />
      </div>

      <div className="mx-4 mb-4 flex items-center gap-2">
        <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${filter === f.value ? 'gradient-primary text-white shadow-sm' : 'bg-card text-muted-foreground border border-border/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="p-2.5 rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
      </div>

      <div className="mx-4 space-y-2">
        {loading ? <p className="text-center text-sm text-muted-foreground py-12">Loading...</p> :
          filtered.length === 0 ? <p className="text-center text-sm text-muted-foreground py-12">No transactions found</p> : null}
        {filtered.map((tx, i) => {
          const cfg = typeConfig[tx.transaction_type] || typeConfig.income;
          const Icon = cfg.icon;
          const acc = accounts.find(a => a.id === tx.account_id);
          return (
            <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-2xl glass-card animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{tx.reference_name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{acc?.account_name || ''} • {tx.transaction_date}</p>
              </div>
              <p className={`text-sm font-bold ${tx.transaction_type === 'income' ? 'text-success' : tx.transaction_type === 'expense' ? 'text-destructive' : 'text-foreground'}`}>
                {tx.transaction_type === 'income' ? '+' : tx.transaction_type === 'expense' ? '-' : ''}{formatTaka(tx.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
