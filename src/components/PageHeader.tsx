import { format } from 'date-fns';

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 pt-4 pb-2">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <p className="text-xs text-muted-foreground">{subtitle || format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
    </div>
  );
}
