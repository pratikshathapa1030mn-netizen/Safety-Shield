import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, History, TrendingUp, Trophy, Zap, Clock, Brain, Users, AlertTriangle, Calendar } from 'lucide-react';
import { Screen } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { auth, getSafetyAudits } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function getQuizResults(userId: string) {
  const q = query(
    collection(db, 'quiz_results'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function ScoresScreen({ onNavigate }: Props) {
  const [audits, setAudits] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (auth.currentUser) {
        try {
          const [auditsData, quizzesData] = await Promise.all([
            getSafetyAudits(auth.currentUser.uid),
            getQuizResults(auth.currentUser.uid)
          ]);
          setAudits(auditsData);
          setQuizzes(quizzesData);
        } catch (error) {
          console.error("Failed to fetch stats", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchStats();
  }, []);

  const latestAudit = audits[0];
  const auditScore = latestAudit ? (100 - latestAudit.riskScore) : 0;
  
  const totalQuizScore = quizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions), 0);
  const quizAverage = quizzes.length > 0 ? (totalQuizScore / quizzes.length) * 100 : 0;

  // Composite score: 70% audits, 30% quizzes
  const safetyScore = audits.length > 0 ? Math.round((auditScore * 0.7) + (quizAverage * 0.3)) : (quizzes.length > 0 ? Math.round(quizAverage) : 0);
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (safetyScore / 100) * circumference;

  // Prepare chart data from recent audits
  const displayData = audits.slice(0, 7).reverse().map(a => ({
    name: a.timestamp?.toDate() ? new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(a.timestamp.toDate()).toUpperCase() : '...',
    score: 100 - a.riskScore
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => onNavigate('dashboard')} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-xl mx-auto w-full space-y-8">
        {/* Hero Score Section */}
        <section className="flex flex-col items-center justify-center pt-8">
          <div className="relative w-64 h-64 flex items-center justify-center rounded-full">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="transparent"
                stroke="var(--color-surface-container-highest)"
                strokeWidth="12"
              />
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="128"
                cy="128"
                r="120"
                fill="transparent"
                stroke="var(--color-primary-container)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <p className="text-5xl font-extrabold text-primary-container tabular-nums">{safetyScore}/100</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Current Score</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className={cn(
              "inline-flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm mb-4 shadow-lg transition-colors",
              safetyScore > 80 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              <Trophy size={18} fill="currentColor" />
              {safetyScore > 90 ? 'Safety Champion' : safetyScore > 70 ? 'Competent' : 'Safety Review Required'}
            </div>
          </div>
        </section>

        {/* Breakdown - Based on real user activity */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container border-t-4 border-primary-container p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <Shield size={20} className="text-primary-container" />
              <span className="text-lg font-black text-primary-container">{Math.round(auditScore)}%</span>
            </div>
            <h3 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Audit Avg</h3>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${auditScore}%` }}
                className="h-full bg-primary-container" 
              />
            </div>
          </div>
          <div className="bg-surface-container border-t-4 border-tertiary-container p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <Brain size={20} className="text-tertiary-container" />
              <span className="text-lg font-black text-tertiary-container">{Math.round(quizAverage)}%</span>
            </div>
            <h3 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Quiz Avg</h3>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${quizAverage}%` }}
                className="h-full bg-tertiary-container" 
              />
            </div>
          </div>
        </section>

        {/* Audit History List - NEW Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold">Audit History</h2>
            <span className="text-[10px] font-black bg-surface-container-highest px-2 py-1 rounded uppercase">
              {audits.length} Records
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surface-container animate-pulse rounded-xl" />
              ))}
            </div>
          ) : audits.length === 0 ? (
            <div className="bg-surface-container-low border-2 border-dashed border-outline-variant p-8 rounded-2xl text-center">
              <History size={40} className="mx-auto text-outline opacity-20 mb-3" />
              <p className="text-sm font-bold text-on-surface-variant italic">No safety audits recorded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {audits.map((audit) => (
                <div 
                  key={audit.id} 
                  className="bg-surface-container border border-outline-variant p-4 rounded-xl flex items-center justify-between group hover:border-primary-container transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      audit.riskScore === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-error/10 text-error"
                    )}>
                      {audit.riskScore === 0 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-on-surface uppercase tracking-tight line-clamp-1">
                        {audit.taskName || 'Safety Audit'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-on-surface-variant" />
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          {audit.timestamp?.toDate() ? new Intl.DateTimeFormat('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }).format(audit.timestamp.toDate()) : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-xl font-black italic tracking-tighter",
                      audit.riskScore === 0 ? "text-emerald-500" : "text-error"
                    )}>
                      {100 - audit.riskScore}%
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Score</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Weekly Trend Chart */}
        <section className="bg-surface-container p-6 rounded-xl space-y-6 shadow-md border border-outline-variant">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Performance Trend</h2>
            <div className="flex items-center gap-1 text-primary-container font-bold text-sm">
              <TrendingUp size={16} />
              Recent Progress
            </div>
          </div>
          
          <div className="h-48 w-full flex items-center justify-center relative">
            {displayData.length === 0 ? (
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto text-outline opacity-20 mb-2" />
                <p className="text-xs font-bold text-on-surface-variant italic">No trend data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-container-highest p-2 rounded border border-outline-variant shadow-xl">
                            <p className="text-[10px] font-black text-white">{payload[0].value}% Safety</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                    {displayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.score >= 80 ? 'var(--color-emerald-500)' : entry.score >= 50 ? 'var(--color-amber-500)' : 'var(--color-error)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </main>

      <NavigationBar activeTab="scores" onNavigate={onNavigate} />
    </div>
  );
}
