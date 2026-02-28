import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, disabled, isStreaming, placeholder }) {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }, [text]);

    const handleSend = () => {
        const msg = text.trim();
        if (!msg || disabled) return;
        setText('');
        onSend(msg);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="input-area">
            <div className="input-container">
                <div className="input-box">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || 'Type your message…'}
                        disabled={disabled && !isStreaming}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!text.trim() || (disabled && !isStreaming)}
                        title="Send message (Enter)"
                    >
                        {isStreaming ? (
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="input-footer">
                    Press Enter to send · Shift+Enter for new line · Powered by Azure GPT-4o
                </p>
            </div>
        </div>
    );
}
