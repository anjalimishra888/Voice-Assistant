import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useVoice from '../hooks/useVoice';
import { chatAPI } from '../services/api';
import { FiSend, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiSun, FiMoon, FiLogOut, FiTrash2, FiUser, FiMessageSquare } from 'react-icons/fi';

const Chat = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { isListening, isSpeaking, transcript, voiceError, startListening, stopListening, speak, stopSpeaking } = useVoice();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isWaitingForTranscript = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { loadHistory(); }, []);

  // When transcript comes in after clicking mic → populate input box
  useEffect(() => {
    if (transcript && isWaitingForTranscript.current) {
      isWaitingForTranscript.current = false;
      setInput(transcript);
      // Focus the input so user can edit or press Enter to send
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [transcript]);

  const loadHistory = async () => {
    try { const { data } = await chatAPI.getHistory(); setHistory(data); }
    catch (err) { console.error('Failed to load history:', err); }
  };

  const handleSendMessage = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;
    setError('');
    const userMessage = text.trim();
    setInput('');

    const tempUserMsg = { _id: Date.now().toString(), userMessage, aiResponse: '', timestamp: new Date().toISOString(), isLoading: true };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const { data } = await chatAPI.sendMessage(userMessage);
      setMessages((prev) => prev.map((msg) => msg._id === tempUserMsg._id ? { ...data, isLoading: false } : msg));
      // Open apps/websites when action is detected
      if (data.action && data.action.type === 'url') {
        window.open(data.action.url, '_blank');
      }
      if (autoSpeak) speak(data.aiResponse);
      loadHistory();
    } catch (err) {
      setMessages((prev) => prev.map((msg) => msg._id === tempUserMsg._id ? { ...msg, isLoading: false, error: err.response?.data?.message || 'Failed' } : msg));
      setError(err.response?.data?.message || 'Failed to get response');
    } finally { setIsLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      isWaitingForTranscript.current = false;
    } else {
      isWaitingForTranscript.current = true;
      startListening();
    }
  };

  const handleSpeakClick = (text) => { isSpeaking ? stopSpeaking() : speak(text); };

  const loadChatFromHistory = (chat) => {
    setMessages([{ _id: chat._id, userMessage: chat.userMessage, aiResponse: chat.aiResponse, timestamp: chat.timestamp, isLoading: false }]);
    setShowHistory(false);
  };

  const clearChat = () => { setMessages([]); setError(''); };
  const clearAllHistory = async () => { try { await chatAPI.clearAll(); setHistory([]); setMessages([]); } catch (err) { console.error(err); } };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => {
    const d = new Date(ts), t = new Date(), y = new Date(t); y.setDate(y.getDate() - 1);
    if (d.toDateString() === t.toDateString()) return 'Today';
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${showHistory ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"><span className="text-lg font-bold text-white">L</span></div>
              <div><h2 className="font-semibold text-gray-800 dark:text-white">Luna</h2><p className="text-xs text-gray-500 dark:text-gray-400">AI Voice Assistant</p></div>
            </div>
            <button onClick={() => setShowHistory(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">History</h3>
            {history.length > 0 && <button onClick={clearAllHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"><FiTrash2 size={12} /> Clear</button>}
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500"><FiMessageSquare className="mx-auto mb-2 text-3xl" /><p className="text-sm">No chat history yet</p></div>
          ) : (
            <div className="space-y-2">
              {history.map((chat) => (
                <button key={chat._id} onClick={() => loadChatFromHistory(chat)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{chat.userMessage}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{chat.aiResponse}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(chat.timestamp)} at {formatTime(chat.timestamp)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"><FiUser className="text-purple-600 dark:text-purple-400" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.name || 'User'}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p></div>
          </div>
        </div>
      </div>
      {showHistory && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setShowHistory(false)} />}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowHistory(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><FiMessageSquare className="text-xl" /></button>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"><span className="text-sm font-bold text-white">L</span></div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">Luna</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setAutoSpeak(!autoSpeak)} className={`p-2 rounded-lg transition-colors ${autoSpeak ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title={autoSpeak ? 'Voice responses on' : 'Voice responses off'}>{autoSpeak ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}</button>
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle theme">{darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}</button>
            <button onClick={clearChat} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Clear chat"><FiTrash2 size={18} /></button>
            <button onClick={logout} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Logout"><FiLogOut size={18} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg"><span className="text-4xl font-bold text-white">L</span></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Hello, {user?.name || 'there'}!</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                I'm Luna! Type a message or click the 🎤 microphone button and speak — I'll listen and answer!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  { text: 'What is Artificial Intelligence?', icon: '🧠' },
                  { text: 'Explain Machine Learning', icon: '🤖' },
                  { text: 'What is the MERN stack?', icon: '⚛️' },
                  { text: 'Tell me about JavaScript', icon: '💻' },
                ].map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.text); handleSendMessage(s.text); }}
                    className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all text-left text-sm text-gray-700 dark:text-gray-300">
                    <span>{s.icon}</span><span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg._id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] md:max-w-[70%] bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <p className="text-sm">{msg.userMessage}</p>
                  <p className="text-[10px] text-purple-200 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
              {msg.isLoading ? (
                <div className="flex justify-start">
                  <div className="max-w-[80%] md:max-w-[70%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-purple-600 dark:text-purple-400">L</span></div>
                      <div className="flex space-x-1"><div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div><div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div><div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div></div>
                    </div>
                  </div>
                </div>
              ) : msg.error ? (
                <div className="flex justify-start">
                  <div className="max-w-[80%] md:max-w-[70%] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1"><div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-red-600 dark:text-red-400">⚠</span></div><span className="text-xs font-medium text-red-600 dark:text-red-400">Error</span></div>
                    <p className="text-sm text-red-600 dark:text-red-400">{msg.error}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[80%] md:max-w-[70%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm group">
                    <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-purple-600 dark:text-purple-400">L</span></div><span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Luna</span></div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.aiResponse}</p>
                    <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatTime(msg.timestamp)}</p>
                      <button onClick={() => handleSpeakClick(msg.aiResponse)} className={`p-1 rounded transition-colors ${isSpeaking ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`} title={isSpeaking ? 'Stop' : 'Read aloud'}>{isSpeaking ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isListening && (
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10 border-t border-purple-200/50 dark:border-purple-700/30 flex items-center justify-center gap-1">
            <div className="flex items-center gap-4">
              <div className="flex items-end gap-[3px] h-10">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="voice-wave-bar w-[4px] bg-gradient-to-t from-purple-500 to-indigo-500 rounded-full" style={{ height: `${Math.random() * 30 + 10}px` }}></div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full voice-active"></div>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Listening...</span>
              </div>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="px-4 py-2 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 border-t border-green-200/50 dark:border-green-700/30 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full speak-indicator"></div>
            <span className="text-sm text-green-600 dark:text-green-400">Luna is speaking...</span>
          </div>
        )}

        {error && <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><span>⚠</span> {error}</p></div>}
        {voiceError && <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border-t border-yellow-200 dark:border-yellow-800"><p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><span>⚠</span> {voiceError}</p></div>}

        <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 ${isListening ? 'pt-2' : ''}`}>
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                placeholder={isListening ? '🎤 Listening...' : 'Type a message or click 🎤 to speak'}
                disabled={isLoading || isListening}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
              <button onClick={handleMicClick} disabled={isLoading}
                className={`absolute right-2 bottom-1/2 translate-y-1/2 p-2 rounded-lg transition-all ${
                  isListening
                    ? 'text-white bg-red-500 shadow-lg shadow-red-500/50 voice-active scale-110'
                    : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                } disabled:opacity-50`}
                title={isListening ? 'Listening... click to stop' : 'Click, speak, and I will answer!'}>
                {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>
            </div>
            <button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <FiSend size={18} />}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
            {isListening
              ? '🎤 Listening... Speak now!'
              : isSpeaking
              ? '🔊 Luna is speaking...'
              : 'Click the 🎤 mic button, speak, and Luna will answer!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;