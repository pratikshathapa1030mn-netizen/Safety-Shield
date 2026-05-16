import React, { useState, useRef } from 'react';
import { Shield, MapPin, Camera, X, Check, Flag } from 'lucide-react';
import { Screen } from '@/src/App';
import { TopBar } from '../components/Shell';
import NavigationBar from '../components/Shell';
import { cn } from '@/src/lib/utils';
import { auth, logIncident } from '../lib/firebase';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const BODY_PARTS = ['Head', 'Hands', 'Back', 'Legs', 'Eyes', 'Arms', 'Torso'];

export default function LogIncidentScreen({ onNavigate }: Props) {
  const [selectedBodyParts, setSelectedBodyParts] = useState<Set<string>>(new Set(['Hands']));
  const [severity, setSeverity] = useState('Critical');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Sector 7 - Welding Zone');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [incidentType, setIncidentType] = useState('Accident');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePart = (part: string) => {
    const next = new Set(selectedBodyParts);
    if (next.has(part)) next.delete(part);
    else next.add(part);
    setSelectedBodyParts(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidenceImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      await logIncident({
        userId: user.uid,
        type: incidentType,
        description,
        location,
        severity,
        affectedBodyParts: Array.from(selectedBodyParts),
        evidenceImages,
        dateTime: `${date}T${time}`,
      });
      onNavigate('dashboard');
    } catch (error) {
      console.error("Error logging incident:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={() => onNavigate('dashboard')} />
      
      <main className="flex-grow pt-20 pb-32 px-4 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-on-surface">Report Incident</h2>
          <p className="text-on-surface-variant font-medium mt-1">Ensure all critical safety data is captured accurately.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Incident Type */}
          <section className="bg-surface-container p-6 rounded-xl border-l-4 border-primary-container shadow-md">
            <h3 className="text-xs font-bold text-primary-fixed-dim mb-4 uppercase tracking-widest">Incident Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Accident', 'Near-Miss'].map((type) => (
                <label key={type} className="flex items-center gap-3 p-4 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container-highest transition-all group border-2 border-transparent has-[:checked]:border-primary-container shadow-sm">
                  <div className="relative flex items-center justify-center">
                    <input name="type" type="radio" checked={incidentType === type} onChange={() => setIncidentType(type)} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary-container peer-checked:bg-primary-container transition-all" />
                    <div className="absolute w-2 h-2 rounded-full bg-on-primary scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="font-bold text-on-surface">{type}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Date & Time</label>
              <div className="flex gap-2">
                <input required value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-surface-container-high border-2 border-outline rounded-xl px-4 h-12 text-on-surface focus:border-primary-container outline-none transition-all" type="date" />
                <input required value={time} onChange={(e) => setTime(e.target.value)} className="w-32 bg-surface-container-high border-2 border-outline rounded-xl px-4 h-12 text-on-surface focus:border-primary-container outline-none transition-all" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Location / Zone</label>
              <div className="relative">
                <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-surface-container-high border-2 border-outline rounded-xl pl-12 pr-4 h-12 text-on-surface focus:border-primary-container outline-none transition-all placeholder:text-outline/50" placeholder="e.g. Warehouse Sector B" type="text" />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Detailed Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface-container-high border-2 border-outline rounded-xl p-4 text-on-surface focus:border-primary-container outline-none transition-all placeholder:text-outline/50 min-h-[120px]" placeholder="Describe the sequence of events leading to the incident..." rows={4} />
          </section>

          {/* Severity */}
          <section>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 mb-4 block">Severity Level</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Minor', color: '#4CAF50' },
                { label: 'Moderate', color: '#FFC107' },
                { label: 'Major', color: '#FF9800' },
                { label: 'Critical', color: '#F44336' }
              ].map((lvl) => (
                <button
                  key={lvl.label}
                  type="button"
                  onClick={() => setSeverity(lvl.label)}
                  className={cn(
                    "flex-grow md:flex-grow-0 px-6 h-12 rounded-full font-bold text-sm transition-all border-2",
                    severity === lvl.label 
                      ? "border-white shadow-lg scale-105" 
                      : "border-transparent opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: lvl.color, color: lvl.label === 'Minor' ? '#000' : (lvl.label === 'Moderate' ? '#000' : '#fff') }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </section>

          {/* Body Parts */}
          <section>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 mb-4 block">Affected Body Part(s)</label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((part) => {
                const isSelected = selectedBodyParts.has(part);
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => togglePart(part)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border-2 transition-all",
                      isSelected 
                        ? "bg-primary-container text-on-primary-container border-primary-container" 
                        : "bg-surface-container-highest border-outline-variant text-on-surface"
                    )}
                  >
                    {part}
                    {isSelected ? <Check size={14} /> : <span className="opacity-40">+</span>}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Evidence */}
          <section className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
              multiple
            />
            
            {evidenceImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {evidenceImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-outline-variant">
                    <img src={img} className="w-full h-full object-cover" alt="Evidence" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              type="button"
              onClick={triggerUpload}
              className="w-full bg-surface-container-low border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-outline group-hover:text-primary-container transition-colors">
                <Camera size={32} />
              </div>
              <p className="font-bold text-on-surface">Attach Evidence / Photo</p>
              <p className="text-sm text-on-surface-variant mt-1">Maximum file size: 10MB (JPG, PNG)</p>
            </button>
          </section>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full h-14 bg-primary-container text-on-primary font-display font-extrabold text-lg rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Submitting...' : 'Submit Report'}
            </button>
            <button 
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full h-14 bg-transparent border-2 border-outline text-on-surface font-bold rounded-xl uppercase tracking-widest active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      <NavigationBar activeTab="task-list" onNavigate={onNavigate} />
    </div>
  );
}
