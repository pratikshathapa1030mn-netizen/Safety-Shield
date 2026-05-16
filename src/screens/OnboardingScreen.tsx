import { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, HardHat, DraftingCompass } from 'lucide-react';
import { JobType } from '../App';
import { cn } from '@/src/lib/utils';

interface Props {
  onNext: (job: JobType) => void;
}

export default function OnboardingScreen({ onNext }: Props) {
  const [selected, setSelected] = useState<JobType>('welding');

  return (
    <div className="flex flex-col min-h-screen px-4 pb-8 pt-12">
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-40 h-40 flex items-center justify-center border-4 border-primary-container rounded-full mb-8 bg-surface-container-low shadow-[0_0_20px_rgba(255,214,0,0.15)]"
        >
          <ClipboardList size={80} className="text-primary-container" />
        </motion.div>

        <div className="max-w-xs space-y-4">
          <h1 className="text-3xl font-extrabold text-primary-container leading-tight">
            Choose Your Daily Task
          </h1>
          <p className="text-lg text-on-surface-variant font-medium">
            Select what work you're doing today – Welding, Digging, Height Work, and more.
          </p>
        </div>

        <div className="mt-12 w-full grid grid-cols-2 gap-4 max-w-sm">
          <button 
            onClick={() => setSelected('welding')}
            className={cn(
              "rounded-xl p-4 border-l-4 flex flex-col items-center shadow-sm transition-all active:scale-95",
              selected === 'welding' ? "bg-primary-container/10 border-primary-container ring-2 ring-primary-container ring-offset-2" : "bg-surface-container border-outline"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center mb-2">
              <HardHat size={20} className={cn(selected === 'welding' ? "text-primary-container" : "text-outline")} />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface">Welding</span>
          </button>
          
          <button 
            onClick={() => setSelected('excavation')}
            className={cn(
              "rounded-xl p-4 border-l-4 flex flex-col items-center shadow-sm transition-all active:scale-95",
              selected === 'excavation' ? "bg-primary-container/10 border-primary-container ring-2 ring-primary-container ring-offset-2" : "bg-surface-container border-outline"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center mb-2">
              <DraftingCompass size={20} className={cn(selected === 'excavation' ? "text-primary-container" : "text-outline")} />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface">Excavation</span>
          </button>
        </div>
      </main>

      <footer className="w-full mt-auto space-y-8">
        <div className="flex justify-center items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-container"></div>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => onNext(selected)}
            className="w-full h-12 bg-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all uppercase tracking-widest hover:brightness-110"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}

