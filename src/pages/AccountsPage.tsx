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
  { value: 'Landmark', label: 'Bank' },
  { value: 'Smartphone', label: 'Mobile' },
  { value: 'Zap', label: 'Digital' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Banknote', label: 'Cash' },
];

const categoryOptions = ['DBBL', 'bKash', 'Rocket', 'Nagad', 'Cash', 'Other'];

const categoryColors: Record<string, string> = {
  DBBL: 'from-blue-500 to-blue-600',
  bKash: 'from-pink-500 to-pink-600',
  Rocket: 'from-purple-500 to-purple-600',
  Nagad: 'from-orange-500 to-orange-600',
  Cash: 'from-emerald-500 to-emerald-600',
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

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (acc: Account) => {
    setEditingId(acc.id);
    setForm({ name: acc.name, category: acc.category, balance: acc.balance, icon: acc.icon });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      editAccount(editingId, { name: form.name, category: form.category, balance: form.balance, icon: form.icon });
    } else {
      addAccount({ name: form.name, category: form.category, balance: form.balance, icon: form.icon });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteAccount(deleteId);
      setDeleteId(null);
    }
  };

  const grouped = data.accounts.reduce<Record<string, Account[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <PageHeader title="Accounts" subtitle="All financial accounts" />

      <div className="mx-4 mb-4 flex items-center justify-between">
        <div className="p-4 rounded-2xl gradient-primary text-primary-foreground flex-1 mr-3">
          <p className="text-sm opacity-80">Total Account Balance</p>
          <p className="text-2xl font-bold mt-1">{formatTaka(totalAccountBalance)}</p>
        </div>
        <Button onClick={openAdd} size="icon" className="h-12 w-12 rounded-xl shrink-0">
          <Plus className="w-5 h-5" />
        </Button>
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground mr-2">{formatTaka(acc.balance)}</p>
                      <button onClick={() => openEdit(acc)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(acc.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Account' : 'Add Account'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Account Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. bKash Personal" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Balance</Label>
              <Input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={v => setForm(f => ({ ...f, icon: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconOptions.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">{editingId ? 'Update' : 'Add Account'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The account and its balance will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
