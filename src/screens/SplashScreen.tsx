import { motion } from 'motion/react';
import { Shield, Construction } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-8">
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary-container text-[#1A1A1A] shadow-[0_0_40px_rgba(255,214,0,0.2)]">
            <Shield size={72} fill="currentColor" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[#1A1A1A]">
              <Construction size={40} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-container mb-4 tracking-tight">
          RAKSHA-KAVACH
        </h1>
        <p className="text-lg text-on-surface font-medium italic opacity-90">
          Your Safety Auditor
        </p>
      </motion.div>

      <div className="fixed bottom-16 left-0 w-full px-4 text-center">
        <div className="max-w-xs mx-auto">
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary-container rounded-full w-1/2"
            />
          </div>
          <p className="mt-4 text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">
            System Initializing
          </p>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-grid" />
    </div>
  );
}
