"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase';
import { Session, User } from '@supabase/supabase-js'; // Import Supabase types
import { useTranslation } from 'react-i18next';
import { Menu, LogIn, X, Bell, CloudSun, Bug, ClipboardCheck, Loader2, LogOut, User as UserIcon } from 'lucide-react'; // Added LogOut & UserIcon

import { getRecommendations } from '../lib/recommendations';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}
interface HeaderProps {
  isOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  user?: User | null;
}

export default function Header({ isOpen, setSidebarOpen, title, user: propUser }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [isInsightsOpen, setInsightsOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const insightsRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // --- Auth State ---
  const [session, setSession] = useState<Session | null>(null);
  const [internalUser, setInternalUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient()); // Initialize Supabase client

  const user = propUser || internalUser;

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInternalUser(session?.user || null);
    });

    // Fetch initial session on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInternalUser(session?.user || null);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false); // Close menu on sign out
    // The onAuthStateChange listener will automatically update the state
  };

  const getUserDisplayName = () => {
    if (user) {
      // Prioritize user_metadata.name if available
      if (user.user_metadata && user.user_metadata.name) {
        return (user.user_metadata.name as string).charAt(0).toUpperCase();
      }
      // Fallback to email initial
      if (user.email) return user.email.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial if no user or name/email found
  };

  const getUserFullName = () => {
    if (user) {
      if (user.user_metadata && user.user_metadata.name) {
        return user.user_metadata.name as string;
      }
    }
    return 'User'; // Fallback name
  };

  // --- Fetch Weather Data on user login ---
  useEffect(() => {
    async function fetchWeather() {
      if (!user) return; // Fetch only if user is logged in

      setWeatherLoading(true);
      try {
        // Get user's location from their profile, with a fallback.
        const userLocation = user.user_metadata?.location as string || 'Pune';
        const response = await fetch(`/api/weather?location=${encodeURIComponent(userLocation)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error(error);
        // Optionally set an error state to show in the UI
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, [user ? `${user.id}-${user.user_metadata?.location}` : '']); // Rerun when user updates

  // --- Close pop-up when clicking outside ---
  useEffect(() => { function handleClickOutside(event: MouseEvent) {
    // Close insights pop-up
    if (isInsightsOpen && insightsRef.current && !insightsRef.current.contains(event.target as Node)) {
      setInsightsOpen(false);
    }
    // Close profile menu
    if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
      setProfileMenuOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside); }, [isInsightsOpen, isProfileMenuOpen]);
  
  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'mr', name: 'MR' },
    { code: 'hi', name: 'HI' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get dynamic recommendations based on weather
  const recommendations = getRecommendations(weatherData);

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)} 
          className="text-gray-600 hover:text-gray-900"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="min-w-0"> {/* Added min-w-0 to allow text to shrink */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate sm:whitespace-nowrap">{t(title)}</h2>
          <p className="text-xs text-gray-500 hidden sm:block">{currentDate}</p>
        </div>
      </div>

      {/* --- Container for the right-side controls --- */}
      <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4" ref={insightsRef}>
          {/* Insights/Notifications Pop-up */}
        <div className="relative">
          <button
            onClick={() => setInsightsOpen(prev => !prev)}
            aria-label={t('sidebar_alerts')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          {isInsightsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-gray-800">{t('notifications_title')}</h4>
              </div>
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Weather Alert */}
                {weatherLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                  </div>
                ) : weatherData ? (
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full"><CloudSun className="w-4 h-4 text-blue-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Weather in {weatherData.location}: {Math.round(weatherData.temperature)}°C</p>
                      <p className="text-xs text-gray-500">{weatherData.description}, {weatherData.humidity}% humidity</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                     <div className="bg-gray-100 p-2 rounded-full"><CloudSun className="w-4 h-4 text-gray-400" /></div>
                     <div>
                       <p className="text-sm font-medium text-gray-500">Could not load weather</p>
                       <p className="text-xs text-gray-400">Please try again later.</p>
                     </div>
                   </div>
                )}
                {/* Pest Alert */}
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full"><Bug className="w-4 h-4 text-red-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t(recommendations.pest.title)}</p>
                    <p className="text-xs text-gray-500">{t(recommendations.pest.description)}</p>
                  </div>
                </div>
                {/* Seasonal Task */}
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full"><ClipboardCheck className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t(recommendations.seasonal.title)}</p>
                    <p className="text-xs text-gray-500">{t(recommendations.seasonal.description)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              aria-label={`Change language to ${lang.code}`}
              className={`w-8 h-8 rounded-full text-xs font-medium transition flex items-center justify-center ${i18n.language === lang.code ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Auth Buttons - Conditional Rendering */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium text-gray-700">{getUserFullName()}</span>
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors overflow-hidden"
                aria-label="Open user menu"
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getUserDisplayName()
                )}
              </button>
            </div>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-[192px] sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <Link
                    href="/profile" // NOTE: You will need to create this page
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/signin" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <LogIn className="w-4 h-4" />
            <span>{t('sign_in_button')}</span>
          </Link>
        )}
      </div>
    </header>
  );
}