import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Building2, Moon, Sun, Download, Database, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/data';

export default function SettingsPage() {
  const { data, setBusinessName } = useLedger();
  const [name, setName] = useState(data.businessName);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  };

  const handleExport = () => {
    const csv = exportToCSV(data.transactions, data.accounts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rony-enterprise-data.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackup = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rony-enterprise-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-28 animate-fade-in">
      <PageHeader title="Settings" subtitle="App configuration" />

      <div className="mx-4 space-y-3">
        {/* Business Name */}
        <div className="p-5 rounded-2xl glass-card-elevated">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Business Name</span>
          </div>
          <div className="flex gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} className="flex-1 h-11 rounded-xl" />
            <Button onClick={() => setBusinessName(name.trim())} size="sm" className="h-11 px-5 rounded-xl gradient-primary text-white border-0 font-semibold">
              Save
            </Button>
          </div>
        </div>

        {/* Dark Mode */}
        <button onClick={toggleDark} className="w-full flex items-center gap-3 p-5 rounded-2xl glass-card-elevated text-left group">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-primary/10' : 'bg-warning/10'}`}>
            {dark ? <Moon className="w-4.5 h-4.5 text-primary" /> : <Sun className="w-4.5 h-4.5 text-warning" />}
          </div>
          <span className="text-sm font-semibold text-foreground flex-1">
            {dark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${dark ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
            <div className="w-5.5 h-5.5 bg-white rounded-full mx-1 shadow-sm transition-all duration-300" />
          </div>
        </button>

        {/* Export */}
        <button onClick={handleExport} className="w-full flex items-center gap-3 p-5 rounded-2xl glass-card-elevated text-left group">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
            <Download className="w-4.5 h-4.5 text-success" />
          </div>
          <span className="text-sm font-semibold text-foreground flex-1">Export Data (CSV)</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Backup */}
        <button onClick={handleBackup} className="w-full flex items-center gap-3 p-5 rounded-2xl glass-card-elevated text-left group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Database className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground flex-1">Backup Data (JSON)</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* App Info */}
        <div className="pt-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">Rony Enterprise Ledger</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Version 1.0.0 • Made with ❤️</p>
        </div>
      </div>
    </div>
  );
}
