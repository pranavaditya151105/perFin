'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerFinStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { sendChatMessage, fetchChatHistory, fetchThreadMessages, deleteChatThread } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Send, Bot, User, Loader2, Plus, MessageSquare, Menu, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

const OLIVE = '#A35E47';
const DEEP  = '#000000';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';

const SUGGESTIONS = [
  'Can I buy a car worth ₹10L next year?',
  'When can I retire?',
  'How much should I invest in SIP monthly?',
  'Is my emergency fund sufficient?',
];

export default function ChatPage() {
  const router = useRouter();
  const { analysis, profile } = usePerFinStore();
  const { isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    usePerFinStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(usePerFinStore.persist.hasHydrated());
  }, []);

  // Load History on Mount
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      loadHistory();
    }
  }, [hasHydrated, isAuthenticated]);

  const loadHistory = async () => {
    try {
      const data = await fetchChatHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    if (hasHydrated && !messages.length && !activeConvId) {
      setMessages([{
        role: 'assistant',
        content: profile
          ? `Hello ${profile.name}! I'm your PerFin AI assistant. I'm ready to help you with your finances or guide you through filing your ITR. Ask me anything!`
          : `Hello! I'm your AI Financial Advisor. Please build your financial profile first to get personalized advice.`,
      }]);
    }
  }, [hasHydrated, profile, messages.length, activeConvId]);

  useEffect(() => { 
    if (hasHydrated && isAuthenticated && !profile) {
      router.replace('/input'); 
    }
  }, [profile, hasHydrated, isAuthenticated, router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([{
      role: 'assistant',
      content: `Fresh start! How can I help you with your taxes or investments today?`
    }]);
  };

  const loadThread = async (id) => {
    setLoading(true);
    try {
      const msgs = await fetchThreadMessages(id);
      const formatted = [];
      msgs.forEach(m => {
        formatted.push({ role: 'user', content: m.user_message });
        formatted.push({ role: 'assistant', content: m.ai_response });
      });
      setMessages(formatted);
      setActiveConvId(id);
    } catch (err) {
      console.error("Failed to load thread", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    
    try {
      await deleteChatThread(id);
      if (activeConvId === id) {
        startNewChat();
      }
      loadHistory();
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const send = async (text) => {
    const msg = text ?? input.trim();
    if (!msg || !profile) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const data = await sendChatMessage(msg, profile, activeConvId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      if (!activeConvId) {
        setActiveConvId(data.conversation_id);
        loadHistory(); // Refresh sidebar to show new chat title
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Unknown network error';
      setMessages(prev => [...prev, { role: 'assistant', content: `[Connection Error] ${errMsg}` }]);
    } finally { setLoading(false); }
  };

  if (!hasHydrated || !profile) return null;

  return (
    <div style={{ height: '100vh', background: BG, paddingTop: 64, display: 'flex', overflow: 'hidden' }}>
      <Navbar />
      
      {/* Sidebar - ChatGPT Style */}
      <div style={{ 
        width: sidebarOpen ? 260 : 0, 
        background: '#1A1A1A', 
        color: '#FFF', 
        transition: 'width 0.3s ease', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: `1px solid ${DEEP}`,
        position: 'relative'
      }}>
        <div style={{ padding: '20px 15px', display: 'flex', flexDirection: 'column', gap: 20, width: 260 }}>
          <button onClick={startNewChat} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            padding: '12px', 
            borderRadius: 6, 
            border: '1px solid #444', 
            background: 'transparent', 
            color: '#FFF', 
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'background 0.2s'
          }} onMouseEnter={e => e.target.style.background = '#333'} onMouseLeave={e => e.target.style.background = 'transparent'}>
            <Plus size={16} /> New Chat
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Recent History</p>
            {history.map((chat) => (
              <div key={chat._id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 5,
                background: activeConvId === chat._id ? 'rgba(163, 94, 71, 0.5)' : 'rgba(163, 94, 71, 0.1)',
                border: activeConvId === chat._id ? '1px solid rgba(163, 94, 71, 0.8)' : '1px solid rgba(163, 94, 71, 0.3)',
                borderRadius: 8,
                paddingRight: 8,
                transition: 'all 0.2s',
                marginBottom: 4
              }} className="history-item">
                <button onClick={() => loadThread(chat._id)} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  padding: '10px', 
                  background: 'transparent',
                  border: 'none', 
                  color: '#EEE', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  flex: 1,
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <MessageSquare size={14} /> {chat.title}
                </button>
                <button onClick={(e) => handleDelete(e, chat._id)} style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: "5px 8px",
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.5,
                  transition: 'all 0.2s'
                }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#FF5F5F'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = '#888'; }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Sidebar Toggle (Floating Button) */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ 
          position: 'absolute', 
          left: 10, 
          top: 10, 
          zIndex: 10, 
          background: '#FFF', 
          border: `1px solid ${BORDER}`, 
          borderRadius: 4, 
          padding: 6, 
          cursor: 'pointer' 
        }}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '10px 24px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, marginTop: 10, paddingLeft: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 5, background: OLIVE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color={BG} />
            </div>
            <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, color: DEEP }}>PerFin AI Assistant</h1>
                <span style={{ fontSize: 11, color: MUTED }}>Filing ITR & Financial Planning</span>
            </div>
            </div>

            {/* Messages Container */}
            <div style={{ 
                background: CARD, 
                border: `1px solid ${BORDER}`, 
                borderRadius: 8, 
                padding: 20, 
                marginBottom: 10, 
                overflowY: 'auto', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
            {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? 'rgba(163,94,71,0.15)' : OLIVE }}>
                    {m.role === 'user' ? <User size={14} color={OLIVE} /> : <Bot size={14} color={BG} />}
                </div>
                <div style={{ 
                    maxWidth: '85%', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    background: m.role === 'user' ? OLIVE : BG, 
                    color: m.role === 'user' ? '#FFF' : DEEP,
                    border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`, 
                    fontSize: 14, 
                    lineHeight: 1.6, 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}>
                    {m.content}
                </div>
                </div>
            ))}
            {loading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: OLIVE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} color={BG} /></div>
                <div style={{ padding: '10px 16px', borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: 13 }}>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> AI Thinking...
                </div>
                </div>
            )}
            <div ref={bottomRef} />
            </div>

            {/* Input Box */}
            <div style={{ display: 'flex', gap: 8, paddingBottom: 20, alignItems: 'flex-end' }}>
            <textarea 
                style={{ 
                flex: 1, 
                padding: '12px 16px', 
                fontSize: 14, 
                background: CARD, 
                border: `1px solid ${BORDER}`, 
                borderRadius: 8, 
                color: DEEP, 
                fontFamily: 'Inter, sans-serif', 
                outline: 'none',
                resize: 'none',
                maxHeight: '150px'
                }}
                rows={1}
                value={input} 
                onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Message PerFin AI..."
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ 
                background: OLIVE, 
                color: BG, 
                border: 'none', 
                borderRadius: 8, 
                padding: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: 'all 0.2s'
                }}>
                <Send size={18} />
            </button>
            </div>
        </div>
      </div>
    </div>
  );
}
