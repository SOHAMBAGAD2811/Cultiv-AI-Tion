"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotPage() {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('chatbot');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      // Use the local Next.js API route so the app works without an external Flask server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      setInput(''); // Clear input immediately for better UX

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const assistantText = data.result;
      if (typeof assistantText !== 'string') {
        throw new Error('Invalid response format from assistant');
      }

      setMessages(prev => {
        const newMessages = [...prev];
        // Update the last assistant placeholder message
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
          newMessages[newMessages.length - 1].content = assistantText;
        } else {
          newMessages.push({ role: 'assistant', content: assistantText });
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant' && newMessages[newMessages.length - 1].content === '') {
          newMessages[newMessages.length - 1].content = 'Sorry, I could not connect to the assistant.';
        } else {
          newMessages.push({ role: 'assistant', content: 'Sorry, I could not connect to the assistant.' });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} h-screen overflow-hidden`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title="sidebar_assistant" />
        
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot size={20} />
                  </div>
                )}
                <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none whitespace-pre-wrap' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                  {isLoading && index === messages.length - 1 && !msg.content ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline" /> }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex-shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ask_expert_desc')}
              className="flex-1 px-4 py-2 border bg-gray-50 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}