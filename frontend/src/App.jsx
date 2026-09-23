import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import KnowledgePanel from './components/KnowledgePanel';
import { Wrench, ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function App() {
  const [sessionId, setSessionId] = useState(() => 'diag-' + Math.random().toString(36).substring(2, 9));

  const resetSession = () => {
    setSessionId('diag-' + Math.random().toString(36).substring(2, 9));
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.brand}>
          <div style={styles.logoBox}>
            <Wrench size={22} color="#fff" />
          </div>
          <div>
            <div style={styles.titleRow}>
              <h1 style={styles.brandTitle}>MechFixAI</h1>
              <span style={styles.proBadge}>PRO DIAGNOSTICS</span>
            </div>
            <span style={styles.brandTag}>Electronics Defect Analysis • ChromaDB Vector Schematics • Live Web Search</span>
          </div>
        </div>

        <div style={styles.navRight}>
          <div style={styles.statusIndicator}>
            <Activity size={14} color="#06b6d4" />
            <span>Multimodal Vision & RAG Engine Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main style={styles.mainContent}>
        <div style={styles.chatCol}>
          <ChatWindow sessionId={sessionId} onResetSession={resetSession} />
        </div>
        <div style={styles.panelCol}>
          <KnowledgePanel />
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '16px 24px',
    boxSizing: 'border-box',
    gap: '16px'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'var(--primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '0.5px'
  },
  proBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: 'var(--primary-accent)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    letterSpacing: '0.5px'
  },
  brandTag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.78rem',
    color: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    padding: '6px 12px',
    borderRadius: '999px'
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '16px',
    minHeight: 0
  },
  chatCol: {
    flex: '3',
    height: '100%',
    minWidth: 0
  },
  panelCol: {
    flex: '1.2',
    height: '100%',
    minWidth: '300px'
  }
};
