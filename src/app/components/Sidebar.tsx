"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Home, BookOpen, Bell, Users, Mic } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab }: SidebarProps) {
  const { t } = useTranslation();

  // The navigation items now use keys from the phrasebooks
  const navItems = [
      { id: 'home',      labelKey: 'sidebar_dashboard', Icon: Home },
      { id: 'learning',  labelKey: 'sidebar_learning',  Icon: BookOpen },
      { id: 'insights',  labelKey: 'sidebar_alerts',    Icon: Bell },
      { id: 'community', labelKey: 'sidebar_community', Icon: Users },
      { id: 'chatbot',   labelKey: 'sidebar_assistant', Icon: Mic }
  ];

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-20 bg-black/60 transition-opacity md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="bg-green-200 p-2 rounded-lg">
            <Sprout className="w-6 h-6 text-green-700" />
          </div>
          <h1 className="text-xl font-bold whitespace-nowrap">Cultiv-AI-Tion</h1>
        </div>
        <nav className="flex-1 px-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 whitespace-nowrap ${activeTab === item.id ? 'bg-green-700 text-white' : 'hover:bg-gray-700'}`}
            >
              <item.Icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}