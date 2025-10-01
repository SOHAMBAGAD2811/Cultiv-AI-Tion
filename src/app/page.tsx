"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Sun, Bug, Leaf, ThumbsUp, Share2, MessageCircle, ChevronRight, User } from 'lucide-react';

import './i18n';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

interface LearningPath {
  titleKey: string;
  imageSlug: string;
}

interface Insight {
  IconComponent: React.ElementType;
  color: string;
  titleKey: string;
  descriptionKey: string;
}

// The CommunityPost interface and data array have been removed as they are no longer needed here.

export default function CultivAIApp() {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const learningPaths: LearningPath[] = [
    { titleKey: 'drip_irrigation', imageSlug: '1625246333195-78d9c38ad449' },
    { titleKey: 'soil_health', imageSlug: '1592982537447-7c6e5a6d5e2e' },
    { titleKey: 'pest_control', imageSlug: '1574943516325-c3e4e5f3e2c7' }
  ];

  const insights: Insight[] = [
    { IconComponent: Sun, color: 'text-yellow-500', titleKey: 'weather_title', descriptionKey: 'weather_desc' },
    { IconComponent: Bug, color: 'text-red-500', titleKey: 'pest_title', descriptionKey: 'pest_desc' },
    { IconComponent: Leaf, color: 'text-green-600', titleKey: 'fertilizer_title', descriptionKey: 'fertilizer_desc' }
  ];

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
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <section className="bg-white p-4 md:p-5 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{t('learning_path_title')}</h3>
                  <a href="#" className="flex items-center text-sm font-medium text-green-600 hover:text-green-800">
                    {t('show_more')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {learningPaths.map((path, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden shadow-md group cursor-pointer hover:shadow-xl transition-shadow">
                      <img src={`https://images.unsplash.com/photo-${path.imageSlug}?w=400&h=300&fit=crop`} alt={t(path.titleKey)} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-2 right-2 bg-green-500 p-2 rounded-full hover:bg-green-600 transition">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-semibold text-sm">{t(path.titleKey)}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* --- COMMUNITY FEED SECTION UPDATED --- */}
              <section className="bg-white p-4 md:p-5 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">{t('community_feed_title')}</h3>
                  <a href="#" className="flex items-center text-sm font-medium text-green-600 hover:text-green-800">
                    {t('view_feed_button')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
                {/* The list of posts has been removed from here */}
              </section>

              <section className="bg-green-50 p-4 md:p-5 rounded-lg border border-green-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-green-600 p-3 rounded-full text-white flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-gray-900">{t('ask_expert_title')}</h4>
                  <p className="text-sm text-gray-700 mt-1">{t('ask_expert_desc')}</p>
                </div>
                <button className="bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-green-700 transition w-full sm:w-auto flex-shrink-0">
                  {t('ask_expert_button')}
                </button>
              </section>

            </div>
            <div className="lg:col-span-1">
              <section className="bg-white p-4 md:p-5 rounded-lg shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('farm_insights_title')}</h3>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className={`p-2 rounded-full ${insight.color.replace('text', 'bg').replace('-500', '-100')}`}>
                          <insight.IconComponent className={`w-6 h-6 ${insight.color}`} />
                      </div>
                      <div className='flex-1 min-w-0'>
                          <h4 className="font-semibold text-gray-800 text-sm">{t(insight.titleKey)}</h4>
                          <p className="text-gray-600 text-sm">{t(insight.descriptionKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}