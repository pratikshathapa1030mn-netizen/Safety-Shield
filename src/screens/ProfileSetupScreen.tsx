import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronDown, Camera } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, saveUserProfile } from '../lib/firebase';

import { TopBar } from '../components/Shell';

interface Props {
  onSave: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export default function ProfileSetupScreen({ onSave, onBack, initialData }: Props) {
  const isEdit = !!initialData.name;
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      await saveUserProfile(user.uid, formData);
      onSave(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onBack={onBack} title={isEdit ? "Edit Profile" : "Profile Setup"} />

      <main className="flex-grow pt-20 pb-10 px-4 flex flex-col max-w-lg mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-container">{isEdit ? "Modify Your Details" : "Set Up Your Profile"}</h1>
          <p className="text-on-surface-variant font-medium mt-1">{isEdit ? "Update your personal and work information" : "Tell us about yourself to get started"}</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />

           {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <button 
              type="button"
              onClick={triggerUpload}
              className="w-24 h-24 rounded-full border-2 border-primary-container bg-surface-container-high flex items-center justify-center overflow-hidden relative group"
            >
              <img 
                className={cn(
                  "w-full h-full object-cover transition-all",
                  formData.profileImage ? "" : "grayscale brightness-75"
                )}
                src={formData.profileImage || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200"}
                alt="Profile"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </button>
            <button 
              type="button" 
              onClick={triggerUpload}
              className="mt-2 text-sm font-bold text-primary-container uppercase tracking-wider"
            >
              {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>

          {/* Worker Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">Worker Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface placeholder:text-outline outline-none transition-colors"
              placeholder="Enter Full Name"
              type="text"
            />
          </div>

          {/* Worker ID */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">Worker ID</label>
            <input 
              required
              value={formData.workerId}
              onChange={(e) => updateField('workerId', e.target.value)}
              className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface placeholder:text-outline outline-none transition-colors"
              placeholder="ID-000000"
              type="text"
            />
          </div>

          {/* Work Site */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">Work Site</label>
            <div className="relative">
              <select 
                required
                value={formData.workSite}
                onChange={(e) => updateField('workSite', e.target.value)}
                className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface appearance-none outline-none transition-colors"
              >
                <option value="" disabled>Select Site</option>
                <option value="alpha">Construction Site Alpha</option>
                <option value="factory">Manufacturing Plant B</option>
                <option value="logistics">Logistics Hub West</option>
                <option value="refinery">Refinery Gamma (Petrochemical)</option>
                <option value="mining">Mining Sector Delta</option>
                <option value="datacenter">Data Center Echo</option>
                <option value="warehouse">Warehouse Omega</option>
                <option value="offshore">Offshore Rig Z-3</option>
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">Role</label>
            <div className="relative">
              <select 
                required
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface appearance-none outline-none transition-colors"
              >
                <option value="" disabled>Select Your Role</option>
                <option value="supervisor">Site Supervisor</option>
                <option value="operator">Machinery Operator</option>
                <option value="safety">Safety Officer</option>
                <option value="electrician">Electrical Engineer</option>
                <option value="auditor">Quality Auditor</option>
                <option value="contractor">General Contractor</option>
                <option value="logistics">Logistics Coordinator</option>
                <option value="technician">HVAC Technician</option>
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">Emergency Contact</label>
            <div className="flex flex-col gap-2">
              <input 
                required
                value={formData.emergencyContact}
                onChange={(e) => updateField('emergencyContact', e.target.value)}
                className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface placeholder:text-outline outline-none transition-colors"
                placeholder="Contact Name"
                type="text"
              />
              <input 
                required
                value={formData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                className="w-full h-12 bg-surface border-2 border-outline focus:border-primary-container rounded-lg px-4 text-on-surface placeholder:text-outline outline-none transition-colors"
                placeholder="Phone Number"
                type="tel"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full h-14 bg-primary-container text-on-primary font-display font-extrabold text-lg rounded-lg mt-4 shadow-lg active:scale-95 transition-all uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
          >
            {isSaving ? 'SAVING...' : (isEdit ? 'UPDATE PROFILE' : 'SAVE & CONTINUE')}
          </button>
        </form>
      </main>
    </div>
  );
}
