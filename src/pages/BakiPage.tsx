import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

export default function BakiPage() {
  const { data, totalBaki, totalJoma, addBaki, addJoma, deleteBaki, deleteJoma } = useLedger();
  const [tab, setTab] = useState<'baki' | 'joma'>('baki');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    if (tab === 'baki') addBaki({ name: name.trim(), amount: amt, date, note: note.trim() });
    else addJoma({ name: name.trim(), amount: amt, date, note: note.trim() });
    setShowAdd(false);
    setName(''); setAmount(''); setNote('');
  };

  const list = tab === 'baki' ? data.bakiList : data.jomaList;
  const total = tab === 'baki' ? totalBaki : totalJoma;

  return (
    <div className="pb-24">
      <PageHeader title="Baki & Joma" subtitle="Track receivables and payables" />

      {/* Tabs */}
      <div className="flex mx-4 mb-4 bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab('baki')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'baki' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Baki Pabo
        </button>
        <button
          onClick={() => setTab('joma')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'joma' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Joma (Given)
        </button>
      </div>

      {/* Total */}
      <div className={`mx-4 mb-4 p-4 rounded-2xl text-primary-foreground ${tab === 'baki' ? 'gradient-primary' : 'gradient-warning'}`}>
        <p className="text-sm opacity-80">Total {tab === 'baki' ? 'Baki Pabo' : 'Joma'}</p>
        <p className="text-2xl font-bold mt-1">{formatTaka(total)}</p>
        <p className="text-xs opacity-70 mt-1">{list.length} entries</p>
      </div>

      {/* Add Button */}
      <div className="mx-4 mb-3">
        <Button onClick={() => setShowAdd(true)} variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" /> Add {tab === 'baki' ? 'Baki' : 'Joma'}
        </Button>
      </div>

      {/* List */}
      <div className="mx-4 space-y-2">
        {list.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground ${tab === 'baki' ? 'gradient-primary' : 'gradient-warning'}`}>
              {item.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.date}{item.note ? ` • ${item.note}` : ''}</p>
            </div>
            <p className="text-sm font-bold text-foreground mr-2">{formatTaka(item.amount)}</p>
            <button
              onClick={() => tab === 'baki' ? deleteBaki(item.id) : deleteJoma(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Add {tab === 'baki' ? 'Baki Pabo' : 'Joma'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <Button onClick={handleAdd} className="gradient-primary text-primary-foreground border-0">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
