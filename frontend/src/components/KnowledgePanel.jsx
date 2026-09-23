import React, { useState } from 'react';
import { Database, PlusCircle, CheckCircle, Cpu, BookOpen, Globe, Search, Layers } from 'lucide-react';

export default function KnowledgePanel() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!content.trim() || ingesting) return;

    setIngesting(true);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('Failed to ingest datasheet into ChromaDB');
      }

      setSuccessMsg('Datasheet vectorized & embedded into ChromaDB!');
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      alert('Error ingesting document into Chroma DB.');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Database size={18} color="var(--primary-accent)" />
        <h3 style={styles.title}>Schematics & Component RAG</h3>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Cpu size={14} color="var(--primary-accent)" />
          <span>Active Agent Tools (@Tool)</span>
        </div>
        <div style={styles.toolList}>
          <div style={styles.toolCard}>
            <div style={styles.toolNameRow}>
              <Database size={12} color="var(--primary-accent)" />
              <strong>searchComponentSpecs(partNo)</strong>
            </div>
            <p>Queries ChromaDB for IC pinouts, voltage ratings, and package pinouts</p>
          </div>

          <div style={styles.toolCard}>
            <div style={styles.toolNameRow}>
              <Globe size={12} color="var(--secondary-accent)" />
              <strong>webSearchDatasheet(query)</strong>
            </div>
            <p>Scans online electronics distributors & web for replacement parts</p>
          </div>

          <div style={styles.toolCard}>
            <div style={styles.toolNameRow}>
              <Layers size={12} color="#a855f7" />
              <strong>calculateComponentValues(params)</strong>
            </div>
            <p>Calculates RC time constants, voltage divider ratios & LED resistors</p>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <BookOpen size={14} color="var(--secondary-accent)" />
          <span>Chroma DB Vector Ingestion</span>
        </div>
        <p style={styles.desc}>
          Paste component datasheets, repair logs, or schematic notes below. They will be embedded into Chroma DB for instant agent retrieval.
        </p>

        <form onSubmit={handleIngest} style={styles.form}>
          <input
            type="text"
            placeholder="Title (e.g. IRF3205 Pinouts & Thermal Specs)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Paste datasheet specs, schematic notes, or troubleshooting steps..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={ingesting || !content.trim()}
            style={{
              ...styles.submitBtn,
              opacity: (ingesting || !content.trim()) ? 0.6 : 1
            }}
          >
            {ingesting ? (
              <span>Vectorizing into Chroma DB...</span>
            ) : (
              <>
                <PlusCircle size={15} />
                <span>Ingest Component Specs</span>
              </>
            )}
          </button>
        </form>

        {successMsg && (
          <div style={styles.successBox}>
            <CheckCircle size={15} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  title: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#e2e8f0'
  },
  toolList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  toolCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  toolNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '2px',
    color: '#fff'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)'
  },
  desc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '0.82rem',
    outline: 'none'
  },
  textarea: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '0.82rem',
    outline: 'none',
    resize: 'vertical'
  },
  submitBtn: {
    background: 'var(--primary-gradient)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    color: 'var(--primary-accent)',
    fontSize: '0.78rem'
  }
};
