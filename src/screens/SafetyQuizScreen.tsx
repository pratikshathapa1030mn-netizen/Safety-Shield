import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ClipboardList, CheckCircle2, ChevronRight, HardHat, Info } from 'lucide-react';
import { Screen } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';

import { auth, saveQuizResult } from '../lib/firebase';

interface Props {
  onNavigate: (screen: Screen) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  image: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the very first step before performing any welding maintenance?",
    options: ["Wash your hands", "Lockout/Tagout the power source", "Put on gloves", "Check the gas level"],
    correctAnswer: 1,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    question: "When should you inspect a safety harness?",
    options: ["Before each use", "Once a week", "Only after a fall incident", "During annual maintenance"],
    correctAnswer: 0,
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    question: "Which shade of lens is typically required for arc welding?",
    options: ["Shade 3", "Shade 5", "Shade 10-14", "Clear lens"],
    correctAnswer: 2,
    image: "https://images.unsplash.com/photo-1533035350221-afc01bb1a852?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    question: "What is the 'Two-Minute Rule' in industrial safety?",
    options: ["Work stops every 2 mins", "Take 2 mins to assess risks before a task", "Lunch break is 2 mins", "Report accidents within 2 mins"],
    correctAnswer: 1,
    image: "https://images.unsplash.com/photo-1581094794329-c8112c4e5190?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    question: "What does a yellow safety tag indicate?",
    options: ["Danger - Do not operate", "Safety/General Info", "Caution - Potential hazard", "Radiation risk"],
    correctAnswer: 2,
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800"
  }
];

export default function SafetyQuizScreen({ onNavigate }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    if (isSubmitted) {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        if (auth.currentUser) {
          saveQuizResult(auth.currentUser.uid, score, QUESTIONS.length)
            .catch(err => console.error("Failed to save quiz", err));
        }
        onNavigate('dashboard');
      }
    } else {
      if (selectedOption === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
      setIsSubmitted(true);
    }
  };

  const progress = ((currentIdx + (isSubmitted ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => onNavigate('gear-checklist')} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-2xl mx-auto w-full space-y-8">
        {/* Progress */}
        <section className="mt-4">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Question {currentIdx + 1} of {QUESTIONS.length}</span>
            <span className="text-sm font-bold text-primary-container">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary-container" 
            />
          </div>
        </section>

        {/* Question Card */}
        <section className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary-container shadow-lg relative overflow-hidden group">
          <h1 className="text-2xl font-extrabold text-on-surface mb-6 relative z-10">{currentQuestion.question}</h1>
          
          <div className="w-full h-48 rounded-lg overflow-hidden relative mb-2">
            <img 
              alt="Safety visual" 
              className="w-full h-full object-cover grayscale brightness-[0.4] transition-transform duration-700 group-hover:scale-110"
              src={currentQuestion.image}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center backdrop-blur-sm border border-primary-container/30">
                <HardHat size={32} className="text-primary-container" />
              </div>
            </div>
          </div>
        </section>

        {/* Options */}
        <section className="flex flex-col gap-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            
            let bgClass = "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-outline";
            if (isSubmitted) {
              if (isCorrect) bgClass = "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
              else if (isSelected) bgClass = "border-error bg-error/10";
            } else if (isSelected) {
              bgClass = "border-primary-container bg-surface-container-high ring-2 ring-primary-container ring-offset-4 ring-offset-surface shadow-lg";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all transition-colors active:scale-[0.98] text-left",
                  bgClass
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? "bg-primary-container border-primary-container" : "border-outline",
                  isSubmitted && isCorrect && "bg-emerald-500 border-emerald-500"
                )}>
                  {(isSelected || (isSubmitted && isCorrect)) && <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />}
                </div>
                <span className={cn(
                  "font-bold text-sm",
                  isSelected || (isSubmitted && isCorrect) ? "text-on-surface" : "text-on-surface-variant"
                )}>{opt}</span>
              </button>
            )
          })}
        </section>

        {/* Action */}
        <section className="pt-4">
          <button 
            disabled={selectedOption === null}
            onClick={handleSubmit}
            className="w-full h-14 bg-primary-container text-on-primary font-display font-extrabold text-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitted ? (currentIdx < QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz') : 'Submit Answer'}
            <CheckCircle2 size={24} fill="currentColor" />
          </button>
        </section>
      </main>

      <NavigationBar activeTab="task-list" onNavigate={onNavigate} />
    </div>
  );
}
