import { useMemo } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Banknote } from 'lucide-react';

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

const COLORS = ['hsl(217, 91%, 50%)', 'hsl(145, 63%, 42%)', 'hsl(38, 92%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(280, 60%, 50%)'];

export default function ReportsPage() {
  const { data, totalIncome, totalExpense, totalBaki, totalJoma, totalAccountBalance } = useLedger();

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    data.transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!months[month]) months[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') months[month].income += t.amount;
      if (t.type === 'expense') months[month].expense += t.amount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [data.transactions]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    data.accounts.forEach(a => {
      cats[a.category] = (cats[a.category] || 0) + a.balance;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).filter(c => c.value > 0);
  }, [data.accounts]);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="pb-24">
      <PageHeader title="Reports" subtitle="Financial overview & analytics" />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mx-4 mb-5">
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground">Total Income</p>
          <p className="text-sm font-bold text-success">{formatTaka(totalIncome)}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-[10px] text-muted-foreground">Total Expense</p>
          <p className="text-sm font-bold text-destructive">{formatTaka(totalExpense)}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Banknote className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground">Net Balance</p>
          <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>{formatTaka(netBalance)}</p>
        </div>
      </div>

      {/* Monthly Income vs Expense Chart */}
      <div className="mx-4 mb-5 p-4 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Income vs Expense</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatTaka(v)} labelFormatter={l => `Month: ${l}`} />
              <Bar dataKey="income" fill="hsl(145, 63%, 42%)" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No transaction data yet</p>
        )}
      </div>

      {/* Account Distribution */}
      <div className="mx-4 mb-5 p-4 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Balance by Category</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatTaka(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground flex-1">{c.name}</span>
                  <span className="text-xs font-medium text-foreground">{formatTaka(c.value)}</span>
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
        <div className="flex justify-between p-3 rounded-xl bg-card border border-border">
          <span className="text-sm text-muted-foreground">Total Accounts</span>
          <span className="text-sm font-bold text-foreground">{data.accounts.length}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-card border border-border">
          <span className="text-sm text-muted-foreground">Total Transactions</span>
          <span className="text-sm font-bold text-foreground">{data.transactions.length}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-card border border-border">
          <span className="text-sm text-muted-foreground">Baki Pabo (Unpaid)</span>
          <span className="text-sm font-bold text-primary">{formatTaka(totalBaki)}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-card border border-border">
          <span className="text-sm text-muted-foreground">Joma Debo (Pending)</span>
          <span className="text-sm font-bold text-warning">{formatTaka(totalJoma)}</span>
        </div>
      </div>
    </div>
  );
}
