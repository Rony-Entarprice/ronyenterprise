import { useState } from 'react';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Trash2, Plus, Pencil, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const resetForm = () => { setName(''); setAmount(''); setNote(''); setDate(new Date().toISOString().split('T')[0]); setEditingId(null); };
  const openAdd = () => { resetForm(); setShowAdd(true); };
  const openEdit = (item: { id: string; name: string; amount: number; date: string; note: string }) => {
    setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.date); setNote(item.note); setShowAdd(true);
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    if (editingId) {
      const entry = { name: name.trim(), amount: amt, date, note: note.trim() };
      tab === 'baki' ? editBaki(editingId, entry) : editJoma(editingId, entry);
    } else {
      tab === 'baki'
        ? addBaki({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'unpaid' })
        : addJoma({ name: name.trim(), amount: amt, date, note: note.trim(), status: 'pending' });
    }
    setShowAdd(false); resetForm();
  };

  const rawList = tab === 'baki' ? data.bakiList : data.jomaList;
  const list = rawList.filter(item => {
    if (statusFilter === 'all') return true;
    if (tab === 'baki') return statusFilter === 'active' ? (item as any).status === 'unpaid' : (item as any).status === 'paid';
    return statusFilter === 'active' ? (item as any).status === 'pending' : (item as any).status === 'returned';
  });
  const total = tab === 'baki' ? totalBaki : totalJoma;

  return (
    <div className="pb-28 animate-fade-in">
      <PageHeader title="Baki & Joma" subtitle="Track receivables and payables" />

      {/* Tabs */}
      <div className="flex mx-4 mb-4 p-1 rounded-2xl bg-muted/60">
        <button onClick={() => { setTab('baki'); setStatusFilter('all'); }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${tab === 'baki' ? 'gradient-primary text-white shadow-sm' : 'text-muted-foreground'}`}>
          Baki Pabo
        </button>
        <button onClick={() => { setTab('joma'); setStatusFilter('all'); }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${tab === 'joma' ? 'gradient-warning text-white shadow-sm' : 'text-muted-foreground'}`}>
          Joma Debo
        </button>
      </div>

      {/* Total Card */}
      <div className="mx-4 mb-4">
        <div className={`rounded-2xl p-5 text-white relative overflow-hidden ${tab === 'baki' ? 'gradient-card-blue' : 'gradient-warning'}`}>
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-xs font-medium text-white/70">Total {tab === 'baki' ? 'Baki Pabo' : 'Joma Debo'}</p>
          <p className="text-2xl font-extrabold mt-1 relative z-10">{formatTaka(total)}</p>
          <p className="text-[10px] text-white/60 mt-1">
            {rawList.filter(i => tab === 'baki' ? (i as any).status === 'unpaid' : (i as any).status === 'pending').length} active / {rawList.length} total
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mx-4 mb-3 flex gap-1.5">
        {(['all', 'active', 'done'] as const).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              statusFilter === f ? 'gradient-primary text-white shadow-sm' : 'bg-card text-muted-foreground border border-border/50'
            }`}>
            {f === 'all' ? 'All' : f === 'active' ? (tab === 'baki' ? 'Unpaid' : 'Pending') : (tab === 'baki' ? 'Paid' : 'Returned')}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="mx-4 mb-3">
        <Button onClick={openAdd} variant="outline" className="w-full gap-2 h-11 rounded-xl border-dashed border-2 border-border/60 text-muted-foreground hover:text-foreground font-semibold">
          <Plus className="w-4 h-4" /> Add {tab === 'baki' ? 'Baki' : 'Joma'}
        </Button>
      </div>

      {/* List */}
      <div className="mx-4 space-y-2">
        {list.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No entries found</p>}
        {list.map((item, i) => {
          const isBaki = tab === 'baki';
          const isDone = isBaki ? (item as any).status === 'paid' : (item as any).status === 'returned';
          return (
            <div key={item.id} className={`flex items-center gap-3 p-3.5 rounded-2xl glass-card animate-slide-up ${isDone ? 'opacity-50' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
              <button onClick={() => isBaki ? toggleBakiStatus(item.id) : toggleJomaStatus(item.id)} className="shrink-0">
                {isDone
                  ? <CheckCircle2 className="w-7 h-7 text-success" />
                  : <Circle className="w-7 h-7 text-muted-foreground/40" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-foreground truncate ${isDone ? 'line-through' : ''}`}>{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-muted-foreground">{item.date}{item.note ? ` • ${item.note}` : ''}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isDone ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {isBaki ? (isDone ? 'Paid' : 'Unpaid') : (isDone ? 'Returned' : 'Pending')}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-foreground mr-1">{formatTaka(item.amount)}</p>
              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => isBaki ? deleteBaki(item.id) : deleteJoma(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-[90vw] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingId ? 'Edit' : 'Add'} {tab === 'baki' ? 'Baki Pabo' : 'Joma Debo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 mt-2">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Amount (৳)" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 rounded-xl" />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl" />
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="h-11 rounded-xl" />
            <Button onClick={handleSave} className="h-11 rounded-xl gradient-primary text-white border-0 font-semibold">
              {editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
