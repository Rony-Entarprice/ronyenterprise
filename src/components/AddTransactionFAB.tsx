import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import { Plus, ArrowDownLeft, ArrowUpRight, Users, HandCoins, ArrowLeftRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const txTypes = [
  { value: 'income', label: 'Income', icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10' },
  { value: 'expense', label: 'Expense', icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-destructive/10' },
  { value: 'baki', label: 'Baki Pabo', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { value: 'joma', label: 'Joma Debo', icon: HandCoins, color: 'text-warning', bg: 'bg-warning/10' },
  { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-muted-foreground', bg: 'bg-muted' },
];

export default function AddTransactionFAB() {
  const [showMenu, setShowMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('income');
  const { accounts, addTransaction, addBaki, addJoma } = useLedger();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const reset = () => {
    setName(''); setAmount(''); setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(accounts[0]?.id || '');
    setToAccountId(accounts[1]?.id || '');
  };

  const openForm = (type: string) => { setSelectedType(type); setShowMenu(false); setShowForm(true); reset(); };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    if (selectedType === 'baki') {
      await addBaki({ person_name: name.trim(), amount: amt, date, note: note.trim(), status: 'unpaid' });
    } else if (selectedType === 'joma') {
      await addJoma({ person_name: name.trim(), amount: amt, date, note: note.trim(), status: 'pending' });
    } else {
      await addTransaction({
        transaction_type: selectedType,
        account_id: accountId || null,
        to_account_id: selectedType === 'transfer' ? toAccountId || null : null,
        reference_name: name.trim(),
        amount: amt,
        transaction_date: date,
        note: note.trim(),
      });
    }
    setShowForm(false); reset();
  };

  return (
    <>
      <button onClick={() => setShowMenu(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-2xl gradient-primary text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: '0 8px 24px -4px hsla(221, 83%, 53%, 0.4)' }}>
        <Plus className="w-7 h-7" />
      </button>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader><DialogTitle className="text-lg">New Entry</DialogTitle></DialogHeader>
          <div className="grid gap-2 mt-1">
            {txTypes.map(t => (
              <button key={t.value} onClick={() => openForm(t.value)}
                className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-muted/50 transition-colors text-left">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${t.bg}`}><t.icon className={`w-5 h-5 ${t.color}`} /></div>
                <span className="font-semibold text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader><DialogTitle className="text-lg">Add {txTypes.find(t => t.value === selectedType)?.label}</DialogTitle></DialogHeader>
          <div className="grid gap-3 mt-2">
            <Input placeholder="Name / Description" value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 rounded-xl" />
            {selectedType !== 'baki' && selectedType !== 'joma' && accounts.length > 0 && (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Account" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {selectedType === 'transfer' && accounts.length > 1 && (
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Transfer To" /></SelectTrigger>
                <SelectContent>{accounts.filter(a => a.id !== accountId).map(a => <SelectItem key={a.id} value={a.id}>{a.account_name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="h-11 rounded-xl" />
            <Button onClick={handleSubmit} className="w-full h-12 rounded-xl gradient-primary text-white border-0 font-semibold text-base">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
