import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Save, ChevronDown, ChevronRight, Wallet, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface Snapshot {
  id: string;
  account_id: string;
  snapshot_date: string;
  balance: number;
}

function formatTaka(n: number) {
  return '৳' + n.toLocaleString('en-BD');
}

export default function DailyBalancePage() {
  const { accounts, businessId, loading: ledgerLoading } = useLedger();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Load existing snapshots for selected date
  const loadSnapshotsForDate = useCallback(async () => {
    if (!businessId) return;
    const { data } = await supabase
      .from('daily_balance_snapshots')
      .select('*')
      .eq('business_id', businessId)
      .eq('snapshot_date', dateStr);

    const map: Record<string, string> = {};
    accounts.forEach(acc => {
      const snap = data?.find(s => s.account_id === acc.id);
      map[acc.id] = snap ? String(snap.balance) : String(acc.balance);
    });
    setBalances(map);
  }, [businessId, dateStr, accounts]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!businessId) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from('daily_balance_snapshots')
      .select('*')
      .eq('business_id', businessId)
      .order('snapshot_date', { ascending: false });
    setHistory(data || []);
    setHistoryLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadSnapshotsForDate();
  }, [loadSnapshotsForDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSave = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      for (const acc of accounts) {
        const balance = parseFloat(balances[acc.id] || '0');
        const { data: existing } = await supabase
          .from('daily_balance_snapshots')
          .select('id')
          .eq('account_id', acc.id)
          .eq('snapshot_date', dateStr)
          .maybeSingle();

        if (existing) {
          await supabase.from('daily_balance_snapshots').update({ balance }).eq('id', existing.id);
        } else {
          await supabase.from('daily_balance_snapshots').insert({
            business_id: businessId,
            account_id: acc.id,
            snapshot_date: dateStr,
            balance,
          });
        }

        // Also update the account's current balance
        await supabase.from('accounts').update({ balance }).eq('id', acc.id);
      }
      toast.success('ব্যালেন্স সেভ হয়েছে!');
      await loadHistory();
    } catch (err) {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    }
    setSaving(false);
  };

  // Group history by date
  const historyByDate = history.reduce<Record<string, Snapshot[]>>((acc, snap) => {
    if (!acc[snap.snapshot_date]) acc[snap.snapshot_date] = [];
    acc[snap.snapshot_date].push(snap);
    return acc;
  }, {});

  const sortedDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  if (ledgerLoading) {
    return (
      <div className="pb-24 animate-fade-in">
        <PageHeader title="Daily Balance" />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Daily Balance" />

      {/* Date Picker */}
      <div className="mx-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl h-12">
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {format(selectedDate, 'dd MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Account Balance Inputs */}
      <div className="mx-4 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          অ্যাকাউন্ট ব্যালেন্স ({format(selectedDate, 'dd/MM/yyyy')})
        </h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">কোনো অ্যাকাউন্ট নেই</p>
        ) : (
          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div key={acc.id} className="glass-card-elevated rounded-2xl p-4 animate-slide-up">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{acc.account_name}</p>
                    <p className="text-[10px] text-muted-foreground">{acc.provider || acc.account_type}</p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={balances[acc.id] || ''}
                      onChange={(e) => setBalances(prev => ({ ...prev, [acc.id]: e.target.value }))}
                      className="text-right font-bold rounded-xl h-10"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      {accounts.length > 0 && (
        <div className="mx-4 mb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl font-bold text-base gradient-primary text-white border-0"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'সেভ হচ্ছে...' : 'সব ব্যালেন্স সেভ করো'}
          </Button>
        </div>
      )}

      {/* History Section */}
      <div className="mx-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          ব্যালেন্স হিস্ট্রি
        </h2>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">লোড হচ্ছে...</p>
        ) : sortedDates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">কোনো হিস্ট্রি নেই</p>
        ) : (
          <div className="space-y-2">
            {sortedDates.map((date) => {
              const snapshots = historyByDate[date];
              const total = snapshots.reduce((s, sn) => s + sn.balance, 0);
              const isOpen = openDates[date] || false;

              return (
                <Collapsible key={date} open={isOpen} onOpenChange={(o) => setOpenDates(prev => ({ ...prev, [date]: o }))}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground">{format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy')}</p>
                          <p className="text-[10px] text-muted-foreground">{snapshots.length} অ্যাকাউন্ট</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-primary">{formatTaka(total)}</p>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 ml-7 space-y-1.5 pb-2">
                      {snapshots.map((snap) => {
                        const acc = accounts.find(a => a.id === snap.account_id);
                        return (
                          <div key={snap.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/50">
                            <p className="text-xs font-medium text-foreground">{acc?.account_name || 'Unknown'}</p>
                            <p className="text-xs font-bold text-foreground">{formatTaka(snap.balance)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
