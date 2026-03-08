import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Users, HandCoins, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TransactionType } from '@/types/ledger';
import { exportToCSV } from '@/lib/data';

const typeConfig: Record<TransactionType, { icon: React.ElementType; color: string; bg: string }> = {
  income: { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' },
  expense: { icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-destructive/10' },
  transfer: { icon: ArrowLeftRight, color: 'text-muted-foreground', bg: 'bg-muted' },
  baki: { icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  joma: { icon: HandCoins, color: 'text-warning', bg: 'bg-warning/10' },
};

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

type Filter = 'all' | TransactionType;

export default function TransactionsPage() {
  const { data } = useLedger();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'transfer', label: 'Transfer' },
  ];

  const filtered = data.transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.note.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    const csv = exportToCSV(data.transactions, data.accounts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24">
      <PageHeader title="Transactions" subtitle="All transaction history" />

      {/* Search */}
      <div className="mx-4 mb-3 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters + Export */}
      <div className="mx-4 mb-4 flex items-center gap-2">
        <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Transaction List */}
      <div className="mx-4 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No transactions found</p>
        )}
        {filtered.map(tx => {
          const cfg = typeConfig[tx.type];
          const Icon = cfg.icon;
          const acc = data.accounts.find(a => a.id === tx.accountId);
          return (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                <p className="text-[10px] text-muted-foreground">{acc?.name || ''} • {tx.date}</p>
              </div>
              <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-success' : tx.type === 'expense' ? 'text-destructive' : 'text-foreground'}`}>
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatTaka(tx.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
