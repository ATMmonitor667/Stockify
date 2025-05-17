import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT =
  "You are Stockify AI, a friendly and knowledgeable assistant for stock advice. Be concise, helpful, and never give financial guarantees. If you don't know something, say so honestly.";

const ChatbotWidget = ({ initialPrompt = SYSTEM_PROMPT, placeholder = "Ask Stockify AI about stocks..." }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { role: "system", content: initialPrompt }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (data.reply) {
        setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not generate a response.' }]);
      }
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: 'Error contacting Stockify AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {open ? (
        <div className="w-80 bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-96 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded-t-xl">
            <span className="font-bold text-white tracking-wide">Stockify AI</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-blue-200 text-lg font-bold">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50 dark:bg-gray-900">
            {history.filter(msg => msg.role !== 'system').length === 0 && (
              <div className="text-gray-400 text-sm mt-8 text-center">Ask me anything about stocks, investing, or the market!</div>
            )}
            {history.filter(msg => msg.role !== 'system').map((msg, idx) => (
              <div key={idx} className={`text-sm flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`inline-block px-3 py-2 rounded-2xl shadow-sm max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>{msg.content}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-blue-600 text-xs mt-2">
                <span className="animate-bounce">Stockify AI is typing...</span>
                <span className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-2 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-white dark:bg-gray-900 rounded-b-xl">
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="animate-spin">⏳</span> : 'Send'}
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-5 py-3 rounded-full shadow-xl text-base font-bold flex items-center gap-2 animate-fade-in"
          title="Chat with Stockify AI"
        >
          <span role="img" aria-label="chat">💬</span> Chat
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget; 