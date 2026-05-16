import { motion } from 'motion/react';
import { Shield, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface Props {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-surface-container border-2 border-primary-container p-8 rounded-3xl shadow-xl flex flex-col items-center gap-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary shadow-[0_0_30px_rgba(255,214,0,0.3)]">
          <Shield size={48} fill="currentColor" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary-container mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant font-medium">Secure access to Raksha-Kavach safety auditor system.</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full h-14 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-4 hover:brightness-90 active:scale-95 transition-all shadow-md mt-4"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-6 h-6"
          />
          Sign in with Google
        </button>

        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center mt-4">
          By signing in, you agree to site safety protocols.
        </p>
      </motion.div>
    </div>
  );
}
