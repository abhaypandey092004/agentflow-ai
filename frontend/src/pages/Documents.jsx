import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDataStore } from '../store/useDataStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { UploadCloud, File, Trash2, Eye, X, Copy, CheckCircle2 } from 'lucide-react';

const Documents = () => {
  const { documents, loading, fetchDocuments, removeDocument } = useDataStore();
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedText, setParsedText] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const DocumentSkeleton = () => (
    <div className="glass-card flex flex-col rounded-3xl p-6 shimmer">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
          <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
        </div>
      </div>
      <div className="h-4 w-3/4 bg-white/5 rounded-lg mb-2"></div>
      <div className="h-3 w-1/2 bg-white/5 rounded-lg"></div>
    </div>
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDocuments(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, storagePath) => {
    if (!window.confirm('Delete this document?')) return;
    
    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePath]);
        
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;

      removeDocument(id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete document');
    }
  };

  const handleParse = async (id) => {
    try {
      setParsing(true);
      const { data } = await api.get(`/uploads/${id}/parse`);
      setParsedText(data.text);
    } catch (err) {
      console.error('Parse failed:', err);
      alert('Failed to extract text from document');
    } finally {
      setParsing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(parsedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInitialLoading = loading.documents && documents.length === 0;

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-white/5 rounded-xl shimmer"></div>
            <div className="h-4 w-64 bg-white/5 rounded-lg shimmer"></div>
          </div>
          <div className="h-12 w-40 bg-white/5 rounded-xl shimmer"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DocumentSkeleton />
          <DocumentSkeleton />
          <DocumentSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Documents</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Manage knowledge assets for your AI agents.</p>
        </div>
        <div className="w-full sm:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx,.txt"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <UploadCloud size={20} />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
          </motion.button>
        </div>
      </div>

      {documents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center"
        >
          <div className="rounded-2xl bg-white/5 p-6 mb-4 text-slate-500">
            <File size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No Assets</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            Upload PDF, DOCX, or TXT files to provide context to your agent-driven workflows.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, index) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="group glass-card relative flex flex-col rounded-3xl p-6 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="rounded-2xl bg-white/5 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <File size={28} className="text-primary-400 glow-primary" />
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleParse(doc.id)}
                    disabled={parsing}
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                    title="Extract Text"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id, doc.storage_path)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white truncate mb-2 group-hover:text-primary-400 transition-colors" title={doc.file_name}>
                {doc.file_name}
              </h3>
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                Uploaded {new Date(doc.created_at).toLocaleDateString()}
              </p>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/2 blur-2xl group-hover:bg-primary-500/5 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Extracted Text Modal */}
      <AnimatePresence>
        {parsedText !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl glass-card border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Extracted Intelligence</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Raw text content from the uploaded document.</p>
                </div>
                <button 
                  onClick={() => setParsedText(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed bg-white/2 p-6 rounded-2xl border border-white/5">
                  {parsedText}
                </pre>
              </div>
              <div className="border-t border-white/5 px-8 py-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
