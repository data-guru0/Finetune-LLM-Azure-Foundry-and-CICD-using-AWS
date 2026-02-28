import { useEffect, useRef } from 'react';

const SUGGESTIONS = [
    'How can I track my order?',
    'What is your return policy?',
    'I need help with my account',
    'Talk to a human agent',
];

function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    return (
        <div className={`message-group ${isUser ? 'user' : 'bot'}`}>
            <div className={`message-avatar ${isUser ? 'user-avatar-sm' : 'bot-avatar-sm'}`}>
                {isUser ? '👤' : '🤖'}
            </div>
            <div className="message-body">
                <div className={`message-bubble ${isUser ? 'user' : 'bot'} ${message.error ? 'error-msg' : ''}`}
                    style={message.error ? { borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' } : {}}
                >
                    {message.content}
                    {message.streaming && message.content.length > 0 && (
                        <span style={{
                            display: 'inline-block', width: '2px', height: '14px',
                            background: 'var(--text-accent)', marginLeft: '2px',
                            verticalAlign: 'middle', animation: 'cursorBlink 0.8s steps(1) infinite'
                        }} />
                    )}
                </div>
                <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="message-group bot" style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div className="message-avatar bot-avatar-sm">🤖</div>
            <div className="message-body">
                <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                </div>
            </div>
        </div>
    );
}

export default function ChatMessages({ messages, isStreaming, onChipClick }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    const isEmpty = messages.length === 0;
    const lastIsBot = messages.length > 0 && messages[messages.length - 1].role === 'assistant';
    const showTyping = isStreaming && (!lastIsBot || (lastIsBot && messages[messages.length - 1].content === ''));

    return (
        <div className="messages-wrapper">
            <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
            <div className="messages-container">
                {isEmpty ? (
                    <div className="welcome-screen">
                        <div className="welcome-icon">🤖</div>
                        <h2>How can I help you today?</h2>
                        <p>I'm your AI-powered support assistant. Ask me anything about products, orders, accounts, or general support.</p>
                        <div className="welcome-chips">
                            {SUGGESTIONS.map(s => (
                                <button key={s} className="welcome-chip" onClick={() => onChipClick(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <MessageBubble key={msg.id || i} message={msg} />
                        ))}
                        {showTyping && <TypingIndicator />}
                    </>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
