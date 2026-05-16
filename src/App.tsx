import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserProfile } from './lib/firebase';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import DashboardScreen from './screens/DashboardScreen';
import TaskListScreen from './screens/TaskListScreen';
import SafetyQuizScreen from './screens/SafetyQuizScreen';
import RiskAssessmentScreen from './screens/RiskAssessmentScreen';
import ScoresScreen from './screens/ScoresScreen';
import LogIncidentScreen from './screens/LogIncidentScreen';
import GearChecklistScreen from './screens/GearChecklistScreen';

export type Screen = 
  | 'splash' 
  | 'login'
  | 'onboarding' 
  | 'profile-setup' 
  | 'dashboard' 
  | 'task-list' 
  | 'safety-quiz' 
  | 'risk-assessment' 
  | 'scores' 
  | 'log-incident' 
  | 'gear-checklist';

export type JobType = 'welding' | 'excavation' | 'hv-panel' | 'scaffold' | 'tank' | 'acid' | 'trenching' | 'forklift' | 'crane' | 'conveyor' | 'confined';

interface UserProfile {
  name: string;
  workerId: string;
  workSite: string;
  role: string;
  emergencyContact: string;
  emergencyPhone: string;
  profileImage: string | null;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobType>('welding');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    workerId: '',
    workSite: '',
    role: '',
    emergencyContact: '',
    emergencyPhone: '',
    profileImage: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile as UserProfile);
          if (currentScreen === 'login' || currentScreen === 'splash') {
            setCurrentScreen('dashboard');
          }
        } else {
          if (currentScreen === 'login' || currentScreen === 'splash') {
            setCurrentScreen('onboarding');
          }
        }
      } else {
        if (currentScreen !== 'splash') {
          setCurrentScreen('login');
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        if (!isAuthLoading) {
          setCurrentScreen(currentUser ? 'dashboard' : 'login');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, isAuthLoading, currentUser]);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleUpdateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
    setCurrentScreen('dashboard');
  };

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden bg-grid">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          {currentScreen === 'splash' && <SplashScreen />}
          {currentScreen === 'login' && <LoginScreen onLoginSuccess={() => {}} />}
          {currentScreen === 'onboarding' && <OnboardingScreen onNext={(job) => { setSelectedJob(job); navigate('profile-setup'); }} />}
          {currentScreen === 'profile-setup' && (
            <ProfileSetupScreen 
              onSave={handleUpdateProfile} 
              onBack={() => navigate(userProfile.name ? 'dashboard' : 'onboarding')} 
              initialData={userProfile} 
            />
          )}
          {currentScreen === 'dashboard' && <DashboardScreen onNavigate={navigate} userProfile={userProfile} />}
          {currentScreen === 'task-list' && <TaskListScreen onNavigate={navigate} onSelectTask={setSelectedJob} />}
          {currentScreen === 'safety-quiz' && <SafetyQuizScreen onNavigate={navigate} />}
          {currentScreen === 'risk-assessment' && <RiskAssessmentScreen onNavigate={navigate} />}
          {currentScreen === 'scores' && <ScoresScreen onNavigate={navigate} />}
          {currentScreen === 'log-incident' && <LogIncidentScreen onNavigate={navigate} />}
          {currentScreen === 'gear-checklist' && <GearChecklistScreen onNavigate={navigate} selectedJob={selectedJob} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
