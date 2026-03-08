import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, showSettings = false }: { title: string; subtitle?: string; showSettings?: boolean }) {
  return (
    <div className="px-5 pt-6 pb-3 flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle || format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>
      {showSettings && (
        <Link to="/settings" className="mt-1 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
