"use client";

import React from 'react'; // Removed unused useEffect import
import { useTranslation } from 'react-i18next';
import { Sprout, Home, BookOpen, Users, Mic, LineChart } from 'lucide-react'; // Removed Bell, Added LineChart
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface NavItem {
  id: string;
  labelKey: string;
  Icon: IconType;
  link?: string;
}

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab }: SidebarProps) {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { id: 'home',      labelKey: 'sidebar_dashboard', Icon: Home, link: '/dashboard' },
    { id: 'learning',  labelKey: 'sidebar_learning',  Icon: BookOpen, link: '/learning_path' },
    { id: 'community', labelKey: 'sidebar_community', Icon: Users, link: '/community' },        
    // Link to the internal AI assistant page.
    { id: 'analytics', labelKey: 'sidebar_analytics', Icon: LineChart, link: '/analytics' }, // New item for business analytics
    { id: 'chatbot',   labelKey: 'sidebar_assistant', Icon: Mic, link: '/chatbot' },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 transition-opacity md:hidden" // Backdrop only on mobile
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-30
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} // Always slides based on isOpen
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="bg-green-200 p-2 rounded-lg">
            <Sprout className="w-6 h-6 text-green-700" />
          </div>
          <h1 className="text-xl font-bold whitespace-nowrap">Cultiv-AI-Tion</h1>
        </div>

        <nav className="flex-1 px-4 py-4">
          {navItems.map((item) => {
            const commonProps = {
              onClick: () => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) setIsOpen(false);
              },
              className: `flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 whitespace-nowrap ${activeTab === item.id ? 'bg-green-700 text-white' : 'hover:bg-gray-700'}`
            };

            const children = (
              <>
                <item.Icon className="w-5 h-5" />
                <span>{t(item.labelKey)}</span>
              </>
            );

            return item.link ? (
              <Link key={item.id} href={item.link} {...commonProps}>{children}</Link>
            ) : (
              <button key={item.id} {...commonProps}>{children}</button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}