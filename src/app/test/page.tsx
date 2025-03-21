// src/app/test/page.tsx
"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TestPage() {
  const pathname = usePathname();
  
  // Handle basePath for GitHub Pages links
  const getBasePath = () => {
    // In production, we need to include the basePath
    if (process.env.NODE_ENV === 'production') {
      return '/snippet-manager';
    }
    return '';
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    // Get the full URL including basePath
    let origin = '';
    try {
      origin = window.location.origin;
    } catch (error) {
      console.error('Failed to get window.location.origin:', error);
    }
    
    // Add source URL and page title to the drag data
    try {
      e.dataTransfer.setData('text/source-url', origin + pathname);
      e.dataTransfer.setData('text/page-title', 'Test Content Page');
      e.dataTransfer.setData('text/plain', e.currentTarget.textContent || '');
      
      // Make sure data is properly set with fallbacks
      console.log('Drag started:', {
        url: origin + pathname,
        title: 'Test Content Page',
        text: e.currentTarget.textContent
      });
    } catch (error) {
      console.error('Error during drag start:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Test Content for Drag and Drop
      </h1>
      
      <div className="border-l-4 border-blue-500 pl-4 my-8 text-gray-600">
        Try selecting and dragging any of the text below to your snippet manager.
      </div>

      <div 
        className="bg-gray-50 p-6 rounded-lg mb-6"
        draggable="true"
        onDragStart={handleDragStart}
      >
        &quot;The only way to do great work is to love what you do.&quot; - Steve Jobs
      </div>

      <div 
        className="bg-gray-50 p-6 rounded-lg mb-6"
        draggable="true"
        onDragStart={handleDragStart}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut labore et dolore magna aliqua.
      </div>

      <div 
        className="bg-gray-50 p-6 rounded-lg mb-6 font-mono whitespace-pre"
        draggable="true"
        onDragStart={handleDragStart}
      >
{`import React from 'react';

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}`}
      </div>

      <div className="fixed bottom-4 right-4">
        <Link
          href={`${getBasePath()}/`}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Back to Snippet Manager
        </Link>
      </div>
    </div>
  );
}
