import { useMemo } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Banknote, Activity } from 'lucide-react';

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 60%, 50%)'];

export default function ReportsPage() {
  const { data, totalIncome, totalExpense, totalBaki, totalJoma } = useLedger();

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    data.transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!months[month]) months[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') months[month].income += t.amount;
      if (t.type === 'expense') months[month].expense += t.amount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [data.transactions]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    data.accounts.forEach(a => { cats[a.category] = (cats[a.category] || 0) + a.balance; });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).filter(c => c.value > 0);
  }, [data.accounts]);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="pb-28 animate-fade-in">
      <PageHeader title="Reports" subtitle="Financial overview & analytics" />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mx-4 mb-5">
        <div className="glass-card-elevated p-3.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4.5 h-4.5 text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Income</p>
          <p className="text-sm font-bold text-success mt-0.5">{formatTaka(totalIncome)}</p>
        </div>
        <div className="glass-card-elevated p-3.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-2.5">
            <TrendingDown className="w-4.5 h-4.5 text-destructive" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Expense</p>
          <p className="text-sm font-bold text-destructive mt-0.5">{formatTaka(totalExpense)}</p>
        </div>
        <div className="glass-card-elevated p-3.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5">
            <Activity className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">Net</p>
          <p className={`text-sm font-bold mt-0.5 ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>{formatTaka(netBalance)}</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="mx-4 mb-5 p-5 rounded-2xl glass-card-elevated">
        <h3 className="text-sm font-bold text-foreground mb-4">Monthly Overview</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatTaka(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="income" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No transaction data yet</p>
        )}
      </div>

      {/* Pie Chart */}
      <div className="mx-4 mb-5 p-5 rounded-2xl glass-card-elevated">
        <h3 className="text-sm font-bold text-foreground mb-4">Balance by Category</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={150}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={32} strokeWidth={0}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground flex-1 font-medium">{c.name}</span>
                  <span className="text-xs font-bold text-foreground">{formatTaka(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No account data</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mx-4 space-y-2">
        {[
          { label: 'Total Accounts', value: String(data.accounts.length), color: 'text-foreground' },
          { label: 'Total Transactions', value: String(data.transactions.length), color: 'text-foreground' },
          { label: 'Baki Pabo (Unpaid)', value: formatTaka(totalBaki), color: 'text-primary' },
          { label: 'Joma Debo (Pending)', value: formatTaka(totalJoma), color: 'text-warning' },
        ].map((stat, i) => (
          <div key={stat.label} className="flex justify-between p-3.5 rounded-2xl glass-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
