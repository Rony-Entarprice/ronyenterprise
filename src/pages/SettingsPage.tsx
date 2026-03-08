import { useLedger } from '@/contexts/LedgerContext';
import PageHeader from '@/components/PageHeader';
import { Building2, Moon, Sun, Download, Database, LogOut } from 'lucide-react';
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
    <div className="pb-24">
      <PageHeader title="Settings" subtitle="App configuration" />

      <div className="mx-4 space-y-3">
        {/* Business Name */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Business Name</span>
          </div>
          <div className="flex gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            <Button onClick={() => setBusinessName(name.trim())} size="sm" className="gradient-primary text-primary-foreground border-0">
              Save
            </Button>
          </div>
        </div>

        {/* Dark Mode */}
        <button onClick={toggleDark} className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left">
          {dark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning" />}
          <span className="text-sm font-medium text-foreground flex-1">
            {dark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${dark ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
            <div className="w-5 h-5 bg-card rounded-full mx-0.5 shadow-sm" />
          </div>
        </button>

        {/* Export */}
        <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left">
          <Download className="w-5 h-5 text-success" />
          <span className="text-sm font-medium text-foreground">Export Data (CSV)</span>
        </button>

        {/* Backup */}
        <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left">
          <Database className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Backup Data (JSON)</span>
        </button>
      </div>
    </div>
  );
}
