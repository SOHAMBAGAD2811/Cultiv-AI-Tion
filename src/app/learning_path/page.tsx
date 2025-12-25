"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Play, Filter, Search, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QuizModal from '../../components/QuizModal';

import '../i18n';
import quizzesData from './quizzes.json';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LearningPath {
  title: string;
  category: string;
  youtubeVideoId: string;
  duration: string;
}

const allLearningPaths: LearningPath[] = [
  {
    title: "Introduction to Drip Irrigation Systems",
    category: "irrigation",
    youtubeVideoId: "tmEj3MQPlTY",
    duration: "6 min",
  },
  {
    title: "How to Install a Small-Scale Drip System",
    category: "irrigation",
    youtubeVideoId: "PetfxgFeOkM",
    duration: "16 min",
  },
  {
    title: "Understanding Sprinkler Irrigation Efficiency",
    category: "irrigation",
    youtubeVideoId: "ZEBnWjzkp-w",
    duration: "5 min",
  },
  {
    title: "Using Soil Moisture Sensors for Smart Irrigation",
    category: "irrigation",
    youtubeVideoId: "ko0VDt41xCM",
    duration: "7 min",
  },
  {
    title: "Rainwater Harvesting for Farm Use",
    category: "irrigation",
    youtubeVideoId: "2LtfEz2jimA",
    duration: "2 min",
  },
  {
    title: "The 5 Principles of Soil Health",
    category: "soil_health",
    youtubeVideoId: "DPVz4fvWTm4",
    duration: "18 min",
  },
  {
    title: "How to Use Cover Crops to Build Soil",
    category: "soil_health",
    youtubeVideoId: "tgYJDl6hpw0",
    duration: "7 min",
  },
  {
    title: "Introduction to No-Till Farming",
    category: "soil_health",
    youtubeVideoId: "DBYeb66dN80",
    duration: "1 min",
  },
  {
    title: "How to Read a Soil Test Report",
    category: "soil_health",
    youtubeVideoId: "Zde1gcKQhOY",
    duration: "2 min",
  },
  {
    title: "On-Farm Composting Methods",
    category: "soil_health",
    youtubeVideoId: "HZIsnzBnTKQ",
    duration: "90 min",
  },
  {
    title: "Benefits of Crop Rotation",
    category: "soil_health",
    youtubeVideoId: "Gmf2fiBr8bw",
    duration: "12 min",
  },
  {
    title: "What is Integrated Pest Management (IPM)?",
    category: "pest_control",
    youtubeVideoId: "7UlKUleJWeE",
    duration: "6 min",
  },
  {
    title: "Using Beneficial Insects for Pest Control",
    category: "pest_control",
    youtubeVideoId: "_8R4G4JIQhA",
    duration: "33 min",
  },
  {
    title: "How to Make and Use Neem Oil Spray",
    category: "pest_control",
    youtubeVideoId: "u9AIuIsnEGs",
    duration: "3 min",
  },
  {
    title: "Companion Planting for Pest Deterrence",
    category: "pest_control",
    youtubeVideoId: "EmsaVi1Kt6k",
    duration: "23 min",
  },
  {
    title: "Identifying Common Crop Pests",
    category: "pest_control",
    "youtubeVideoId": "em5t8bScq9s",
    "duration": "12 min",
  },
  {
    title: "Understanding NPK Fertilizer Ratios",
    category: "fertilizers",
    youtubeVideoId: "BGVU75oRKyo",
    duration: "7 min",
  },
  {
    title: "Organic vs. Synthetic Fertilizers Explained",
    category: "fertilizers",
    "youtubeVideoId": "E-A_E3trByg",
    "duration": "2 min",
  },
  {
    title: "How to Make and Use Compost Tea",
    category: "fertilizers",
    youtubeVideoId: "96XGcIF3v20",
    duration: "4 min",
  },
  {
    title: "Using Green Manure (Cover Crops as Fertilizer)",
    category: "fertilizers",
    "youtubeVideoId": "RwxX4i0zF38",
    "duration": "10 min",
  },
  {
    title: "How to Apply Granular Fertilizer Correctly",
    category: "fertilizers",
    youtubeVideoId: "dF725wQ_WdU",
    duration: "6 min",
  },
  {
    title: "Introduction to Precision Agriculture",
    category: "techniques",
    youtubeVideoId: "1TroQO6eLzg",
    duration: "2 min",
  },
  {
    title: "Introduction to Agroforestry Systems",
    category: "techniques",
    youtubeVideoId: "hS4qgwT9RuI",
    duration: "7 min",
  },
  {
    title: "Permaculture Principles for the Farm",
    category: "techniques",
    youtubeVideoId: "-YhqKhLE5qw",
    duration: "2 min",
  },
  {
    title: "Basics of Vertical Farming Systems",
    category: "techniques",
    youtubeVideoId: "Oo7DpNPR-tM",
    duration: "9 min",
  },
  {
    title: "Basics of Hydroponic Farming",
    category: "techniques",
    youtubeVideoId: "0EklopLQqyk",
    duration: "10 min",
  },
  {
    title: "Post-Harvest Handling to Maintain Quality",
    category: "harvesting",
    youtubeVideoId: "niYA0qrUJiE",
    duration: "22 min",
  },
  {
    title: "How to Reduce Post-Harvest Losses",
    category: "harvesting",
    youtubeVideoId: "T88J3xAYPfM",
    duration: "12 min",
  },
  {
    title: "Proper Crop Storage Techniques (Grains, Roots)",
    category: "harvesting",
    youtubeVideoId: "bZdSqFuX5DE",
    duration: "23 min",
  },
  {
    title: "Curing and Storing Onions, Garlic, & Squash",
    category: "harvesting",
    youtubeVideoId: "e-l7FHXLhWg",
    duration: "11 min",
  },
  {
    title: "Introduction to Small-Scale Cold Storage (CoolBot)",
    category: "harvesting",
    youtubeVideoId: "77ke5d6DPxg",
    duration: "20 min",
  },
];

export default function LearningPathPage() {
  const { t } = useTranslation();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('learning');

  // --- State for search and filter ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setFilterOpen] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // --- State for quiz modal ---
  const [isQuizOpen, setQuizOpen] = useState<boolean>(false);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  const [selectedVideoForQuiz, setSelectedVideoForQuiz] = useState<{
    videoId: string;
    videoTitle: string;
    questions: QuizQuestion[];
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUser();
  }, [supabase]);

  const categories = useMemo(() => [
    'all', 'irrigation', 'soil_health', 'pest_control', 'fertilizers', 'techniques', 'harvesting'
  ], []);

  // --- Close filter pop-up on outside click ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFilterOpen(false);
  };

  // --- Quiz handler ---
  const handleOpenQuiz = (videoId: string, videoTitle: string) => {
    setLoadingQuizId(videoId);
    setTimeout(() => {
      const quizForVideo = quizzesData.quizzes.find((q: any) => q.videoId === videoId);
      if (quizForVideo) {
        setSelectedVideoForQuiz({
          videoId,
          videoTitle,
          questions: quizForVideo.questions,
        });
        setQuizOpen(true);
      }
      setLoadingQuizId(null);
    }, 500);
  };

  const handleSubmitQuiz = async (userAnswers: number[]) => {
    if (!selectedVideoForQuiz) return;

    try {
      const response = await fetch("/api/evaluate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoTitle: selectedVideoForQuiz.videoTitle,
          questions: selectedVideoForQuiz.questions,
          userAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate quiz");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  };

  // --- Filtering Logic ---
  const filteredLearningPaths = useMemo(() => {
    let filtered = allLearningPaths;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(path => path.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        t(path.category).toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return filtered;
  }, [searchTerm, selectedCategory, t]);

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title="learning_path_title" user={user} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('learning_path_title')}</h2>
                <p className="text-gray-600 mt-1">{t('learning_path_desc')}</p>
            </div>
            {/* Filters and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('search_videos_placeholder')}
                    className="w-full pl-10 pr-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-white border rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{t('filter_button')}</span>
                  </button>
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                      <ul className="py-1">
                        {categories.map(category => (
                           <li key={category}>
                             <button
                               onClick={() => handleCategorySelect(category)}
                               className={`w-full text-left px-4 py-2 text-sm ${selectedCategory === category ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                             >
                               {t(category === 'all' ? 'all_categories' : category)}
                             </button>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
            </div>

            {/* Video Grid Section */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredLearningPaths.map((video, index) => (
                    <div
                        key={index}
                        className="flex flex-col rounded-lg overflow-hidden shadow-md group cursor-pointer hover:shadow-xl transition-shadow bg-white"
                    >
                        <a
                            href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex flex-col"
                        >
                            <div className="relative">
                                <img
                                    src={`https://i.ytimg.com/vi/${video.youtubeVideoId}/sddefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-green-500 p-4 rounded-full shadow-lg">
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{video.duration}</span>
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <span className="text-green-600 text-xs font-semibold uppercase">{t(video.category)}</span>
                                <h4 className="text-gray-900 font-bold text-base mt-1 leading-tight">
                                    {video.title}
                                </h4>
                            </div>
                        </a>
                        <div className="px-4 pb-4">
                            <button
                                onClick={() => handleOpenQuiz(video.youtubeVideoId, video.title)}
                                disabled={loadingQuizId === video.youtubeVideoId}
                                className={`w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-500 text-white font-semibold py-1 px-4 rounded-lg shadow-sm transition ${loadingQuizId === video.youtubeVideoId ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                {loadingQuizId === video.youtubeVideoId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <HelpCircle className="w-4 h-4" />
                                )}
                                <span>{loadingQuizId === video.youtubeVideoId ? 'Opening...' : 'Quiz'}</span>
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            </section>

            {/* Quiz Modal */}
            {selectedVideoForQuiz && (
                <QuizModal
                    isOpen={isQuizOpen}
                    onClose={() => setQuizOpen(false)}
                    videoId={selectedVideoForQuiz.videoId}
                    videoTitle={selectedVideoForQuiz.videoTitle}
                    questions={selectedVideoForQuiz.questions}
                    onSubmitQuiz={handleSubmitQuiz}
                />
            )}
        </div>
      </main>
    </div>
  );
}