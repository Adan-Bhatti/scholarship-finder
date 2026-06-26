import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareIcon, XIcon, SendIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { chatWithAI } from '../api/ai';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'ai',
    content: "Hi! I'm ScholarshipAI. I can help you find scholarships, explain eligibility, and guide your applications. What are you looking for?",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const token = localStorage.getItem('token');
  if (!token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error('Failed to connect to AI');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Scholarships for Pakistan 🇵🇰',
    'Fully funded masters',
    'No GPA requirement',
  ];

  return (
    <>
      {/* FAB button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all z-50 flex items-center justify-center group"
          aria-label="Open AI Chat"
        >
          <SparklesIcon size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50"
          style={{ maxHeight: 'calc(100vh - 5rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <SparklesIcon size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">ScholarshipAI</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-blue-200 text-xs">Online · Powered by Groq</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <XIcon size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 min-h-[280px] max-h-[380px]">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-sm shadow-blue-500/20'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts — show only when few messages */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap bg-slate-50 border-t border-slate-100 pt-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about scholarships..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all text-slate-800 placeholder-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {isLoading ? <Loader2Icon size={17} className="animate-spin" /> : <SendIcon size={17} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
