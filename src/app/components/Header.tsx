"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, LogIn } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { t, i18n } = useTranslation();
  
  const languages = [
    { code: 'mr', name: 'Marathi' },
    { code: 'hi', name: 'Hindi' },
    { code: 'en', name: 'English' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)} 
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">{t('dashboard_title')}</h2>
          <p className="text-xs text-gray-500 hidden sm:block">{currentDate}</p>
        </div>
      </div>

      {/* --- Container for the right-side controls --- */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Language Buttons (now appear first on the right) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${i18n.language === lang.code ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Sign In Button (now appears last, on the far right) */}
        <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <LogIn className="w-4 h-4" />
          <span>{t('sign_in_button')}</span>
        </button>
      </div>
    </header>
  );
}