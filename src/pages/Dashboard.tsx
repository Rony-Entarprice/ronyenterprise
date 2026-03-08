import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, TrendingDown, Banknote, Landmark, Smartphone, Zap, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ElementType> = {
  Landmark, Smartphone, Zap, Wallet: WalletIcon, Banknote,
};

const categoryGradients: Record<string, string> = {
  DBBL: 'from-blue-500 to-blue-600',
  bKash: 'from-pink-500 to-rose-600',
  Rocket: 'from-violet-500 to-purple-600',
  Nagad: 'from-orange-500 to-amber-600',
  Cash: 'from-emerald-500 to-green-600',
  bank: 'from-blue-500 to-blue-600',
  mobile_banking: 'from-pink-500 to-rose-600',
  cash: 'from-emerald-500 to-green-600',
};

function formatTaka(n: number) {
  return '৳' + n.toLocaleString('en-BD');
}

export default function Dashboard() {
  const { businessName, accounts, transactions, totalBalance, totalBaki, totalJoma, totalIncome, totalExpense, loading } = useLedger();
  const [showBalance, setShowBalance] = useState(true);

  const recentTxs = transactions.slice(0, 4);
  const cashBalance = accounts.find(a => a.account_type === 'cash')?.balance || 0;

  if (loading) {
    return (
      <div className="pb-24 animate-fade-in">
        <PageHeader title={businessName} showSettings />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title={businessName} showSettings />

      {/* Hero Balance Card */}
      <div className="mx-4 mb-5">
        <div className="gradient-card-blue rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-12 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute left-8 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-white/70">Total Business Balance</p>
              <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-3xl font-extrabold tracking-tight mb-4">
              {showBalance ? formatTaka(totalBalance) : '৳ • • • • •'}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowDownLeft className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-[9px] text-white/60">Income</p>
                  <p className="text-xs font-semibold">{formatTaka(totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-[9px] text-white/60">Expense</p>
                  <p className="text-xs font-semibold">{formatTaka(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3 mx-4 mb-6">
        <div className="glass-card-elevated p-3.5 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Total Pabo</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatTaka(totalBaki)}</p>
        </div>
        <div className="glass-card-elevated p-3.5 rounded-2xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-2.5">
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Total Debo</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatTaka(totalJoma)}</p>
        </div>
        <div className="glass-card-elevated p-3.5 rounded-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-2.5">
            <Banknote className="w-4 h-4 text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Cash</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatTaka(cashBalance)}</p>
        </div>
      </div>

      {/* Account Balances */}
      <div className="mx-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">My Accounts</h2>
          <Link to="/accounts" className="text-xs font-medium text-primary hover:underline">View All</Link>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No accounts yet. Add one from Accounts page.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {accounts.map((acc, i) => {
              const Icon = iconMap[acc.icon] || WalletIcon;
              const gradient = categoryGradients[acc.provider] || categoryGradients[acc.account_type] || 'from-gray-500 to-gray-600';
              return (
                <div key={acc.id} className="min-w-[140px] glass-card-elevated p-4 rounded-2xl shrink-0 animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">{acc.account_name}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formatTaka(acc.balance)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="mx-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs font-medium text-primary hover:underline">See All</Link>
        </div>
        <div className="space-y-2">
          {recentTxs.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No transactions yet</p>}
          {recentTxs.map((tx, i) => {
            const acc = accounts.find(a => a.id === tx.account_id);
            const isIncome = tx.transaction_type === 'income';
            const isExpense = tx.transaction_type === 'expense';
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-2xl glass-card animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isIncome ? 'bg-success/10' : isExpense ? 'bg-destructive/10' : 'bg-muted'}`}>
                  {isIncome ? <ArrowDownLeft className="w-5 h-5 text-success" /> : isExpense ? <ArrowUpRight className="w-5 h-5 text-destructive" /> : <Banknote className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tx.reference_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{acc?.account_name || tx.transaction_type} • {tx.transaction_date}</p>
                </div>
                <p className={`text-sm font-bold ${isIncome ? 'text-success' : isExpense ? 'text-destructive' : 'text-foreground'}`}>
                  {isIncome ? '+' : isExpense ? '-' : ''}{formatTaka(tx.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
