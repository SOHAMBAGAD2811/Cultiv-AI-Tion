"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../utils/supabase';
import { Loader2, Mail, Lock, User, Globe, Camera, AlertCircle, Eye, EyeOff, MapPin } from 'lucide-react';

export default function SignupPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
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
        if (error.code === 1) errorMessage = 'Location permission denied. Please allow location access in your browser address bar.';
        else if (error.code === 2) errorMessage = 'Location information is unavailable.';
        else if (error.code === 3) errorMessage = 'Location request timed out.';
        alert(errorMessage);
      },
      { timeout: 10000 }
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign Up User
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            language,
            location,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. Upload Avatar if selected and user created
      if (data.user && avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          
          // 3. Update User Metadata with Avatar URL
          await supabase.auth.updateUser({
            data: { avatar_url: urlData.publicUrl }
          });
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-green-100 mt-2">Join the farming community</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Profile Picture Selection */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-sm overflow-hidden mb-2">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700">
                <Camera className="w-4 h-4" />
                <span>{avatarPreview ? 'Change Photo' : 'Add Photo'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900" placeholder="••••••••" minLength={6} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (City/Region)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full pl-10 pr-24 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900" 
                  placeholder="Enter your location" 
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Language Preference</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 mt-6">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link href="/signin" className="text-green-600 hover:underline font-medium">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}