// src/components/SnippetManager.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Trash2, Download, Upload, Database, HardDrive } from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import Link from 'next/link';

interface Snippet {
  id: string;
  text: string;
  sourceUrl: string;
  pageTitle: string;
  comment: string;
  timestamp: number;
}

type StorageMethod = 'localStorage' | 'indexedDB';

const SnippetManager = () => {
  // Use custom storage hook with indexedDB as the default
  const [storageMethod, setStorageMethod] = useState<StorageMethod>(
    // Check if indexedDB is available, fallback to localStorage
    typeof window !== 'undefined' && 'indexedDB' in window ? 'indexedDB' : 'localStorage'
  );
  
  const [snippets, setSnippets, loading] = useStorage<Snippet[]>('snippets', [], {
    storageType: storageMethod,
    dbName: 'snippetManagerDB',
    storeName: 'snippets'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [importExportOpen, setImportExportOpen] = useState(false);
  const snippetsPerPage = 20;

  // Handle switching storage methods
  const switchStorageMethod = async (method: StorageMethod) => {
    if (method === storageMethod) return;
    
    // First, get the current snippets
    const currentSnippets = [...snippets];
    
    // Change the storage method
    setStorageMethod(method);
    
    // Wait for the storage method to change and then set the snippets
    setTimeout(() => {
      setSnippets(currentSnippets);
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    
    // Get source URL from dragstart event data or fallback to current URL
    const sourceUrl = e.dataTransfer.getData('text/source-url') || window.location.href;
    const pageTitle = e.dataTransfer.getData('text/page-title') || document.title;
    
    const newSnippet: Snippet = {
      id: Date.now().toString(),
      text,
      sourceUrl,
      pageTitle,
      comment: '',
      timestamp: Date.now(),
    };

    setSnippets(prev => [newSnippet, ...prev]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleExpand = (id: string) => {
    setExpandedSnippets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (id: string, currentComment: string) => {
    setEditingComment(id);
    setCommentText(currentComment);
  };

  const saveComment = (id: string) => {
    setSnippets(prev =>
      prev.map(snippet =>
        snippet.id === id ? { ...snippet, comment: commentText } : snippet
      )
    );
    setEditingComment(null);
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
  };

  // Export snippets to a JSON file
  const exportSnippets = () => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `snippet-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import snippets from a JSON file
  const importSnippets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const importedSnippets = JSON.parse(e.target.result as string) as Snippet[];
            // Append the imported snippets to existing ones
            setSnippets([...importedSnippets, ...snippets]);
          } catch (error) {
            alert("Invalid JSON file. Please select a valid snippet export file.");
          }
        }
      };
    }
  };

  // Filter snippets by search term
  const filteredSnippets = snippets.filter(snippet => 
    snippet.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSnippets = filteredSnippets.slice(
    (currentPage - 1) * snippetsPerPage,
    currentPage * snippetsPerPage
  );

  const totalPages = Math.ceil(filteredSnippets.length / snippetsPerPage);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-12">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Snippet Manager</h1>
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => switchStorageMethod('localStorage')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-l border ${
                storageMethod === 'localStorage' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800' 
                  : 'bg-gray-100 border-gray-300'
              }`}
              title="Local Storage (cleared when browser history is cleared)"
            >
              <HardDrive size={16} />
              <span className="hidden sm:inline">Local</span>
            </button>
            
            <button
              onClick={() => switchStorageMethod('indexedDB')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-r border ${
                storageMethod === 'indexedDB' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800' 
                  : 'bg-gray-100 border-gray-300'
              }`}
              title="IndexedDB (more persistent than Local Storage)"
            >
              <Database size={16} />
              <span className="hidden sm:inline">IndexedDB</span>
            </button>
          </div>
          
          <button
            onClick={() => setImportExportOpen(!importExportOpen)}
            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
          >
            Import/Export
          </button>
        </div>
      </div>
      
      {importExportOpen && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Import/Export Snippets</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label
                htmlFor="importFile"
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
              >
                <Upload size={16} />
                <span>Import</span>
              </label>
              <input
                id="importFile"
                type="file"
                accept=".json"
                onChange={importSnippets}
                className="hidden"
              />
            </div>
            
            <button
              onClick={exportSnippets}
              className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Export creates a JSON file of your snippets. Import lets you restore them on any device.
          </p>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border rounded"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <p className="text-gray-600">Drag and drop text here to save a snippet</p>
        <p className="text-sm text-gray-500 mt-2">
          {storageMethod === 'indexedDB' 
            ? 'Using IndexedDB (more persistent storage)' 
            : 'Using LocalStorage (may be cleared with browser history)'}
        </p>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No snippets saved yet.</p>
          <Link href="/test" className="text-blue-600 hover:underline mt-2 inline-block">
            Go to test page to try it out
          </Link>
        </div>
      ) : paginatedSnippets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No snippets match your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedSnippets.map(snippet => (
            <div key={snippet.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExpand(snippet.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSnippets.has(snippet.id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                  <a
                    href={snippet.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span className="truncate max-w-[200px] sm:max-w-md">
                      {snippet.pageTitle || 'Untitled Page'}
                    </span>
                    <ExternalLink size={14} />
                  </a>
                </div>
                <button
                  onClick={() => deleteSnippet(snippet.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={`transition-all duration-200 ${
                expandedSnippets.has(snippet.id) ? 'block' : 'hidden'
              }`}>
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{snippet.text}</p>
                
                {editingComment === snippet.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 border rounded"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          saveComment(snippet.id);
                        }
                        if (e.key === 'Escape') {
                          setEditingComment(null);
                        }
                      }}
                      rows={3}
                      placeholder="Add your comment here..."
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveComment(snippet.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => startEditing(snippet.id, snippet.comment)}
                    className="text-gray-600 italic cursor-text hover:bg-gray-50 p-2 rounded"
                  >
                    {snippet.comment || 'Click to add a comment...'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SnippetManager;
