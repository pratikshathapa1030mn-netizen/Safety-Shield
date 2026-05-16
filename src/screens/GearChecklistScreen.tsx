import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import Lottie from 'lottie-react';
import { Shield, AlertTriangle, Accessibility, CheckCircle2, Circle, AlertCircle, HardHat, ClipboardCheck, Footprints, Ear, Wind, Shirt, Zap } from 'lucide-react';
import { Screen, JobType } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';
import { auth, logTaskCompletion } from '../lib/firebase';

interface Props {
  onNavigate: (screen: Screen) => void;
  selectedJob: JobType;
}

const CHECK_ANIMATION_URL = "https://lottie.host/8040d75a-0746-47ce-802c-567c29377a06/Q5T02sB6lB.json";
const SCAN_ANIMATION_URL = "https://lottie.host/df2525e1-8854-44d4-a745-f370a2599723/BBy9N98O9V.json";
const EXPLAIN_ANIMATION_URL = "https://lottie.host/e2ba8c89-2396-4195-9279-786d34e97864/2p3V99Xy3S.json";

const WELDING_GEAR = [
  { id: 'helmet', label: 'Welding Helmet', icon: HardHat },
  { id: 'gloves', label: 'Heat-Resistant Gloves', icon: Shield },
  { id: 'apron', label: 'Leather Apron', icon: Shirt },
  { id: 'fume', label: 'Fume Extractor', icon: Wind },
  { id: 'extinguisher', label: 'Fire Extinguisher', icon: AlertCircle },
];

const GENERAL_CONSTRUCTION_GEAR = [
  { id: 'helmet', label: 'Safety Helmet', icon: HardHat },
  { id: 'vest', label: 'High-Vis Vest', icon: Shirt },
  { id: 'boots', label: 'Steel-Toe Boots', icon: Footprints },
  { id: 'ear', label: 'Ear Protection', icon: Ear },
  { id: 'mask', label: 'N95 Dust Mask', icon: Wind },
];

const ELECTRICAL_GEAR = [
  { id: 'helmet', label: 'Arc Flash Shield', icon: HardHat },
  { id: 'gloves', label: 'Insulated Gloves', icon: Shield },
  { id: 'boots', label: 'Dielectric Boots', icon: Footprints },
  { id: 'tester', label: 'Voltage Tester', icon: Zap },
  { id: 'mat', label: 'Rubber Matting', icon: Shield },
];

const HAZMAT_GEAR = [
  { id: 'suit', label: 'Level A Hazmat Suit', icon: Shirt },
  { id: 'respirator', label: 'SCBA Respirator', icon: Wind },
  { id: 'gloves', label: 'Chemical Gloves', icon: Shield },
  { id: 'monitor', label: 'Gas Monitor', icon: AlertCircle },
  { id: 'boots', label: 'Acid-Resistant Boots', icon: Footprints },
];

const LOGISTICS_GEAR = [
  { id: 'vest', label: 'High-Vis Vest', icon: Shirt },
  { id: 'boots', label: 'Composite Toe Boots', icon: Footprints },
  { id: 'gloves', label: 'Grip Gloves', icon: Shield },
  { id: 'helmet', label: 'Bump Cap', icon: HardHat },
];

const HEIGHTS_GEAR = [
  { id: 'harness', label: 'Full Body Harness', icon: Shirt },
  { id: 'lanyard', label: 'Self-Retracting Lanyard', icon: Shield },
  { id: 'helmet', label: 'Climbing Helmet', icon: HardHat },
  { id: 'anchor', label: 'Anchor Connector', icon: AlertCircle },
];

export default function GearChecklistScreen({ onNavigate, selectedJob }: Props) {
  const gearItems = useMemo(() => {
    switch (selectedJob) {
      case 'welding': 
        return WELDING_GEAR;
      case 'hv-panel':
      case 'conveyor':
        return ELECTRICAL_GEAR;
      case 'scaffold':
      case 'crane':
        return HEIGHTS_GEAR;
      case 'tank':
      case 'acid':
      case 'confined':
        return HAZMAT_GEAR;
      case 'forklift':
        return LOGISTICS_GEAR;
      case 'trenching':
      default:
        return GENERAL_CONSTRUCTION_GEAR;
    }
  }, [selectedJob]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isFinishing, setIsFinishing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnim, setScanAnim] = useState<any>(null);
  const [checkAnim, setCheckAnim] = useState<any>(null);
  const [explainAnim, setExplainAnim] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [riskPercentage, setRiskPercentage] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasRequestedCamera, setHasRequestedCamera] = useState(false);
  const [hasScannedAtLeastOnce, setHasScannedAtLeastOnce] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    fetch(SCAN_ANIMATION_URL).then(res => res.json()).then(setScanAnim).catch(e => console.error(e));
    fetch(CHECK_ANIMATION_URL).then(res => res.json()).then(setCheckAnim).catch(e => console.error(e));
    fetch(EXPLAIN_ANIMATION_URL).then(res => res.json()).then(setExplainAnim).catch(e => console.error(e));
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setHasRequestedCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
        } 
      });
      setStream(mediaStream);
      setIsScanning(true);
      // Automatically trigger first scan
      setTimeout(captureAndAnalyze, 2000);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setCameraError("Camera access was denied. Please check your browser's site settings and grant permission to use the AI scanner.");
        } else if (err.name === 'NotFoundError') {
          setCameraError("No camera device found. Please ensure your device has a working camera.");
        } else {
          setCameraError("Unable to access camera. Please refresh and try again.");
        }
      } else {
        setCameraError("Camera access denied or not available. Please ensure permissions are granted.");
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // We no longer auto-start camera here to give user context first
    return () => stopCamera();
  }, []);

  const progress = (checkedItems.size / gearItems.length) * 100;
  const isComplete = checkedItems.size === gearItems.length;

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isAnalyzing || !isScanning) return;

    setIsAnalyzing(true);
    setHasScannedAtLeastOnce(true);
    try {
      const video = videoRef.current;
      if (video.readyState < 2) return; 
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.6);

      const response = await fetch('/api/analyze-gear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData, 
          gearItems: gearItems.map(g => ({ id: g.id, label: g.label })) 
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const result = await response.json();
      
      if (result.detected) {
        // One-by-one detection animation
        const newDetections = result.detected.filter((id: string) => !checkedItems.has(id));
        for (const id of newDetections) {
          await new Promise(r => setTimeout(r, 600));
          setCheckedItems(prev => new Set([...prev, id]));
        }
      }
      
      if (result.description) {
        setLastAnalysis(result.description);
      }
      if (result.riskPercentage !== undefined) {
        setRiskPercentage(result.riskPercentage);
      }
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && !isComplete) {
      interval = setInterval(() => {
        if (!isAnalyzing) captureAndAnalyze();
      }, 10000); // Analyze every 10 seconds to allow for sequence
      
      return () => clearInterval(interval);
    }
  }, [isScanning, isComplete, isAnalyzing]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setIsAnalyzing(false);
  };

  const toggleItem = (id: string) => {
    // Discourage manual checking, but keep for emergencies
    if (window.confirm("Manual override requires supervisor approval. Proceed?")) {
      const next = new Set(checkedItems);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setCheckedItems(next);
    }
  };

  const handleFinishAudit = async () => {
    stopCamera();
    const user = auth.currentUser;
    if (!user) return;

    setIsFinishing(true);
    try {
      await logTaskCompletion({
        userId: user.uid,
        taskId: `${selectedJob}-audit-` + Date.now(),
        taskName: `${selectedJob.charAt(0).toUpperCase() + selectedJob.slice(1)} Gear Audit`,
        checklist: Array.from(checkedItems),
        riskScore: isComplete ? 0 : (riskPercentage || 80),
      });
      onNavigate('safety-quiz');
    } catch (error) {
      console.error("Error logging task:", error);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => { stopCamera(); onNavigate('task-list'); }} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-xl mx-auto w-full">
        {/* Permit Header */}
        <section className="bg-surface-container border-l-4 border-primary-container p-4 rounded-xl mb-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-[0.15em]">Current Permit</p>
              <h2 className="text-2xl font-extrabold uppercase text-on-surface">{selectedJob} Work</h2>
            </div>
            <div className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <AlertTriangle size={14} fill="currentColor" />
              HIGH RISK
            </div>
          </div>
        </section>

        {/* Scanner Preview */}
        <section className="grid grid-cols-12 gap-4 mb-6 bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant shadow-lg">
          <div className="col-span-12 flex items-center justify-center p-0 bg-black relative overflow-hidden group h-[560px]">
            {isScanning ? (
              <div className="w-full h-full relative">
                <video 
                  ref={(el) => {
                    if (el && stream && el.srcObject !== stream) {
                      el.srcObject = stream;
                      el.play().catch(e => console.error("Video play error:", e));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  onCanPlay={(e) => {
                    (e.target as HTMLVideoElement).play().catch(e => console.error("OnCanPlay error:", e));
                  }}
                  className="w-full h-full object-cover bg-black"
                />
                <div className="absolute inset-0 pointer-events-none">
                  {/* Technology Corners */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-primary-container z-20" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-primary-container z-20" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-primary-container z-20" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-primary-container z-20" />

                  {/* Risk Alert Overlay */}
                  {!isComplete && hasScannedAtLeastOnce && (
                    <motion.div 
                      key="risk-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0.1, 0.2 + (riskPercentage / 200), 0.1],
                      }}
                      transition={{ 
                        duration: Math.max(0.5, 2 - (riskPercentage / 50)), 
                        repeat: Infinity 
                      }}
                      className="absolute inset-0 bg-error/40 z-0 pointer-events-none shadow-[inset_0_0_100px_rgba(239,68,68,0.5)]"
                    />
                  )}

                  {/* Scanning Line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-primary-container/40 shadow-[0_0_15px_rgba(255,214,0,0.8)] z-10"
                  />

                  {/* Warning Legend */}
                  {!isComplete && hasScannedAtLeastOnce && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 w-full px-8 pointer-events-none">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1 + (riskPercentage / 1000), 1],
                          backgroundColor: ['rgba(185, 28, 28, 0.95)', 'rgba(239, 68, 68, 0.95)', 'rgba(185, 28, 28, 0.95)']
                        }}
                        transition={{ 
                          duration: Math.max(0.4, 1.2 - (riskPercentage / 100)), 
                          repeat: Infinity 
                        }}
                        className="text-white px-6 py-6 rounded-3xl flex flex-col items-center gap-4 shadow-[0_30px_60px_rgba(185,28,28,0.5)] border-2 border-white/20 backdrop-blur-xl max-w-sm w-full"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={32} fill="currentColor" className="text-white animate-bounce" />
                            <span className="font-black text-2xl uppercase tracking-tighter">STOP WORK</span>
                          </div>
                          <span className="text-[10px] font-black bg-white text-error px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Risk Level: {riskPercentage}%
                          </span>
                        </div>
                        
                        <div className="h-[2px] w-full bg-white/20" />
                        
                        <div className="flex flex-col gap-3 w-full">
                          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest text-center">Missing PPE Protocol:</p>
                          <div className="flex flex-col gap-2">
                            {gearItems.filter(i => !checkedItems.has(i.id)).map(item => (
                              <motion.div 
                                key={`alert-${item.id}`} 
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-3 bg-black/20 px-4 py-3 rounded-xl border border-white/10"
                              >
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_rgba(239,68,68,1)]" />
                                <span className="text-sm font-black uppercase text-white tracking-tight">
                                  {item.label}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-[12px] text-white font-black uppercase tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center"
                      >
                        Action Required Immediately
                      </motion.div>
                    </div>
                  )}

                  {/* AI Detection Labels Overlay */}
                  <div className="absolute inset-0 z-20 overflow-hidden">
                    {gearItems.map((item, idx) => (
                      checkedItems.has(item.id) && (
                        <motion.div
                          key={`label-${item.id}`}
                          initial={{ opacity: 0, scale: 0.5, x: idx % 2 === 0 ? -20 : 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          className="absolute bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-sm px-3 py-1.5 rounded text-[10px] font-black text-emerald-400 uppercase tracking-tighter shadow-lg z-20"
                          style={{
                            top: `${30 + (idx * 12)}%`,
                            left: idx % 2 === 0 ? '10%' : '50%'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            {item.label} SECURE
                          </div>
                        </motion.div>
                      )
                    ))}
                  </div>

                  {/* Success Overlay */}
                  {isComplete && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/40 backdrop-blur-md"
                    >
                      <motion.div
                        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-48 h-48 mb-6"
                      >
                        {checkAnim && (
                          <Lottie 
                            animationData={checkAnim} 
                            loop={false}
                            style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5))' }}
                          />
                        )}
                      </motion.div>
                      
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center px-8"
                      >
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                          Audit Certified
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="h-[2px] w-8 bg-emerald-500" />
                          <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.3em]">
                            100% Compliant
                          </p>
                          <div className="h-[2px] w-8 bg-emerald-500" />
                        </div>
                        <p className="text-white/70 text-sm font-medium italic">
                          "{lastAnalysis || 'Safety standard MET'}"
                        </p>
                      </motion.div>

                      {/* Glowing Ring */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 border-[20px] border-emerald-500/30 rounded-none pointer-events-none"
                      />
                    </motion.div>
                  )}

                  {/* Missing Gear Pulse */}
                  <div className="absolute bottom-20 left-6 z-20 flex flex-col gap-2">
                    {gearItems.filter(i => !checkedItems.has(i.id)).map((item) => (
                      <div key={`missing-${item.id}`} className="flex items-center gap-2 bg-error/20 border border-error/50 backdrop-blur-md px-3 py-1 rounded text-[9px] font-bold text-error uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                        SCANNING FOR {item.label}...
                      </div>
                    ))}
                  </div>

                  {/* Lottie Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 z-10 pointer-events-none">
                    {scanAnim && (
                      <Lottie 
                        style={{ width: '80%', height: '80%' }}
                        animationData={scanAnim} 
                        loop={true}
                      />
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-40">
                  <button 
                    onClick={captureAndAnalyze}
                    disabled={isAnalyzing}
                    className={cn(
                      "flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                      isAnalyzing ? "opacity-50 scale-95" : "hover:scale-105 active:scale-95"
                    )}
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Accessibility size={16} />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Manual Scan'}
                  </button>
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl backdrop-blur-md z-30 border border-white/10">
                  <div className={cn("w-2.5 h-2.5 rounded-full", isAnalyzing ? "bg-amber-400 animate-bounce" : (!isComplete ? "bg-error animate-pulse" : "bg-emerald-500"))} />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    {isAnalyzing ? 'Vision Engine Active' : (!isComplete ? 'Waiting for Clear View' : 'Audit Certified')}
                  </span>
                </div>
              </div>
            ) : cameraError ? (
              <div className="flex flex-col items-center justify-center gap-4 text-outline p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error border-2 border-error/20">
                  <AlertCircle size={48} />
                </div>
                <div className="max-w-[240px]">
                  <p className="font-bold text-on-surface text-lg">Permission Denied</p>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="mt-4 p-3 bg-surface-container-highest rounded-lg text-left">
                    <p className="text-[10px] font-black uppercase text-outline tracking-widest mb-1">How to fix:</p>
                    <p className="text-[10px] text-on-surface-variant">Click the camera icon in your address bar and select 'Allow' to enable scanning.</p>
                  </div>
                </div>
              </div>
            ) : !hasRequestedCamera ? (
              <div className="flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-500 w-full h-full bg-surface-container-highest/5">
                <div className="w-full h-72 flex items-center justify-center -mb-8">
                  {explainAnim ? (
                    <div className="w-full h-full max-w-[320px]">
                      <Lottie 
                        animationData={explainAnim} 
                        loop={true}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-primary-container/10 flex items-center justify-center text-primary-container border-2 border-primary-container/20">
                      <Accessibility size={56} />
                    </div>
                  )}
                </div>
                
                <div className="max-w-[320px] flex flex-col items-center z-10">
                  <p className="text-sm text-on-surface font-black uppercase tracking-[0.2em] mb-8 opacity-60">
                    Stand 2 meters back
                  </p>
                  
                  <button 
                    onClick={startCamera}
                    className="w-full bg-primary-container text-on-primary-container px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-on-primary-container/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Accessibility size={24} />
                    </div>
                    <span className="text-xl">Begin Scan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-outline p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Accessibility size={48} className="text-outline" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Initializing Vision Engine...</p>
                  <p className="text-xs text-on-surface-variant mt-1">Stand by for camera activation</p>
                </div>
              </div>
            )}
            
            {(isScanning || cameraError) && (
              <button 
                onClick={isScanning ? stopCamera : startCamera}
                className={cn(
                  "absolute bottom-4 right-4 px-6 h-12 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 transition-all active:scale-95 z-20",
                  isScanning 
                    ? "bg-surface-container-highest text-on-surface border border-outline" 
                    : "bg-primary-container text-on-primary-container hover:brightness-110 shadow-primary-container/20"
                )}
              >
                <Shield size={18} className={cn(!isScanning && "animate-pulse")} />
                {isScanning ? 'Stop Scanning' : 'Retry Permissions'}
              </button>
            )}
          </div>
          
          <div className="col-span-12 p-6 flex flex-col justify-center bg-surface-container-high/50 border-t border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold">Safety Verification</h3>
            </div>
            
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Use the Raksha-Kavach AI vision system to verify that all PPE is correctly worn.
            </p>

            {lastAnalysis && (
              <div className="bg-primary-container/5 border border-primary-container/20 p-3 rounded-lg mb-4">
                <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-1">AI Observation</p>
                <p className="text-xs text-on-surface leading-tight italic">"{lastAnalysis}"</p>
                {riskPercentage > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-error transition-all duration-1000" 
                        style={{ width: `${riskPercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-error whitespace-nowrap">{riskPercentage}% RISK</span>
                  </div>
                )}
              </div>
            )}

            {suggestions.length > 0 && !isComplete && (
              <div className="bg-error/5 border border-error/20 p-3 rounded-lg mb-4 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-error" />
                  <p className="text-[10px] font-black text-error uppercase tracking-widest">Correction Required</p>
                </div>
                <ul className="space-y-1.5">
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="text-[11px] text-on-surface-variant flex gap-2">
                      <span className="text-error">•</span>
                      <span className="leading-tight">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {isComplete ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 flex items-center gap-4"
              >
                <div className="w-12 h-12">
                  {checkAnim && (
                    <Lottie 
                      animationData={checkAnim} 
                      loop={false}
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">Scan Complete</p>
                  <p className="text-xs text-emerald-500/80">Worker is fully compliant</p>
                </div>
              </motion.div>
            ) : (
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-outline-variant uppercase tracking-widest">
                  <span>Audit Confidence</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn(
                      "h-full transition-all duration-500",
                      isComplete ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-primary-container shadow-[0_0_10px_rgba(255,214,0,0.5)]"
                    )}
                  />
                </div>
                {!isComplete && (
                  <div className="mt-2 text-[10px] text-error font-bold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle size={12} />
                    PPE DEFICIENCY DETECTED - CORRECT IMMEDIATELY
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Checklist */}
        <section className="space-y-2 mb-8">
          <h3 className="text-[10px] font-bold text-on-surface-variant px-1 mb-3 uppercase tracking-widest">Required Safety Gear</h3>
          
          {gearItems.map((item) => {
            const isChecked = checkedItems.has(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all transition-colors active:scale-[0.98]",
                  isChecked 
                    ? "bg-surface-container border-primary-container shadow-md" 
                    : "bg-surface border-outline-variant hover:border-outline opacity-80"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isChecked ? "bg-primary-container/10 text-primary-container" : "bg-surface-container-highest text-on-surface-variant"
                  )}>
                    <Icon size={20} />
                  </div>
                  <span className={cn(
                    "font-bold",
                    isChecked ? "text-on-surface" : "text-on-surface-variant"
                  )}>{item.label}</span>
                </div>
                
                {isChecked ? (
                  <CheckCircle2 size={32} fill="currentColor" className="text-primary-container" />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-outline-variant" />
                )}
              </button>
            )
          })}
        </section>

        {/* Progress */}
        <section className="bg-surface-container-high p-4 rounded-xl mb-6 border border-primary-container/20 shadow-inner">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Compliance</span>
            <span className="text-lg font-bold text-primary-container">
              {checkedItems.size} of {gearItems.length} checked
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-primary-container h-full" 
            />
          </div>
        </section>


        <button 
          onClick={handleFinishAudit}
          disabled={isFinishing || !isComplete}
          className="w-full bg-primary-container text-on-primary font-display font-extrabold text-lg h-14 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
        >
          {isFinishing ? (
            'LOGGING AUDIT...'
          ) : (
            <>
              <ClipboardCheck size={20} />
              FINISH & LOG AUDIT
            </>
          )}
        </button>
        
        <button 
          onClick={() => onNavigate('risk-assessment')}
          className="w-full mt-4 bg-transparent border-2 border-outline text-on-surface font-bold h-14 rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container transition-all"
        >
          <AlertCircle size={20} />
          VIEW RISK ASSESSMENT
        </button>
      </main>

      <NavigationBar activeTab="task-list" onNavigate={onNavigate} />
    </div>
  );
}
