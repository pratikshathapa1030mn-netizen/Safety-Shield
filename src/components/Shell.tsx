import { Shield, Home, ClipboardList, BarChart3, User, ArrowLeft } from 'lucide-react';
import { Screen } from '@/src/App';
import { cn } from '@/src/lib/utils';

interface Props {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function NavigationBar({ activeTab, onNavigate }: Props) {
  const tabs: { id: Screen; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'task-list', label: 'Tasks', icon: ClipboardList },
    { id: 'scores', label: 'Score', icon: BarChart3 },
    { id: 'profile-setup', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 h-20 bg-surface-container-low border-t-2 border-outline-variant flex justify-around items-center px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (activeTab === 'task-list' && tab.id === 'task-list');
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-all duration-200 min-w-[72px]",
              isActive 
                ? "bg-primary-container text-on-primary-container scale-100" 
                : "text-on-surface-variant hover:bg-surface-container-highest scale-95 opacity-80"
            )}
          >
            <Icon size={24} fill={isActive ? "currentColor" : "none"} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

interface TopBarProps {
  onBack?: () => void;
  title?: string;
}

export function TopBar({ onBack, title }: TopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex items-center px-4 h-14 justify-between">
      <div className="flex items-center gap-2">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <Shield size={24} className="text-primary-container fill-primary-container" />
        <span className="text-xl font-extrabold text-primary-container">
          {title || "Raksha-Kavach"}
        </span>
      </div>
    </header>
  );
}
