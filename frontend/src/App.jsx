import { useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 16v4h16v-4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    message: <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function App() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [apiError, setApiError] = useState(false);
  const fileInput = useRef(null);
  const chatEnd = useRef(null);

  const scrollToBottom = () => setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60);

  async function uploadFiles(fileList) {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;
    setNotice('');
    for (const file of selected) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(extension)) {
        setNotice(`${file.name}: please choose a PDF, DOCX or TXT file.`);
        continue;
      }
      const formData = new FormData();
      formData.append('file', file);
      setUploading(true);
      try {
        const response = await fetch(`${API_BASE}/files/upload`, { method: 'POST', body: formData });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.detail || payload.message || 'Upload failed.');
        setDocuments(current => [...current, { id: `${Date.now()}-${Math.random()}`, name: file.name, size: file.size, status: 'Ready' }]);
        setApiError(false);
        setNotice(`${file.name} uploaded and processed successfully.`);
      } catch (error) {
        setApiError(true);
        setNotice(`Could not upload ${file.name}: ${error.message}. Check that your backend is running.`);
      } finally { setUploading(false); }
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = question.trim();
    if (!text || sending) return;
    const userMessage = { id: Date.now(), role: 'user', content: text };
    setMessages(current => [...current, userMessage]);
    setQuestion('');
    setSending(true);
    setNotice('');
    scrollToBottom();
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: text })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'The assistant could not answer your question.');
      const answer = typeof payload === 'string' ? payload : (payload.ai_response || payload.response || payload.message || JSON.stringify(payload));
      setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', content: answer }]);
      setApiError(false);
    } catch (error) {
      setMessages(current => [...current, { id: Date.now() + 1, role: 'error', content: `${error.message} Make sure FastAPI is running at ${API_BASE}.` }]);
      setApiError(true);
    } finally { setSending(false); scrollToBottom(); }
  }

  function removeDocument(id) {
    setDocuments(current => current.filter(doc => doc.id !== id));
    setNotice('Removed from this screen. This does not delete the document from the backend knowledge base.');
  }

  function startNewChat() { setMessages([]); setQuestion(''); setNotice(''); }
  const formatSize = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Icon name="spark" size={21}/></div><div><strong>DocuMind</strong><span>DOCUMENT ASSISTANT</span></div></div>
      <button className="new-chat" onClick={startNewChat}><Icon name="plus"/> New conversation</button>
      <div className="side-section"><div className="section-heading"><span>YOUR DOCUMENTS</span><span className="count">{documents.length}</span></div>
        <button className="upload-tile" onClick={() => fileInput.current?.click()} disabled={uploading}><span className="upload-icon"><Icon name="upload"/></span><span><b>{uploading ? 'Processing file…' : 'Upload documents'}</b><small>PDF, DOCX or TXT</small></span><Icon name="plus" size={16}/></button>
        <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" multiple hidden onChange={e => uploadFiles(e.target.files)}/>
        <div className="document-list">{documents.length === 0 ? <div className="empty-docs"><div className="empty-file"><Icon name="file" size={21}/></div><p>No documents yet</p><span>Upload a file to start asking questions about it.</span></div> : documents.map(doc => <div className="document-row" key={doc.id}><div className="doc-icon"><Icon name="file" size={17}/></div><div className="doc-info"><b title={doc.name}>{doc.name}</b><small>{formatSize(doc.size)} · {doc.status}</small></div><button className="remove-doc" title="Remove from list" onClick={() => removeDocument(doc.id)}><Icon name="trash" size={15}/></button></div>)}</div>
      </div>
      <div className="sidebar-bottom"><div className="connection"><span className={`status-dot ${apiError ? 'offline' : ''}`}></span><span>{apiError ? 'Check backend connection' : 'API connection checked on use'}</span></div><div className="sidebar-note">Your documents. One simple conversation.</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Icon name="spark" size={18}/></div><strong>DocuMind</strong></div><div className="breadcrumb">Workspace <span>/</span> <b>Document chat</b></div><div className="topbar-right"><span className="secure-dot"></span><span>Private workspace</span></div></header>
      <section className="chat-layout">
        <div className="chat-heading"><div><div className="eyebrow">YOUR AI WORKSPACE</div><h1>Chat with your documents</h1><p>Ask questions and get answers based on the files you upload.</p></div><div className="doc-counter"><Icon name="file" size={17}/><span>{documents.length} {documents.length === 1 ? 'document' : 'documents'} added</span></div></div>
        {notice && <div className={`notice ${apiError ? 'notice-error' : ''}`}><Icon name={apiError ? 'alert' : 'check'} size={16}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
        <div className="conversation" aria-live="polite">
          {messages.length === 0 ? <div className="welcome-wrap"><div className="welcome-card"><div className="welcome-icon"><Icon name="spark" size={25}/></div><div className="welcome-kicker">WELCOME TO DOCUMIND</div><h2>Your documents,<br/><em>understood.</em></h2><p>Upload a document and ask anything about its content. I'll find the relevant information and explain it in simple words.</p><div className="steps"><div><span>1</span><b>Upload a file</b><small>Add a PDF, DOCX or TXT document</small></div><div><span>2</span><b>Ask a question</b><small>Type what you want to know</small></div><div><span>3</span><b>Get an answer</b><small>Explore your document with AI</small></div></div></div><div className="suggestions"><span>TRY ASKING</span><div className="suggestion-pills"><button onClick={() => setQuestion('Summarize this document')}>Summarize this document <span>↗</span></button><button onClick={() => setQuestion('What are the key points?')}>What are the key points? <span>↗</span></button><button onClick={() => setQuestion('Explain this in simple words')}>Explain in simple words <span>↗</span></button></div></div></div> : <div className="message-list">{messages.map(message => <div className={`message message-${message.role}`} key={message.id}><div className="avatar">{message.role === 'user' ? 'Y' : <Icon name={message.role === 'error' ? 'alert' : 'spark'} size={17}/>}</div><div className="message-body"><div className="message-author">{message.role === 'user' ? 'You' : message.role === 'error' ? 'Connection issue' : 'DocuMind'}</div><div className="message-content">{message.content}</div></div></div>)}{sending && <div className="message message-assistant"><div className="avatar"><Icon name="spark" size={17}/></div><div className="message-body"><div className="message-author">DocuMind</div><div className="typing"><i></i><i></i><i></i><span>Thinking through your documents…</span></div></div></div>}<div ref={chatEnd}/></div>}
        </div>
        <div className="composer-wrap"><form className="composer" onSubmit={sendMessage}><textarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask a question about your documents…" rows="1"/><button className="send-button" type="submit" disabled={!question.trim() || sending} aria-label="Send message"><Icon name="send" size={18}/></button></form><div className="composer-hint"><span>Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for a new line</span><span><Icon name="spark" size={13}/> AI can make mistakes. Check important details.</span></div></div>
      </section>
    </main>
  </div>;
}

export default App;
