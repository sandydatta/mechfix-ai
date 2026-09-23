import React, { useState, useRef } from 'react';
import { Database, PlusCircle, CheckCircle, Cpu, BookOpen, Globe, FileText, UploadCloud, X, AlertCircle } from 'lucide-react';

export default function KnowledgePanel() {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'text'
  
  // Text state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // PDF state
  const [selectedPdf, setSelectedPdf] = useState(null);
  const pdfInputRef = useRef(null);

  const [ingesting, setIngesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please select a valid PDF document (.pdf).');
      return;
    }

    setSelectedPdf(file);
    setErrorMsg('');
  };

  const handleTextIngest = async (e) => {
    e.preventDefault();
    if (!content.trim() || ingesting) return;

    setIngesting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('Failed to ingest datasheet into ChromaDB');
      }

      setSuccessMsg('Text snippet vectorized & embedded into ChromaDB!');
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Error ingesting document into Chroma DB.');
    } finally {
      setIngesting(false);
    }
  };

  const handlePdfIngest = async (e) => {
    e.preventDefault();
    if (!selectedPdf || ingesting) return;

    setIngesting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedPdf);
      if (title.trim()) {
        formData.append('title', title);
      }

      const response = await fetch('/api/ingest-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to ingest PDF into ChromaDB');
      }

      const data = await response.json();
      setSuccessMsg(`PDF "${data.filename || selectedPdf.name}" (${data.pages || 'multi'} pages) parsed & embedded into ChromaDB!`);
      setSelectedPdf(null);
      setTitle('');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error uploading & parsing PDF.');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Database size={18} color="var(--primary-accent)" />
        <h3 style={styles.title}>Schematics & Component RAG</h3>
      </div>

      {/* Tools Section */}
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
        </div>
      </div>

      <div style={styles.divider} />

      {/* Chroma DB Ingestion Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <BookOpen size={14} color="var(--secondary-accent)" />
          <span>Chroma DB Vector Ingestion</span>
        </div>

        {/* Tab Selector */}
        <div style={styles.tabBar}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'pdf' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'pdf' ? '#000' : 'var(--text-muted)'
            }}
            onClick={() => { setActiveTab('pdf'); setSuccessMsg(''); setErrorMsg(''); }}
          >
            <FileText size={13} />
            <span>PDF Brochure Upload</span>
          </button>

          <button
            type="button"
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'text' ? 'var(--primary-accent)' : 'transparent',
              color: activeTab === 'text' ? '#000' : 'var(--text-muted)'
            }}
            onClick={() => { setActiveTab('text'); setSuccessMsg(''); setErrorMsg(''); }}
          >
            <PlusCircle size={13} />
            <span>Text Snippet</span>
          </button>
        </div>

        {/* PDF Ingestion Form */}
        {activeTab === 'pdf' ? (
          <form onSubmit={handlePdfIngest} style={styles.form}>
            <p style={styles.desc}>
              Upload company brochures, component catalogs, or equipment PDF datasheets. The agent extracts full text and embeds it into Chroma DB.
            </p>

            <input
              type="text"
              placeholder="Document Title (e.g. MechFix Company Brochure 2026)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={pdfInputRef}
              onChange={handlePdfSelect}
              style={{ display: 'none' }}
            />

            {!selectedPdf ? (
              <div
                style={styles.pdfDropZone}
                onClick={() => pdfInputRef.current?.click()}
              >
                <UploadCloud size={28} color="var(--secondary-accent)" />
                <span style={styles.dropZoneTitle}>Click to select PDF Brochure</span>
                <span style={styles.dropZoneSub}>Supports PDF catalogs, manuals & datasheets</span>
              </div>
            ) : (
              <div style={styles.selectedPdfBox}>
                <div style={styles.pdfIconBadge}>
                  <FileText size={20} color="#f59e0b" />
                </div>
                <div style={styles.pdfInfo}>
                  <span style={styles.pdfName}>{selectedPdf.name}</span>
                  <span style={styles.pdfSize}>{(selectedPdf.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedPdf(null); if (pdfInputRef.current) pdfInputRef.current.value = ''; }}
                  style={styles.removePdfBtn}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={ingesting || !selectedPdf}
              style={{
                ...styles.submitBtn,
                opacity: (ingesting || !selectedPdf) ? 0.6 : 1
              }}
            >
              {ingesting ? (
                <span>Parsing PDF & Vectorizing into Chroma DB...</span>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>Upload & Ingest PDF to Chroma DB</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Text Snippet Form */
          <form onSubmit={handleTextIngest} style={styles.form}>
            <p style={styles.desc}>
              Paste raw component specs or troubleshooting notes below to embed directly into Chroma DB.
            </p>

            <input
              type="text"
              placeholder="Title (e.g. IRF3205 Pinouts & Thermal Specs)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
            <textarea
              placeholder="Paste text specs or troubleshooting notes..."
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
                  <span>Ingest Text Snippet</span>
                </>
              )}
            </button>
          </form>
        )}

        {successMsg && (
          <div style={styles.successBox}>
            <CheckCircle size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={styles.errorBox}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
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
  tabBar: {
    display: 'flex',
    gap: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
  pdfDropZone: {
    border: '2px dashed var(--border-accent)',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  dropZoneTitle: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#fff'
  },
  dropZoneSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  selectedPdfBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid var(--border-accent)',
    borderRadius: '8px'
  },
  pdfIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  pdfInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '10px'
  },
  pdfName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px'
  },
  pdfSize: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  removePdfBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fca5a5',
    cursor: 'pointer',
    padding: '4px'
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
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.78rem'
  }
};
