"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, Save, User as UserIcon, Mail, MapPin, Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
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

  const handleAvatarUpload = async (url: string) => {
    if (!user) return;
    
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: url }
    });

    if (error) {
      console.error('Error updating profile picture:', error);
    } else {
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: { 
        full_name: fullName,
        location,
        language
      }
    });

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
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title={t('profile_settings')} user={user} />
        
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
                <ProfilePictureUpload 
                  userId={user?.id || ''}
                  url={user?.user_metadata?.avatar_url}
                  onUpload={handleAvatarUpload}
                  size={120}
                />
                <p className="mt-3 text-sm text-gray-500">
                  Click the camera icon to update your photo
                </p>
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
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 sm:text-sm"
                      placeholder="Enter your location for weather updates"
                    />
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
    </div>
  );
}