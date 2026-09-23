import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Wrench, User, RefreshCw, Sparkles, Image as ImageIcon, X, AlertCircle, Search, Layers, Globe } from 'lucide-react';

const SUGGESTIONS = [
  "Troubleshoot swollen 1000uF 25V electrolytic capacitor on PSU board",
  "Identify replacement for burnt N-channel MOSFET IRF3205",
  "Check ChromaDB pinout & specs for NE555 timer IC",
  "Search web for LM317 adjustable regulator datasheet & substitutes"
];

export default function ChatWindow({ sessionId, onResetSession }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: "⚡ **MechFixAI Diagnostic Engine Online**\n\nI specialize in electronics failure analysis, component identification, and troubleshooting.\n\n### How I can assist:\n1. 📷 **Upload an image** of a defective component, burnt PCB, or unknown IC for visual diagnosis.\n2. 🗄️ **Chroma DB Search**: I query internal component datasheets, pinouts, and common failure modes.\n3. 🌐 **Live Web Search**: I scan online databases and suppliers for active component pricing, datasheets, and cross-references.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl, base64 }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if ((!text.trim() && !selectedImage) || loading) return;

    const currentImage = selectedImage;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text || "Uploaded component image for diagnostic analysis.",
      image: currentImage?.previewUrl || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          imageData: currentImage?.base64 || null,
          imageName: currentImage?.file?.name || null
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: data.reply || "Diagnostic completed.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to MechFixAI engine. Ensure backend container is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.badgeBox}>
            <Wrench size={20} color="#fff" />
          </div>
          <div>
            <h2 style={styles.title}>Diagnostic Console</h2>
            <span style={styles.subtitle}>Multimodal Part Analysis & Defect Identification</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.sessionBadge}>Session: {sessionId.substring(0, 8)}...</span>
          <button 
            onClick={onResetSession}
            style={styles.iconBtn}
            title="Reset Diagnostic Session"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Message History */}
      <div style={styles.messagesList}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="animate-fade-in"
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.sender === 'agent' && (
              <div style={styles.avatarAgent}>
                <Wrench size={16} color="var(--primary-accent)" />
              </div>
            )}

            <div style={{
              ...styles.bubble,
              backgroundColor: msg.sender === 'user' ? 'var(--user-bubble)' : 'var(--agent-bubble)',
              border: msg.sender === 'user' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)'
            }}>
              {msg.image && (
                <div style={styles.imageBubbleWrapper}>
                  <img src={msg.image} alt="Defective Component" style={styles.partImagePreview} />
                  <span style={styles.imageTag}>📷 Component Snapshot Attached</span>
                </div>
              )}

              <div style={styles.markdownWrapper}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              <span style={styles.timestamp}>{msg.time}</span>
            </div>

            {msg.sender === 'user' && (
              <div style={styles.avatarUser}>
                <User size={16} color="#fff" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={styles.avatarAgent}>
              <Wrench size={16} color="var(--primary-accent)" />
            </div>
            <div style={{ ...styles.bubble, backgroundColor: 'var(--agent-bubble)' }}>
              <div style={styles.loadingBox}>
                <div style={styles.typingDots}>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </div>
                <span style={styles.loadingText}>Analyzing visual defects, searching ChromaDB & Web...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length < 3 && (
        <div style={styles.suggestionsContainer}>
          <div style={styles.suggestionsHeader}>
            <Sparkles size={14} color="var(--primary-accent)" />
            <span>Common Diagnostic Prompts:</span>
          </div>
          <div style={styles.suggestionsRow}>
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} style={styles.suggestionChip} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Attachment Preview bar */}
      {selectedImage && (
        <div style={styles.imagePreviewBar}>
          <div style={styles.previewImageThumbBox}>
            <img src={selectedImage.previewUrl} alt="Part preview" style={styles.previewThumb} />
            <div style={styles.imageInfo}>
              <span style={styles.imageName}>{selectedImage.file.name}</span>
              <span style={styles.imageSize}>{(selectedImage.file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <button onClick={clearSelectedImage} style={styles.removeImageBtn} title="Remove image">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.attachBtn}
          title="Upload image of defective part or PCB"
        >
          <ImageIcon size={20} color={selectedImage ? 'var(--primary-accent)' : 'var(--text-muted)'} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe symptoms, part markings, or upload an image of defective component..."
          style={styles.inputField}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !selectedImage)}
          style={{
            ...styles.sendBtn,
            opacity: (loading || (!input.trim() && !selectedImage)) ? 0.5 : 1
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  badgeBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sessionBadge: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)'
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  messagesList: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    maxWidth: '88%'
  },
  avatarAgent: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  avatarUser: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    padding: '14px 18px',
    borderRadius: '16px',
    maxWidth: '100%',
    wordBreak: 'break-word',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)'
  },
  imageBubbleWrapper: {
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  partImagePreview: {
    maxHeight: '220px',
    maxWidth: '100%',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  imageTag: {
    fontSize: '0.7rem',
    color: 'var(--primary-accent)',
    fontWeight: '600'
  },
  markdownWrapper: {
    fontSize: '0.92rem',
    lineHeight: '1.55',
    color: '#e2e8f0'
  },
  timestamp: {
    display: 'block',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
    textAlign: 'right'
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  loadingText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  typingDots: {
    display: 'flex',
    gap: '4px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-accent)',
    animation: 'pulseGlow 1s infinite ease-in-out'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.85rem'
  },
  suggestionsContainer: {
    padding: '10px 20px',
    borderTop: '1px solid var(--border-color)'
  },
  suggestionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },
  suggestionsRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  suggestionChip: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '999px',
    padding: '6px 12px',
    color: '#cbd5e1',
    fontSize: '0.78rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  imagePreviewBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderTop: '1px solid var(--border-accent)'
  },
  previewImageThumbBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  previewThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '1px solid var(--primary-accent)'
  },
  imageInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  imageName: {
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '600'
  },
  imageSize: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  removeImageBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fca5a5',
    cursor: 'pointer',
    padding: '4px'
  },
  inputForm: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)'
  },
  attachBtn: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  inputField: {
    flex: 1,
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.92rem',
    outline: 'none'
  },
  sendBtn: {
    background: 'var(--primary-gradient)',
    border: 'none',
    borderRadius: '12px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  }
};
