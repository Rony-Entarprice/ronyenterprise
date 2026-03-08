import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, TrendingDown, Banknote, Landmark, Smartphone, Zap, Wallet as WalletIcon } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Landmark, Smartphone, Zap, Wallet: WalletIcon, Banknote,
};

const categoryColors: Record<string, string> = {
  DBBL: 'from-blue-500 to-blue-600',
  bKash: 'from-pink-500 to-pink-600',
  Rocket: 'from-purple-500 to-purple-600',
  Nagad: 'from-orange-500 to-orange-600',
  Cash: 'from-emerald-500 to-emerald-600',
};

function formatTaka(n: number) {
  return '৳' + n.toLocaleString('en-BD');
}

export default function Dashboard() {
  const { data, totalBalance, totalBaki, totalJoma, totalAccountBalance } = useLedger();

  return (
    <div className="pb-24">
      <PageHeader title={data.businessName} />

      {/* Total Balance Card */}
      <div className="mx-4 mb-4 p-5 rounded-2xl gradient-primary text-primary-foreground">
        <p className="text-sm opacity-80">Total Balance</p>
        <p className="text-3xl font-bold mt-1">{formatTaka(totalBalance)}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mx-4 mb-5">
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground">Total Pabo</p>
          <p className="text-sm font-bold text-foreground">{formatTaka(totalBaki)}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-[10px] text-muted-foreground">Total Debo</p>
          <p className="text-sm font-bold text-foreground">{formatTaka(totalJoma)}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
            <Banknote className="w-4 h-4 text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground">Cash</p>
          <p className="text-sm font-bold text-foreground">
            {formatTaka(data.accounts.find(a => a.id === 'cash')?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Account Balances */}
      <div className="mx-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Account Balances</h2>
        <div className="grid gap-2">
          {data.accounts.map(acc => {
            const Icon = iconMap[acc.icon] || WalletIcon;
            const gradient = categoryColors[acc.category] || 'from-gray-500 to-gray-600';
            return (
              <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{acc.category}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{formatTaka(acc.balance)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
