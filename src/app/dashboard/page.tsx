"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Sun, Cloud, CloudRain, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '@supabase/supabase-js';
 
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { createClient } from '../utils/supabase';
import '../i18n';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

interface LearningVideo {
  title: string;
  youtubeVideoId: string;
  duration: string;
}

const mockSalesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

export default function CultivAIApp() {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  // Supabase client + auth state so we can read the user's saved farm location
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);

  const learningVideos: LearningVideo[] = [
    {
      title: "Introduction to Drip Irrigation Systems",
      youtubeVideoId: "tmEj3MQPlTY",
      duration: "6 min",
    },
    {
      title: "How to Install a Small-Scale Drip System",
      youtubeVideoId: "PetfxgFeOkM",
      duration: "16 min",
    },
    {
      title: "Understanding Sprinkler Irrigation Efficiency",
      youtubeVideoId: "ZEBnWjzkp-w",
      duration: "5 min",
    }
  ];

  useEffect(() => {
    // Listen for auth changes and get initial user
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user || null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch weather when we know the user (or when unauthenticated: fallback)
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const userLocation = (user?.user_metadata?.farm_location as string) || 'Pune';
        const response = await fetch(`/api/weather?location=${encodeURIComponent(userLocation)}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        
        <Header 
          isOpen={isSidebarOpen}
          title="sidebar_home"
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
            {/* Top row: Analytics (left) + Weather (right) */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Analytics Chart (moved to top-left) */}
              <section className="bg-white p-4 md:p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('business_analytics')}</h2>
                  <Link href="/analytics" className="flex items-center text-sm font-medium text-green-600 hover:text-green-800">
                    {t('view_details')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#22c55e"
                        name={t('monthly_sales')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Learning Path Section */}
              <section className="bg-white p-4 md:p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('learning_path_title')}</h2>
                  <Link href="/learning_path" className="flex items-center text-sm font-medium text-green-600 hover:text-green-800">
                    {t('show_more')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {learningVideos.map((video, index) => (
                      <a 
                        key={index} 
                        href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative group transform transition-transform duration-200 hover:scale-105"
                      >
                        <div className="relative aspect-video w-full max-w-[280px] mx-auto overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-shadow group-hover:shadow-lg">
                          <Image
                            src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                            alt={video.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="mt-2 max-w-[280px] mx-auto">
                          <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors text-sm">{video.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{video.duration}</p>
                        </div>
                      </a>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Weather, Insights, and Ask Expert */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6">
              <section className="relative bg-white p-4 md:p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                {/* smaller temp in top-right */}
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                  </div>
                ) : weatherData ? (
                  <>
                    <div className="absolute top-4 right-4 text-2xl font-bold">{weatherData.temperature.toFixed(1)}°C</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('weather_title')}</h2>
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl mt-1">
                        {weatherData.condition === 'Clear' ? (
                          <Sun className="text-yellow-500" />
                        ) : weatherData.condition === 'Cloudy' ? (
                          <Cloud className="text-gray-500" />
                        ) : (
                          <CloudRain className="text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">{weatherData.location}</p>
                        <p className="text-sm text-gray-500">
                          {t('humidity')}: {weatherData.humidity}% • {t('wind')}: {weatherData.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">{t('weather_error')}</p>
                )}
              </section>

              <section className="bg-white p-4 md:p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('farm_insights_title')}</h2>
                <div className="space-y-4">
                    {[ 
                    {
                      icon: <Sun className="w-6 h-6 text-yellow-500" />,
                      title: t('weather_title'),
                      description: t('weather_desc')
                    },
                    {
                      icon: <CloudRain className="w-6 h-6 text-blue-500" />,
                      title: t('pest_title'),
                      description: t('pest_desc')
                    },
                    {
                      icon: <Cloud className="w-6 h-6 text-green-500" />,
                      title: t('fertilizer_title'),
                      description: t('fertilizer_desc')
                    }
                  ].map((insight, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:shadow-sm hover:-translate-y-1 transition-transform duration-200">
                      <div className="p-2 rounded-full bg-gray-100">
                        {insight.icon}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className="font-semibold text-gray-800 text-sm">{insight.title}</h4>
                        <p className="text-gray-600 text-sm">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ask Expert Section */}
              <section className="bg-green-50 p-4 md:p-5 rounded-lg border border-green-200">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('ask_expert_title')}</h2>
                  <p className="text-sm text-gray-700">{t('ask_expert_desc')}</p>
                  <Link href="/chatbot" className="block">
                    <button className="w-full bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-green-700 transition">
                      {t('ask_expert_button')}
                    </button>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}