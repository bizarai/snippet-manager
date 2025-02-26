"use client"

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Trash2 } from 'lucide-react';

interface Snippet {
  id: string;
  text: string;
  sourceUrl: string;
  pageTitle: string;
  comment: string;
  timestamp: number;
}

const SnippetManager = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<string>('');
  const snippetsPerPage = 20;

  useEffect(() => {
    const savedSnippets = localStorage.getItem('snippets');
    if (savedSnippets) {
      setSnippets(JSON.parse(savedSnippets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('snippets', JSON.stringify(snippets));
  }, [snippets]);

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

  const paginatedSnippets = snippets.slice(
    (currentPage - 1) * snippetsPerPage,
    currentPage * snippetsPerPage
  );

  const totalPages = Math.ceil(snippets.length / snippetsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <p className="text-gray-600">Drag and drop text here to save a snippet</p>
      </div>

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
                  <span>{snippet.pageTitle || 'Untitled Page'}</span>
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
                      if (e.key === 'Enter' && e.metaKey) {
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