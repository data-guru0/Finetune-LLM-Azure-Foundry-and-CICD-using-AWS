import { useState, useEffect, useRef, useCallback } from 'react';
import ConfigModal from './components/ConfigModal';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import './index.css';

const STORAGE_KEY = 'support_bot_config';
const SESSIONS_KEY = 'support_bot_sessions';

function App() {
  const [config, setConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load config and sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setConfig(JSON.parse(saved)); } catch { }
    } else {
      setShowConfigModal(true);
    }
    const savedSessions = localStorage.getItem(SESSIONS_KEY);
    if (savedSessions) {
      try {
        const s = JSON.parse(savedSessions);
        setSessions(s);
        if (s.length > 0) setActiveSessionId(s[0].id);
      } catch { }
    }
  }, []);

  const saveConfig = (cfg) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setConfig(cfg);
    setShowConfigModal(false);
    // Start a new session if none exist
    if (sessions.length === 0) createNewSession(cfg);
  };

  const createNewSession = useCallback((cfg = config) => {
    if (!cfg) { setShowConfigModal(true); return; }
    const id = Date.now().toString();
    const newSession = { id, title: 'New conversation', messages: [], createdAt: new Date().toISOString() };
    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveSessionId(id);
  }, [config, sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const updateSession = useCallback((id, messages) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        // Auto-title from first user message
        let title = s.title;
        if (title === 'New conversation' && messages.length > 0) {
          const firstUser = messages.find(m => m.role === 'user');
          if (firstUser) title = firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '...' : '');
        }
        return { ...s, messages, title };
      });
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const sendMessage = useCallback(async (userText) => {
    if (!config || !activeSession || isStreaming) return;

    const userMsg = { role: 'user', content: userText, timestamp: new Date().toISOString() };
    const newMessages = [...activeSession.messages, userMsg];
    updateSession(activeSession.id, newMessages);

    setIsStreaming(true);
    const botMsgId = `bot-${Date.now()}`;
    const botMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString(), id: botMsgId, streaming: true };
    const msgsWithBot = [...newMessages, botMsg];
    updateSession(activeSession.id, msgsWithBot);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          apiKey: config.apiKey,
          endpoint: config.endpoint,
          deployment: config.deployment,
          systemPrompt: config.systemPrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || 'Server error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullContent += parsed.content;
              setSessions(prev => {
                const updated = prev.map(s => {
                  if (s.id !== activeSession.id) return s;
                  const updatedMsgs = s.messages.map(m =>
                    m.id === botMsgId ? { ...m, content: fullContent } : m
                  );
                  return { ...s, messages: updatedMsgs };
                });
                localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                return updated;
              });
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e;
          }
        }
      }

      // Mark streaming done
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id !== activeSession.id) return s;
          const updatedMsgs = s.messages.map(m =>
            m.id === botMsgId ? { ...m, streaming: false } : m
          );
          return { ...s, messages: updatedMsgs };
        });
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id !== activeSession.id) return s;
          const updatedMsgs = s.messages.map(m =>
            m.id === botMsgId
              ? { ...m, content: `⚠️ Error: ${err.message}`, streaming: false, error: true }
              : m
          );
          return { ...s, messages: updatedMsgs };
        });
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [config, activeSession, isStreaming, updateSession]);

  const clearSession = useCallback(() => {
    if (!activeSession) return;
    updateSession(activeSession.id, []);
  }, [activeSession, updateSession]);

  return (
    <div className="app">
      {(showConfigModal || !config) && (
        <ConfigModal
          onSave={saveConfig}
          existingConfig={config}
          onClose={config ? () => setShowConfigModal(false) : null}
        />
      )}

      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={createNewSession}
        onOpenSettings={() => setShowConfigModal(true)}
      />

      <main className="main-content">
        <TopBar
          botName={config?.botName || 'Support Assistant'}
          isConnected={!!config && !showConfigModal}
          onOpenSettings={() => setShowConfigModal(true)}
          onClear={clearSession}
        />

        <ChatMessages
          messages={activeSession?.messages || []}
          isStreaming={isStreaming}
          onChipClick={sendMessage}
        />

        <ChatInput
          onSend={sendMessage}
          disabled={!config || isStreaming}
          isStreaming={isStreaming}
          placeholder={!config ? 'Configure API key to start…' : 'Type your message…'}
        />
      </main>
    </div>
  );
}

export default App;
