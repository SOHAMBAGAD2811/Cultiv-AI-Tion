"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Sun, Cloud, CloudRain, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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

export default function CultivAIApp() {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('all');
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
        const userLocation = (user?.user_metadata?.location as string) || 'Pune';
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

  const getGroupKey = (date: string, range: string) => {
    if (range === 'this_month' || range === 'last_month' || range === 'last_30_days') {
      return date; // Group by day (YYYY-MM-DD)
    }
    return date.substring(0, 7); // Group by month (YYYY-MM)
  };

  const formatXAxis = (tickItem: string) => {
    const isDaily = timeRange === 'this_month' || timeRange === 'last_month';
    const date = isDaily ? new Date(tickItem + 'T00:00:00') : new Date(tickItem + '-02'); // Add day/time to parse month correctly
    return date.toLocaleDateString('en-US', { month: 'short', day: isDaily ? 'numeric' : undefined });
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) { setAnalyticsData([]); return; }

      try {
        const filePath = `${user.id}.json`;
        const { data, error } = await supabase.storage
          .from('analytics-data')
          .download(filePath);

        if (error) {
          if (error.message.includes('not found')) {
            // No data file yet, which is not an error.
            setAnalyticsData([]);
            return;
          }
          throw error;
        }

        if (data) {
          const savedData = JSON.parse(await data.text())
          if (savedData.analytics && Array.isArray(savedData.analytics)) {
            const now = new Date();
            let startDate: Date | null = null;
            let endDate: Date | null = null;

            switch (timeRange) {
              case 'this_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
              case 'last_month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
              case 'current_quarter': {
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
              }
              case 'last_quarter': {
                const quarter = Math.floor(now.getMonth() / 3);
                const currentYear = now.getFullYear();
                // If it's the first quarter, the last quarter was in the previous year
                const startYear = quarter === 0 ? currentYear - 1 : currentYear;
                const startQuarter = quarter === 0 ? 3 : quarter - 1;
                startDate = new Date(startYear, startQuarter * 3, 1);
                endDate = new Date(startYear, startQuarter * 3 + 3, 0);
                break;
              }
              case 'current_fy': {
                // Assuming Financial Year starts in April
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
                startDate = new Date(fyStartYear, 3, 1); // April 1st
                endDate = new Date(fyStartYear + 1, 2, 31); // March 31st
                break;
              }
              case 'all':
              default: // 'all'
                break;
            }

            const filteredData = savedData.analytics.filter((item: any) => {
              if (!startDate || !endDate) return true;
              const itemDate = new Date(item.date);
              return itemDate >= startDate && itemDate <= endDate;
            });

            const dataMap = new Map<string, { sales: number; expenditure: number; profit: number }>();

            filteredData.forEach((item: any) => {
              const groupKey = getGroupKey(item.date, timeRange);
              const entry = dataMap.get(groupKey) || { sales: 0, expenditure: 0, profit: 0 };
              entry.sales += item.sales;
              entry.expenditure += item.expenditure;
              dataMap.set(groupKey, entry);
            });

            const chartData = Array.from(dataMap.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, values]) => ({
                name: group,
                sales: values.sales,
                expenditure: values.expenditure,
                profit: values.sales - values.expenditure,
              }));

            setAnalyticsData(chartData);
          }
        }
      } catch (err) {
        console.error('Error fetching analytics data from storage:', err);
      }
    };

    fetchAnalyticsData();
  }, [user, supabase, timeRange]);

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
          user={user}
        />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
            {/* Top row: Analytics (left) + Weather (right) */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Analytics Chart (moved to top-left) */}
              <section className="bg-white p-4 md:p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{t('business_analytics')}</h2>
                  <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-full sm:w-[160px] text-sm">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="current_quarter">Current Quarter</SelectItem>
                        <SelectItem value="last_quarter">Last Quarter</SelectItem>
                        <SelectItem value="current_fy">Current Financial Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link href="/analytics" className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 whitespace-nowrap">
                      {t('view_details')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickFormatter={formatXAxis} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }} activeDot={{ r: 6 }}
                        name={t('sales')}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenditure"
                        stroke="#ef4444"
                        dot={{ r: 3 }} activeDot={{ r: 6 }}
                        strokeWidth={2}
                        name={t('expenditure')}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        dot={{ r: 3 }} activeDot={{ r: 6 }}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name={t('profit')}
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