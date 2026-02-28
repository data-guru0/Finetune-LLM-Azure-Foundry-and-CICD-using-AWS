import { useState } from 'react';

const EyeIcon = ({ show }) => show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function ConfigModal({ onSave, existingConfig, onClose }) {
    const [form, setForm] = useState({
        endpoint: existingConfig?.endpoint || 'https://sudhanshugusain45-9835-resource.cognitiveservices.azure.com/',
        deployment: existingConfig?.deployment || 'gpt-4o-2024-08-06-project-demo',
        apiKey: existingConfig?.apiKey || '',
        botName: existingConfig?.botName || 'Support Assistant',
        systemPrompt: existingConfig?.systemPrompt || 'You are a helpful and professional customer support assistant. Be concise, friendly, and empathetic. Help users solve their problems efficiently.',
    });
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    const [testing, setTesting] = useState(false);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSave = () => {
        if (!form.apiKey.trim()) { setError('API Key is required.'); return; }
        if (!form.endpoint.trim()) { setError('Endpoint URL is required.'); return; }
        if (!form.deployment.trim()) { setError('Deployment name is required.'); return; }
        onSave(form);
    };

    const handleTest = async () => {
        if (!form.apiKey.trim() || !form.endpoint.trim() || !form.deployment.trim()) {
            setError('Please fill in all required fields first.'); return;
        }
        setTesting(true); setError('');
        try {
            const endpoint = form.endpoint.replace(/\/$/, '');
            const url = `${endpoint}/openai/deployments/${form.deployment}/chat/completions?api-version=2024-12-01-preview`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': form.apiKey,
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a test assistant. Reply with just "Connection successful!"' },
                        { role: 'user', content: 'Hello' },
                    ],
                    max_tokens: 20,
                    stream: false,
                }),
            });
            if (res.ok) {
                setError('✅ Connection successful! You can now save and start chatting.');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(`❌ ${data?.error?.message || `HTTP ${res.status} – connection failed.`}`);
            }
        } catch (e) {
            setError(`❌ Network error: ${e.message}`);
        } finally {
            setTesting(false);
        }
    };

    const isValid = form.apiKey.trim() && form.endpoint.trim() && form.deployment.trim();

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-brand">
                        <div className="modal-brand-icon">🤖</div>
                        <div>
                            <h2>Configure Your Bot</h2>
                            <p>Connect your Azure OpenAI deployment to get started</p>
                        </div>
                    </div>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-banner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span style={{ color: error.startsWith('✅') ? '#86efac' : undefined }}>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">API Key <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="apiKey"
                                type={showKey ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter your Azure OpenAI API key"
                                value={form.apiKey}
                                onChange={handleChange}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                onClick={() => setShowKey(s => !s)}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                    display: 'flex', padding: '4px', width: '20px', height: '20px'
                                }}
                            >
                                <EyeIcon show={showKey} />
                            </button>
                        </div>
                        <span className="form-hint">Your key is stored locally and never sent anywhere except Azure.</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Azure Endpoint <span className="required">*</span></label>
                        <input
                            name="endpoint"
                            type="text"
                            className="form-input"
                            placeholder="https://your-resource.cognitiveservices.azure.com/"
                            value={form.endpoint}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Deployment Name <span className="required">*</span></label>
                        <input
                            name="deployment"
                            type="text"
                            className="form-input"
                            placeholder="gpt-4o-2024-08-06-project-demo"
                            value={form.deployment}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bot Name</label>
                        <input
                            name="botName"
                            type="text"
                            className="form-input"
                            placeholder="Support Assistant"
                            value={form.botName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">System Prompt</label>
                        <textarea
                            name="systemPrompt"
                            className="form-input"
                            placeholder="You are a helpful customer support assistant..."
                            value={form.systemPrompt}
                            onChange={handleChange}
                            rows={3}
                            style={{ resize: 'vertical', minHeight: '72px' }}
                        />
                        <span className="form-hint">Defines how your bot behaves and responds.</span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={handleSave} disabled={!isValid}>
                        Save & Start Chatting
                    </button>
                    <button className="btn-secondary" onClick={handleTest} disabled={!isValid || testing}>
                        {testing ? 'Testing connection…' : 'Test Connection'}
                    </button>
                    {onClose && (
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    )}
                </div>
            </div>
        </div>
    );
}
