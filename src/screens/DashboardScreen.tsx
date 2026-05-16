import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, FileQuestion, AlertTriangle, History, Lightbulb, HardHat, LogOut, Shield, User } from 'lucide-react';
import { Screen } from '@/src/App';
import NavigationBar from '../components/Shell';
import { auth, logout, getSafetyAudits } from '../lib/firebase';

interface Props {
  onNavigate: (screen: Screen) => void;
  userProfile: any;
}

export default function DashboardScreen({ onNavigate, userProfile }: Props) {
  const [safetyScore, setSafetyScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      if (auth.currentUser) {
        try {
          const audits = await getSafetyAudits(auth.currentUser.uid);
          if (audits.length > 0) {
            setSafetyScore(100 - audits[0].riskScore);
          } else {
            setSafetyScore(0);
          }
        } catch (error) {
          console.error("Failed to fetch score", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchScore();
  }, []);

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (safetyScore / 100) * circumference;

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Shield className="text-primary-container" size={24} fill="currentColor" />
          <span className="font-display font-black text-lg tracking-tighter text-on-surface">RAKSHA-KAVACH</span>
        </div>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>
      
      <main className="flex-grow pt-20 pb-32 px-4 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Profile Section */}
        <section className="mt-4 bg-surface-container border-2 border-primary-container rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-highest border-2 border-outline-variant overflow-hidden flex items-center justify-center shadow-md">
              {userProfile.profileImage ? (
                <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-primary-container">
                  <Shield size={40} fill="currentColor" />
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-black text-on-surface uppercase tracking-tight">
                  {userProfile.name || 'Worker'}
                </h1>
                <button 
                  onClick={() => onNavigate('profile-setup')}
                  className="p-2.5 rounded-xl bg-surface-container-highest text-primary-container hover:bg-primary-container/10 transition-all active:scale-90 border border-outline-variant"
                  aria-label="Edit Profile"
                >
                  <User size={20} />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-container/10 text-primary-container">
                  <HardHat size={12} />
                  <span>{userProfile.role || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-on-surface-variant/10">
                  <Shield size={12} />
                  <span>ID: {userProfile.workerId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Score Card */}
        <section className="bg-surface-container border-2 border-primary-container rounded-xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-xl font-bold text-primary">Workplace Safety Score</h3>
            <p className="text-sm text-on-surface-variant mt-1">Last updated: 10 mins ago</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-tertiary-container animate-pulse" />
              <span className="text-sm font-bold text-tertiary-container uppercase tracking-wider">Excellent Standing</span>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="text-surface-container-highest"
                cx="48"
                cy="48"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
              />
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary-container"
                cx="48"
                cy="48"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-extrabold text-on-surface">{safetyScore}</span>
          </div>
        </section>

        {/* Action Grid */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { id: 'task-list', label: 'Select Task', icon: ClipboardList, color: 'primary-container' },
            { id: 'safety-quiz', label: 'Safety Quiz', icon: FileQuestion, color: 'tertiary-container' },
            { id: 'log-incident', label: 'Log Incident', icon: AlertTriangle, color: 'error' },
            { id: 'scores', label: 'View History', icon: History, color: 'on-surface-variant' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id as Screen)}
              className="bg-surface-container-high p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 border-l-4 border-transparent hover:border-current active:scale-95 transition-all group"
              style={{ color: `var(--color-${item.color})` }}
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center transition-transform group-hover:scale-110">
                <item.icon size={24} />
              </div>
              <span className="text-sm font-bold text-on-surface">{item.label}</span>
            </button>
          ))}
        </section>

        {/* Safety Tip */}
        <section className="bg-primary-container text-on-primary-container p-6 rounded-xl relative overflow-hidden group">
          <div className="flex items-start gap-4 relative z-10">
            <Lightbulb size={32} fill="currentColor" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-70">Safety Tip of the Day</h4>
              <p className="text-lg font-bold mt-2 leading-tight">
                Always double-check harness attachments before ascending elevated platforms.
              </p>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
            <HardHat size={160} />
          </div>
        </section>

        {/* Visual Context */}
        <section className="rounded-xl overflow-hidden h-48 relative border border-outline-variant shadow-inner">
          <img 
            alt="Industrial context" 
            className="w-full h-full object-cover grayscale opacity-50 contrast-125"
            src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-bold text-on-surface/60 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            Live Site: Area-42
          </div>
        </section>
      </main>

      <NavigationBar activeTab="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
