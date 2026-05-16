import { motion } from 'motion/react';
import { Shield, AlertTriangle, Zap, Eye, Hand, ClipboardCheck, LayoutDashboard, Flag } from 'lucide-react';
import { Screen } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function RiskAssessmentScreen({ onNavigate }: Props) {
  const riskValue = 85;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => onNavigate('gear-checklist')} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-lg mx-auto w-full">
        {/* Header */}
        <section className="mt-4 mb-8 text-center px-4">
          <h2 className="text-3xl font-extrabold text-on-surface mb-2">Risk Assessment</h2>
          <div className="flex justify-center items-center gap-2 text-error font-bold uppercase tracking-[0.2em] animate-pulse">
            <AlertTriangle size={20} fill="currentColor" />
            <span>High Alert Level</span>
          </div>
        </section>

        {/* Gauge */}
        <section className="bg-surface-container border border-outline-variant rounded-xl p-8 flex flex-col items-center mb-8 shadow-lg relative overflow-hidden">
          <div className="relative w-[280px] h-[140px] overflow-hidden">
            {/* Background Arch */}
            <div 
              className="absolute top-0 left-0 w-[280px] h-[280px] rounded-full border-[20px] border-surface-container-highest"
              style={{
                background: 'conic-gradient(from 270deg, #4ade80 0%, #4ade80 30%, #fbbf24 30%, #fbbf24 60%, #ef4444 60%, #ef4444 100%)',
                mask: 'radial-gradient(circle, transparent 65%, black 66%)',
                WebkitMask: 'radial-gradient(circle, transparent 65%, black 66%)'
              }}
            />
            {/* Needle */}
            <motion.div 
              initial={{ rotate: -90 }}
              animate={{ rotate: 75 }} // 85% roughly
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 w-1.5 h-28 bg-on-surface origin-bottom -translate-x-1/2 rounded-full shadow-lg z-10"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-on-surface rounded-full" />
            </motion.div>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 bg-on-surface rounded-full z-20 border-4 border-surface" />
          </div>

          <div className="text-center mt-6">
            <div className="text-5xl font-extrabold text-error tabular-nums">85%</div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-1">Critical Risk</div>
          </div>

          {/* Decorative background grid in card */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid" />
        </section>

        {/* Potential Injuries */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 ml-1">Potential Injuries</h3>
          <div className="space-y-2">
            {[
              { id: 1, label: 'Head Injury', detail: 'Immediate attention required', icon: Zap, severity: 'Critical', color: 'error' },
              { id: 2, label: 'Eye Injury', detail: 'Shatter hazard detected', icon: Eye, severity: 'Critical', color: 'error' },
              { id: 3, label: 'Hand Burns', detail: 'High thermal exposure zone', icon: Hand, severity: 'Serious', color: 'primary-container' },
            ].map((injury) => (
              <div key={injury.id} className="bg-surface-container border-l-4 p-4 flex justify-between items-center rounded-r-xl border-current shadow-sm" style={{ color: `var(--color-${injury.color})` }}>
                <div className="flex items-center gap-4 text-on-surface">
                  <injury.icon size={24} className="opacity-80" />
                  <div>
                    <div className="font-bold">{injury.label}</div>
                    <div className="text-xs text-on-surface-variant">{injury.detail}</div>
                  </div>
                </div>
                <span className="bg-current px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black">
                  {injury.severity}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col gap-3 mb-8">
          <button 
             onClick={() => onNavigate('gear-checklist')}
             className="w-full h-12 bg-primary-container text-on-primary-container font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <ClipboardCheck size={20} />
            Go Back & Complete Checklist
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full h-12 border-2 border-primary-container text-primary-container font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LayoutDashboard size={20} />
            Continue to Dashboard
          </button>
          <button 
            onClick={() => onNavigate('log-incident')}
            className="w-full h-12 bg-error-container text-on-error-container font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Flag size={20} />
            Log an Incident
          </button>
        </section>

        <div className="rounded-xl overflow-hidden border border-outline-variant h-48 w-full group relative">
          <img 
            className="w-full h-full object-cover grayscale opacity-50 contrast-125 transition-transform duration-700 group-hover:scale-110" 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800"
            alt="Safety Context"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
        </div>
      </main>

      <NavigationBar activeTab="task-list" onNavigate={onNavigate} />
    </div>
  );
}
