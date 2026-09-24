import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  Search,
  Calendar,
  Train,
  Bus,
  Plane,
  Film,
  Ticket,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '🎬 Find a movie near me', query: 'Find a movie near me' },
  { label: '🚆 Trains Vijayawada to Hyderabad', query: 'Find trains from Vijayawada to Hyderabad' },
  { label: '🚌 Buses Vijayawada to Hyderabad', query: 'Buses from Vijayawada to Hyderabad' },
  { label: '✈️ Flights Hyderabad to Delhi', query: 'Flights from Hyderabad to Delhi' },
  { label: '🎟️ Show my bookings', query: 'Show my bookings' },
];

export default function TicketHarbourAIWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState(''); // 'thinking' | 'searching' | ''
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am TicketHarbour AI. I can help you search movies, events, sports, trains, buses, and flights, or assist with your bookings and policies. What can I help you find today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Handle AI Route Selection click
  const handleAISearchSelection = (routeData, targetUrlFallback) => {
    const fromName = routeData?.source?.name || routeData?.from || routeData?.filters?.from;
    const toName = routeData?.destination?.name || routeData?.to || routeData?.filters?.to;
    const dateVal = routeData?.date || routeData?.filters?.date || new Date().toISOString().split('T')[0];
    const transportType = routeData?.transportType || routeData?.category || 'bus';

    if (!fromName || !toName) return;

    let targetPath = `/bus?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}&date=${encodeURIComponent(dateVal)}`;
    if (transportType === 'train') {
      targetPath = `/train?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}&date=${encodeURIComponent(dateVal)}`;
    } else if (transportType === 'flight') {
      targetPath = `/flights?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}&date=${encodeURIComponent(dateVal)}`;
    } else if (targetUrlFallback) {
      targetPath = targetUrlFallback;
    }

    setIsOpen(false);
    navigate(targetPath);

    setTimeout(() => {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }, 100);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setStatusText('thinking');

    try {
      // Build conversation history (last 6 turns)
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      setStatusText('searching');

      const res = await API.post('/ai/chat', {
        message: queryText,
        history: historyPayload,
      });

      const data = res.data?.data || {};

      let responseContent = data.message || data.summary || 'I processed your request.';
      if (data.clarificationQuestion) {
        responseContent = data.clarificationQuestion;
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        type: data.type,
        route: data.route,
        content: responseContent,
        intent: data.intent,
        category: data.category,
        filters: data.filters,
        targetUrl: data.targetUrl,
        results: data.results,
        requiresAuth: data.requiresAuth,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      const fallbackMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'TicketHarbour AI is temporarily unavailable. You can continue using normal search.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={toggleWidget}
        aria-label="Ask TicketHarbour AI Assistant"
        className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-40 p-3.5 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer border border-white/20"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 animate-pulse text-cyan-200" />
        </div>
        <span className="hidden sm:inline font-black text-xs pr-1 tracking-tight">
          Ask TicketHarbour AI
        </span>
      </button>

      {/* AI Assistant Modal Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#111111] border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[90vh] sm:h-[650px] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#151515] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    TicketHarbour AI Assistant
                    <span className="px-2 py-0.5 bg-[#03B3C3]/20 text-[#03B3C3] text-[9px] font-black uppercase rounded-full border border-[#03B3C3]/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time search, booking status & policy support
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-none">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isUser
                          ? 'bg-[#6750A2] text-white shadow-md'
                          : 'bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] text-white shadow-md'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                          isUser
                            ? 'bg-[#6750A2]/20 border-[#6750A2]/40 text-white rounded-tr-none'
                            : 'bg-[#181818] border-white/10 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {/* Structured Route Suggestion Card */}
                        {!isUser && (m.type === 'route_search' || m.route || (m.intent === 'SEARCH' && (m.filters?.from && m.filters?.to))) && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                            <div
                              onClick={() => handleAISearchSelection(m.route || m.filters || m, m.targetUrl)}
                              className="p-3 bg-gradient-to-r from-[#03B3C3]/20 via-[#6750A2]/20 to-black/40 rounded-2xl border border-[#03B3C3]/40 cursor-pointer hover:border-[#03B3C3] transition-all group shadow-lg"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="px-2 py-0.5 bg-[#03B3C3]/30 text-[#03B3C3] font-bold text-[10px] uppercase rounded-md flex items-center gap-1">
                                  {(m.route?.transportType || m.category) === 'train' && <Train className="w-3 h-3" />}
                                  {(m.route?.transportType || m.category) === 'bus' && <Bus className="w-3 h-3" />}
                                  {(m.route?.transportType || m.category) === 'flight' && <Plane className="w-3 h-3 text-[#03B3C3]" />}
                                  {((m.route?.transportType || m.category) || 'bus').toUpperCase()} ROUTE
                                </span>
                                {(m.route?.date || m.filters?.date) && (
                                  <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#03B3C3]" />
                                    {m.route?.date || m.filters?.date}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-white font-black text-sm group-hover:text-[#03B3C3] transition-colors">
                                <span>{m.route?.source?.name || m.filters?.from}</span>
                                <ArrowRight className="w-4 h-4 text-[#03B3C3] shrink-0" />
                                <span>{m.route?.destination?.name || m.filters?.to}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAISearchSelection(m.route || m.filters || m, m.targetUrl)}
                              className="w-full py-2.5 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                            >
                              <Search className="w-3.5 h-3.5 text-cyan-200" />
                              Search This Route
                            </button>
                          </div>
                        )}

                        {/* Require Auth Action Button */}
                        {!isUser && m.requiresAuth && (
                          <div className="mt-3 pt-2">
                            <button
                              onClick={() => {
                                navigate('/login');
                                setIsOpen(false);
                              }}
                              className="px-4 py-2 bg-[#03B3C3] text-white font-bold text-xs rounded-xl hover:bg-[#03B3C3]/90"
                            >
                              Log In to View Bookings
                            </button>
                          </div>
                        )}

                        {/* Results Summary Items Preview */}
                        {!isUser && Array.isArray(m.results) && m.results.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Available Real Results ({m.results.length}):</p>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {m.results.slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (item.slug || item._id) {
                                      navigate(`/listings/${item.slug || item._id}`);
                                      setIsOpen(false);
                                    }
                                  }}
                                  className="p-2 bg-black/40 hover:bg-black/60 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer text-[11px]"
                                >
                                  <span className="font-bold text-white truncate max-w-[200px]">
                                    {item.title || item.trainName || item.listingTitle}
                                  </span>
                                  <span className="font-mono text-[#03B3C3] font-bold">
                                    ₹{item.startingPrice || item.price || item.totalAmount || 150}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] text-slate-500 block px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Thinking / Searching Loader indicator */}
              {loading && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] text-white flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#03B3C3] animate-pulse" />
                    <span>{statusText === 'searching' ? 'Searching TicketHarbour backend tools...' : 'TicketHarbour AI is thinking...'}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Clickable Quick Prompts Bar */}
            <div className="px-4 py-2 bg-[#151515] border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-[11px] font-bold whitespace-nowrap border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Form Bar */}
            <div className="p-3 sm:p-4 bg-[#151515] border-t border-white/10 shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  rows="1"
                  placeholder="Ask TicketHarbour AI (e.g. Trains from Hyderabad to Vijayawada tomorrow)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#03B3C3] resize-none"
                />
                <GlassButton
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  variant="gradient"
                  className="p-3.5 rounded-2xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </GlassButton>
              </form>
              <span className="text-[10px] text-slate-500 block text-center mt-2">
                TicketHarbour AI responses are powered by live backend tools and authorized database records.
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
