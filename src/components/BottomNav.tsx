import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, ArrowLeftRight, BarChart3 } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/baki', label: 'Baki', icon: Users },
  { path: '/transactions', label: 'History', icon: ArrowLeftRight },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto px-4 pb-1">
        <div className="glass-card-elevated rounded-2xl mb-1">
          <div className="flex items-center justify-around h-16">
            {tabs.map(tab => {
              const active = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`transition-all duration-200 ${active ? 'scale-110' : ''}`}>
                    <tab.icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? '' : 'font-medium'}`}>{tab.label}</span>
                  {active && <div className="w-4 h-0.5 rounded-full bg-primary mt-0.5" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
