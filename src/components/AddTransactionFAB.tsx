import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import { TransactionType } from '@/types/ledger';
import { Plus, ArrowDownLeft, ArrowUpRight, Users, HandCoins, ArrowLeftRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const txTypes = [
  { value: 'income' as TransactionType, label: 'Income', icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' },
  { value: 'expense' as TransactionType, label: 'Expense', icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-destructive/10' },
  { value: 'baki' as TransactionType, label: 'Baki Pabo', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { value: 'joma' as TransactionType, label: 'Joma Debo', icon: HandCoins, color: 'text-warning', bg: 'bg-warning/10' },
  { value: 'transfer' as TransactionType, label: 'Transfer', icon: ArrowLeftRight, color: 'text-muted-foreground', bg: 'bg-muted' },
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
    setSelectedType(type); setShowMenu(false); setShowForm(true); reset();
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    if (selectedType === 'baki') {
      addBaki({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'unpaid' });
    } else if (selectedType === 'joma') {
      addJoma({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'pending' });
    } else {
      addTransaction({ type: selectedType, accountId, toAccountId: selectedType === 'transfer' ? toAccountId : undefined, name: name.trim(), amount: amt, date, note: note.trim() });
    }
    setShowForm(false); reset();
  };

  return (
    <>
      <button
        onClick={() => setShowMenu(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-2xl gradient-primary text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: '0 8px 24px -4px hsla(221, 83%, 53%, 0.4)' }}
      >
        <Plus className="w-7 h-7" />
      </button>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">New Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 mt-1">
            {txTypes.map(t => (
              <button key={t.value} onClick={() => openForm(t.value)}
                className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-muted/50 transition-colors text-left">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${t.bg}`}>
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                </div>
                <span className="font-semibold text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Add {txTypes.find(t => t.value === selectedType)?.label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 mt-2">
            <Input placeholder="Name / Description" value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 rounded-xl" />
            {selectedType !== 'baki' && selectedType !== 'joma' && (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Account" /></SelectTrigger>
                <SelectContent>{data.accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {selectedType === 'transfer' && (
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Transfer To" /></SelectTrigger>
                <SelectContent>{data.accounts.filter(a => a.id !== accountId).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="h-11 rounded-xl" />
            <Button onClick={handleSubmit} className="w-full h-12 rounded-xl gradient-primary text-white border-0 font-semibold text-base">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
