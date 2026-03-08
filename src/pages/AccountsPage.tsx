import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Landmark, Smartphone, Zap, Wallet as WalletIcon, Banknote, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types/ledger';

const iconMap: Record<string, React.ElementType> = {
  Landmark, Smartphone, Zap, Wallet: WalletIcon, Banknote,
};

const iconOptions = [
  { value: 'Landmark', label: '🏦 Bank' },
  { value: 'Smartphone', label: '📱 Mobile' },
  { value: 'Zap', label: '⚡ Digital' },
  { value: 'Wallet', label: '👛 Wallet' },
  { value: 'Banknote', label: '💵 Cash' },
];

const categoryOptions = ['DBBL', 'bKash', 'Rocket', 'Nagad', 'Cash', 'Other'];

const categoryGradients: Record<string, string> = {
  DBBL: 'from-blue-500 to-blue-600',
  bKash: 'from-pink-500 to-rose-600',
  Rocket: 'from-violet-500 to-purple-600',
  Nagad: 'from-orange-500 to-amber-600',
  Cash: 'from-emerald-500 to-green-600',
  Other: 'from-gray-500 to-gray-600',
};

function formatTaka(n: number) {
  return '৳' + n.toLocaleString('en-BD');
}

const emptyForm = { name: '', category: 'DBBL', balance: 0, icon: 'Landmark' };

export default function AccountsPage() {
  const { data, totalAccountBalance, addAccount, editAccount, deleteAccount } = useLedger();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (acc: Account) => { setEditingId(acc.id); setForm({ name: acc.name, category: acc.category, balance: acc.balance, icon: acc.icon }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) editAccount(editingId, form);
    else addAccount(form);
    setDialogOpen(false);
  };

  const handleDelete = () => { if (deleteId) { deleteAccount(deleteId); setDeleteId(null); } };

  const grouped = data.accounts.reduce<Record<string, Account[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-28 animate-fade-in">
      <PageHeader title="Accounts" subtitle="All financial accounts" />

      <div className="mx-4 mb-5 flex items-center gap-3">
        <div className="flex-1 gradient-card-blue rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-xs font-medium text-white/70">Total Account Balance</p>
          <p className="text-2xl font-extrabold mt-1 relative z-10">{formatTaka(totalAccountBalance)}</p>
          <p className="text-[10px] text-white/60 mt-1">{data.accounts.length} accounts</p>
        </div>
        <button onClick={openAdd} className="w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform shrink-0">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="mx-4 space-y-5">
        {Object.entries(grouped).map(([category, accounts]) => {
          const gradient = categoryGradients[category] || 'from-gray-500 to-gray-600';
          const total = accounts.reduce((s, a) => s + a.balance, 0);
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{category}</h3>
                <span className="text-xs font-semibold text-muted-foreground">{formatTaka(total)}</span>
              </div>
              <div className="space-y-2">
                {accounts.map((acc, i) => {
                  const Icon = iconMap[acc.icon] || WalletIcon;
                  return (
                    <div key={acc.id} className="flex items-center gap-3 p-3.5 rounded-2xl glass-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{acc.name}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground mr-1">{formatTaka(acc.balance)}</p>
                      <button onClick={() => openEdit(acc)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(acc.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingId ? 'Edit Account' : 'New Account'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Account Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. bKash Personal" className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Balance</Label>
              <Input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))} className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Icon</Label>
              <Select value={form.icon} onValueChange={v => setForm(f => ({ ...f, icon: v }))}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{iconOptions.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full h-11 rounded-xl gradient-primary text-white border-0 font-semibold">{editingId ? 'Update Account' : 'Add Account'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
