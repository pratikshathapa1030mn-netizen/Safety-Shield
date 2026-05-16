import { useState } from 'react';
import { Search, ChevronRight, Zap, HardHat, DraftingCompass, Gavel, Beaker, Shield } from 'lucide-react';
import { Screen, JobType } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';

interface Props {
  onNavigate: (screen: Screen) => void;
  onSelectTask: (job: JobType) => void;
}

const TASKS = [
  { id: 'welding', title: 'Welding & Hot Work', section: 'Section 4: Structural Fabrication', risk: 'High', icon: Zap },
  { id: 'hv-panel', title: 'HV Panel Inspection', section: 'Section 2: Power Grid', risk: 'High', icon: Zap },
  { id: 'scaffold', title: 'Scaffold Erection', section: 'Section 1: Site Exterior', risk: 'Moderate', icon: DraftingCompass },
  { id: 'tank', title: 'Tank Cleaning Ops', section: 'Section 9: Storage Facility', risk: 'High', icon: Gavel },
  { id: 'acid', title: 'Acid Neutralization', section: 'Section 5: Chemical Labs', risk: 'High', icon: Beaker },
  { id: 'trenching', title: 'Excavation & Trenching', section: 'Section 3: Ground Works', risk: 'High', icon: DraftingCompass },
  { id: 'forklift', title: 'Forklift Material Handling', section: 'Section 7: Logistics Hub', risk: 'Moderate', icon: HardHat },
  { id: 'crane', title: 'Tower Crane Operations', section: 'Section 1: Skyline', risk: 'High', icon: Gavel },
  { id: 'conveyor', title: 'Conveyor Line Maint', section: 'Section 6: Assembly Floor', risk: 'Moderate', icon: Zap },
  { id: 'confined', title: 'Confined Space Entry', section: 'Section 8: Underground Vaults', risk: 'High', icon: Shield },
];

export default function TaskListScreen({ onNavigate, onSelectTask }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTasks = TASKS.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => onNavigate('dashboard')} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-2xl mx-auto w-full">
        {/* Search Bar */}
        <div className="mb-6 relative group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-container transition-colors" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface-container border-2 border-outline-variant rounded-xl text-on-surface focus:border-primary-container focus:ring-0 outline-none transition-all"
            placeholder="Search safety tasks..."
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-6 no-scrollbar">
          {['All', 'Construction', 'Factory', 'Maintenance', 'Logistics'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all border",
                activeCategory === cat 
                  ? "bg-primary-container text-on-primary-container border-primary-container" 
                  : "bg-surface-container-highest text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">Critical Safety Tasks</h2>
          <span className="text-sm font-bold text-on-surface-variant">{filteredTasks.length} Active</span>
        </div>

        {/* Tasks */}
        <div className="flex flex-col gap-4">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                onSelectTask(task.id as JobType);
                onNavigate('gear-checklist');
              }}
              className="bg-surface-container-high border-2 border-primary-container/20 rounded-xl p-4 flex items-center gap-4 group active:scale-[0.98] transition-all hover:bg-surface-container-highest hover:border-primary-container"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-primary-container flex items-center justify-center rounded-lg shadow-sm">
                <task.icon size={24} className="text-on-primary-container" />
              </div>
              
              <div className="flex-grow text-left">
                <h3 className="text-lg font-bold text-primary-container">{task.title}</h3>
                <p className="text-sm text-on-surface-variant">{task.section}</p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn(
                  "font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider",
                  task.risk === 'High' ? "bg-error text-on-error" : "bg-primary-container text-on-primary-container"
                )}>
                  {task.risk} Risk
                </span>
                <ChevronRight size={20} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </main>

      <NavigationBar activeTab="task-list" onNavigate={onNavigate} />
    </div>
  );
}
