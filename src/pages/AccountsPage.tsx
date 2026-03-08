import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Landmark, Smartphone, Zap, Wallet as WalletIcon, Banknote } from 'lucide-react';

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

export default function AccountsPage() {
  const { data, totalAccountBalance } = useLedger();

  const grouped = data.accounts.reduce<Record<string, typeof data.accounts>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <PageHeader title="Accounts" subtitle="All financial accounts" />

      <div className="mx-4 mb-4 p-4 rounded-2xl gradient-primary text-primary-foreground">
        <p className="text-sm opacity-80">Total Account Balance</p>
        <p className="text-2xl font-bold mt-1">{formatTaka(totalAccountBalance)}</p>
      </div>

      <div className="mx-4 space-y-4">
        {Object.entries(grouped).map(([category, accounts]) => {
          const gradient = categoryColors[category] || 'from-gray-500 to-gray-600';
          const total = accounts.reduce((s, a) => s + a.balance, 0);
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                <span className="text-xs font-medium text-muted-foreground">{formatTaka(total)}</span>
              </div>
              <div className="space-y-2">
                {accounts.map(acc => {
                  const Icon = iconMap[acc.icon] || WalletIcon;
                  return (
                    <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{acc.name}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{formatTaka(acc.balance)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
