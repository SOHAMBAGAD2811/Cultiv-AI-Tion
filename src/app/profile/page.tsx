"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, Save, User as UserIcon, Mail, MapPin, Globe, LogOut, Camera, Image, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../i18n';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            else resolve(file);
          }, 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const { getSessionSafe } = await import('../utils/auth');
      const session = await getSessionSafe(supabase);
      if (!session) {
        router.push('/signin');
        return;
      }
      setUser(session.user);
      setFullName(session.user.user_metadata?.full_name || '');
      setLocation(session.user.user_metadata?.location || '');
      setLanguage(session.user.user_metadata?.language || 'en');
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    
    let file = e.target.files[0];
    try {
      file = await compressImage(file);
    } catch (error) {
      console.error('Compression error:', error);
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });

      if (updateError) throw updateError;

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      alert('Error updating profile picture');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          let file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          file = await compressImage(file);
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          const mockEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
          handleAvatarFileChange(mockEvent);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { 
        full_name: fullName,
        location,
        language
      }
    });

    if (!error && data.user) {
      setUser(data.user);
    }

    if (!error && language !== i18n.language) {
      i18n.changeLanguage(language);
    }

    setIsSaving(false);

    if (error) {
      alert('Error updating profile');
    } else {
      alert('Profile updated successfully');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision;
          if (city) setLocation(city);
        } catch (error) {
          console.error('Error getting location name', error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error.message);
        setIsLocating(false);
        let errorMessage = 'Unable to retrieve your location';
        if (error.code === 1) errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        else if (error.code === 2) errorMessage = 'Location information is unavailable.';
        else if (error.code === 3) errorMessage = 'Location request timed out.';
        alert(errorMessage);
      },
      { timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title={t('profile_settings', 'Profile Settings')} user={user} />
        
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Edit Profile
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-sm overflow-hidden mb-2">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <UserIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={() => galleryInputRef.current?.click()} className="cursor-pointer flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-md transition-colors">
                    <Image className="w-4 h-4" />
                    <span>Gallery</span>
                  </button>
                  <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="absolute opacity-0 w-0 h-0" />
                  
                  <button type="button" onClick={startCamera} className="cursor-pointer flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-md transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      value={user?.email} 
                      disabled 
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (City/Region)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 pr-24 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 sm:text-sm"
                      placeholder="Enter your location for weather updates"
                    />
                    <button
                      type="button"
                      onClick={handleCurrentLocation}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-green-600 hover:text-green-800"
                      disabled={isLocating}
                    >
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs font-medium">Use Current</span>}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language Preference
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 sm:text-sm"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex justify-center items-center gap-2 bg-white text-red-600 border border-red-200 py-2.5 px-4 rounded-md hover:bg-red-50 transition-colors font-medium shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <button type="button" onClick={stopCamera} className="text-red-600 font-medium flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
              <button type="button" onClick={capturePhoto} className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-700"><Camera className="w-4 h-4" /> Capture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}