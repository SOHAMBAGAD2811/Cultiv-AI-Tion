"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase';

interface UserMetadata {
  name?: string;
  farm_location?: string;
  farm_bbox?: number[];
  [key: string]: any;
}

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Loader2, KeyRound, User as UserIcon, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  // Component State
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Feedback State
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProfileSaving, setProfileSaving] = useState(false);
  const [isPasswordSaving, setPasswordSaving] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState('');
  const [farmBbox, setFarmBbox] = useState<number[] | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin'); // Redirect to sign-in if not authenticated
      } else {
        setUser(session.user);
        const metadata: UserMetadata = session.user.user_metadata;
        setName(metadata.name || '');
        setLocation(metadata.farm_location || '');
        setFarmBbox(metadata.farm_bbox || null);
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { 
        name, 
        farm_location: location,
        farm_bbox: farmBbox },
    });

    if (error) {
      setProfileMessage({ type: 'error', text: error.message });
    } else {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setProfileSaving(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationMessage('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const radius = 0.01; // Approx 1.1km radius
        const bbox = [
          longitude - radius,
          latitude - radius,
          longitude + radius,
          latitude + radius,
        ];
        setFarmBbox(bbox); // Update state locally
        setLocationStatus('success');
        setLocationMessage('Location captured! Click "Save Changes" to update.');
      },
      (error) => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. Please enable it in your browser settings.');
        } else {
          setLocationMessage('Could not get your location. Please try again.');
        }
      }
    );
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordSaving(false);
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
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title="Profile" />
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Profile Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <UserIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Farm Location</label>
                   <div className="mt-1 relative rounded-md shadow-sm">
                    <MapPin className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Pune, Maharashtra"
                    />
                  </div>
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationStatus === 'loading'}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {locationStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                      Update with Current Location
                    </button>
                    {locationMessage && <div className={`text-xs p-2 rounded-md flex items-center gap-2 ${locationStatus === 'success' ? 'bg-green-100 text-green-800' : ''} ${locationStatus === 'error' ? 'bg-red-100 text-red-800' : ''} ${locationStatus === 'loading' ? 'bg-blue-100 text-blue-800' : ''}`}>
                      {locationStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                      {locationStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
                      {locationMessage}
                    </div>}
                  </div>
                </div>
                {profileMessage && (
                  <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{profileMessage.text}</p>
                )}
                <button type="submit" disabled={isProfileSaving} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                  {isProfileSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <KeyRound className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                    <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="New password" />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <KeyRound className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                    <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Confirm new password" />
                  </div>
                </div>
                {passwordMessage && (
                  <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>
                )}
                <button type="submit" disabled={isPasswordSaving} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                  {isPasswordSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}