'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';
import ChatBot from '@/components/StockUI/ChatBot';

const AIChatPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/';
        return;
      }
      setUser(session.user);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <svg 
                className="w-8 h-8 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Trading Expert</h1>
                <p className="text-gray-400">Get professional trading advice and market insights</p>
              </div>
            </div>
          </div>

          {/* ChatBot Component */}
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;