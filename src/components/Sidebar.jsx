export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onOpenSettings }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-icon">🤖</div>
                    <div className="brand-text">
                        <h1>SupportBot AI</h1>
                        <p>Powered by Azure GPT-4o</p>
                    </div>
                </div>
                <button className="new-chat-btn" onClick={onNewChat}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Conversation
                </button>
            </div>

            <div className="sidebar-content">
                {sessions.length > 0 && (
                    <>
                        <div className="sidebar-section-label">Recent</div>
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={`conversation-item ${session.id === activeSessionId ? 'active' : ''}`}
                                onClick={() => onSelectSession(session.id)}
                            >
                                <span className="conversation-item-icon">💬</span>
                                <span className="conversation-item-text">{session.title}</span>
                            </div>
                        ))}
                    </>
                )}
                {sessions.length === 0 && (
                    <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                        No conversations yet. Start a new chat to get going!
                    </div>
                )}
            </div>

            <div className="sidebar-footer">
                <button className="settings-btn" onClick={onOpenSettings}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    API Settings
                </button>
            </div>
        </aside>
    );
}
