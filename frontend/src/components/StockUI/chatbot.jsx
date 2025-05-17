'use client';
import { useState, useRef, useEffect } from 'react';

const initialMessages = [
  { sender: 'bot', text: "Hello! I'm StockifyBot. How can I help you today?" }
];

const Chatbot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);

    // Simple bot logic
    let botReply = "I'm here to assist you with stock information!";
    if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      botReply = "Hi there! How can I help you with stocks today?";
    } else if (input.toLowerCase().includes('price')) {
      botReply = "You can view the latest stock prices on the main dashboard.";
    } else if (input.toLowerCase().includes('help')) {
      botReply = "Sure! You can ask about stock prices, company info, or how to use Stockify.";
    } else if (input.toLowerCase().includes('thank')) {
      botReply = "You're welcome! Let me know if you have any more questions.";
    }

    setTimeout(() => {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: botReply }]);
    }, 600);

    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col">
      <div className="bg-blue-700 text-white px-4 py-2 rounded-t-xl font-semibold">
        Stockify Chatbot
      </div>
      <div className="flex-1 p-4 overflow-y-auto h-64">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[70%] text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex border-t border-gray-700">
        <input
          type="text"
          className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-bl-xl outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-br-xl hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;