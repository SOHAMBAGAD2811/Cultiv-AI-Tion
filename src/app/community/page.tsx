"use client";

import { useEffect, useState, useRef, FormEvent } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '../utils/supabase';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import { User } from '@supabase/supabase-js';

interface ChatMessage {
  id: number;
  created_at: string;
  user_id: string;
  user_name: string;
  content: string;
}

function ChatInterface({ user }: { user: User | null }) {
  const [supabase] = useState(() => createClient());
  const userName = user?.user_metadata?.name as string || user?.email?.split('@')[0] || null;
  const userId = user?.id;

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    let mounted = true;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('community_chat')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          if (mounted) setError('Failed to load messages');
          return;
        }

        if (data && mounted) {
          setChatMessages(data);
        }
      } catch (error) {
        console.error('Error:', error);
        if (mounted) setError('An unexpected error occurred');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('community_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chat'
        },
        (payload) => {
          if (mounted && payload.new) {
            setChatMessages((prev) => [...prev, payload.new as ChatMessage]);
            scrollToBottom();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to chat updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      // mark unmounted so async callbacks don't update state
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId || !userName) return;

    try {
      setError(null);
      const newMessage = {
        user_id: userId,
        user_name: userName,
        content: message.trim(),
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('community_chat')
        .insert([newMessage]);

      if (insertError) {
        console.error('Error sending message:', insertError);
        setError('Failed to send message');
        return;
      }

      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleResetChat = async () => {
    if (!user) {
      setError("You must be logged in to reset the chat.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete all chat messages? This action cannot be undone.")) {
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      // Delete all rows from the community_chat table.
      // The filter `gt('id', -1)` is a way to target all rows since IDs are positive.
      const { error: deleteError } = await supabase.from('community_chat').delete().gt('id', -1);

      if (deleteError) {
        throw deleteError;
      }

      // The real-time subscription will receive an empty list, but we can also clear it locally.
      setChatMessages([]);
    } catch (err) {
      setError(`Failed to reset chat: ${(err as Error).message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-4 md:p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Community Chat</h3>
        {user && (
          <button
            onClick={handleResetChat}
            disabled={isResetting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isResetting ? 'Resetting...' : 'Reset Chat'}</span>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isCurrentUser = msg.user_id === userId;
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isCurrentUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {msg.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {!isCurrentUser && <p className="text-xs text-gray-500 mb-1">{msg.user_name}</p>}
                  <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={userName ? `Chat as ${userName}...` : 'Please sign in to chat'}
          className="flex-1 px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-green-500 focus:border-green-500"
          disabled={!userName} // Disable if user is not logged in
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!userName || !message.trim()}
        >
          Send
        </button>
      </form>
      {!userName && <p className="text-red-500 text-xs mt-2">Please sign in to chat.</p>}
    </div>
  );
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('community');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title="sidebar_community" />
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <ChatInterface user={user} />
        </div>
      </main>
    </div>
  );
}