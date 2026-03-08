import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Trash2, Plus, Pencil, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BakiStatus, JomaStatus } from '@/types/ledger';

function formatTaka(n: number) { return '৳' + n.toLocaleString('en-BD'); }

export default function BakiPage() {
  const { data, totalBaki, totalJoma, addBaki, addJoma, editBaki, editJoma, deleteBaki, deleteJoma, toggleBakiStatus, toggleJomaStatus } = useLedger();
  const [tab, setTab] = useState<'baki' | 'joma'>('baki');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all');

  const resetForm = () => {
    setName(''); setAmount(''); setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const openAdd = () => { resetForm(); setShowAdd(true); };

  const openEdit = (item: { id: string; name: string; amount: number; date: string; note: string }) => {
    setEditingId(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setDate(item.date);
    setNote(item.note);
    setShowAdd(true);
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    if (editingId) {
      const entry = { name: name.trim(), amount: amt, date, note: note.trim() };
      if (tab === 'baki') editBaki(editingId, entry);
      else editJoma(editingId, entry);
    } else {
      if (tab === 'baki') addBaki({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'unpaid' });
      else addJoma({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'pending' });
    }
    setShowAdd(false);
    resetForm();
  };

  const rawList = tab === 'baki' ? data.bakiList : data.jomaList;
  const list = rawList.filter(item => {
    if (statusFilter === 'all') return true;
    if (tab === 'baki') return statusFilter === 'active' ? (item as any).status === 'unpaid' : (item as any).status === 'paid';
    return statusFilter === 'active' ? (item as any).status === 'pending' : (item as any).status === 'returned';
  });
  const total = tab === 'baki' ? totalBaki : totalJoma;

  return (
    <div className="pb-24">
      <PageHeader title="Baki & Joma" subtitle="Track receivables and payables" />

      {/* Tabs */}
      <div className="flex mx-4 mb-4 bg-muted rounded-xl p-1">
        <button onClick={() => { setTab('baki'); setStatusFilter('all'); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'baki' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
          Baki Pabo
        </button>
        <button onClick={() => { setTab('joma'); setStatusFilter('all'); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'joma' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
          Joma Debo
        </button>
      </div>

      {/* Total */}
      <div className={`mx-4 mb-4 p-4 rounded-2xl text-primary-foreground ${tab === 'baki' ? 'gradient-primary' : 'gradient-warning'}`}>
        <p className="text-sm opacity-80">Total {tab === 'baki' ? 'Baki Pabo' : 'Joma Debo'}</p>
        <p className="text-2xl font-bold mt-1">{formatTaka(total)}</p>
        <p className="text-xs opacity-70 mt-1">{rawList.filter(i => tab === 'baki' ? (i as any).status === 'unpaid' : (i as any).status === 'pending').length} active / {rawList.length} total</p>
      </div>

      {/* Status Filter */}
      <div className="mx-4 mb-3 flex gap-1.5">
        {(['all', 'active', 'done'] as const).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f === 'all' ? 'All' : f === 'active' ? (tab === 'baki' ? 'Unpaid' : 'Pending') : (tab === 'baki' ? 'Paid' : 'Returned')}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="mx-4 mb-3">
        <Button onClick={openAdd} variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" /> Add {tab === 'baki' ? 'Baki' : 'Joma'}
        </Button>
      </div>

      {/* List */}
      <div className="mx-4 space-y-2">
        {list.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No entries found</p>
        )}
        {list.map(item => {
          const isBaki = tab === 'baki';
          const isDone = isBaki ? (item as any).status === 'paid' : (item as any).status === 'returned';
          return (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl bg-card border border-border ${isDone ? 'opacity-60' : ''}`}>
              <button
                onClick={() => isBaki ? toggleBakiStatus(item.id) : toggleJomaStatus(item.id)}
                className="shrink-0"
              >
                {isDone
                  ? <CheckCircle2 className="w-6 h-6 text-success" />
                  : <Circle className="w-6 h-6 text-muted-foreground" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-foreground truncate ${isDone ? 'line-through' : ''}`}>{item.name}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-muted-foreground">{item.date}{item.note ? ` • ${item.note}` : ''}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    isDone ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {isBaki ? (isDone ? 'Paid' : 'Unpaid') : (isDone ? 'Returned' : 'Pending')}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-foreground mr-1">{formatTaka(item.amount)}</p>
              <button onClick={() => openEdit(item)} className="text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => isBaki ? deleteBaki(item.id) : deleteJoma(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} {tab === 'baki' ? 'Baki Pabo' : 'Joma Debo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground border-0">
              {editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
