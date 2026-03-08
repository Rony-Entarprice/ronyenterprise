import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import { TransactionType } from '@/types/ledger';
import { Plus, X, ArrowDownLeft, ArrowUpRight, Users, HandCoins, ArrowLeftRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const txTypes = [
  { value: 'income' as TransactionType, label: 'Income', icon: ArrowDownLeft, color: 'text-success' },
  { value: 'expense' as TransactionType, label: 'Expense', icon: ArrowUpRight, color: 'text-destructive' },
  { value: 'baki' as TransactionType, label: 'Baki Pabo', icon: Users, color: 'text-primary' },
  { value: 'joma' as TransactionType, label: 'Joma', icon: HandCoins, color: 'text-warning' },
  { value: 'transfer' as TransactionType, label: 'Transfer', icon: ArrowLeftRight, color: 'text-muted-foreground' },
];

export default function AddTransactionFAB() {
  const [showMenu, setShowMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>('income');
  const { data, addTransaction, addBaki, addJoma } = useLedger();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(data.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(data.accounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const reset = () => {
    setName(''); setAmount(''); setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(data.accounts[0]?.id || '');
    setToAccountId(data.accounts[1]?.id || '');
  };

  const openForm = (type: TransactionType) => {
    setSelectedType(type);
    setShowMenu(false);
    setShowForm(true);
    reset();
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    if (selectedType === 'baki') {
      addBaki({ name: name.trim(), amount: amt, date, note: note.trim() });
    } else if (selectedType === 'joma') {
      addJoma({ name: name.trim(), amount: amt, date, note: note.trim() });
    } else {
      addTransaction({
        type: selectedType,
        accountId,
        toAccountId: selectedType === 'transfer' ? toAccountId : undefined,
        name: name.trim(),
        amount: amt,
        date,
        note: note.trim(),
      });
    }
    setShowForm(false);
    reset();
  };

  return (
    <>
      <button
        onClick={() => setShowMenu(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Type Selection Menu */}
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {txTypes.map(t => (
              <button
                key={t.value}
                onClick={() => openForm(t.value)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${t.color}`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              Add {txTypes.find(t => t.value === selectedType)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name / Description" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            
            {selectedType !== 'baki' && selectedType !== 'joma' && (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedType === 'transfer' && (
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger><SelectValue placeholder="Transfer To" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.filter(a => a.id !== accountId).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            
            <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground border-0">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
