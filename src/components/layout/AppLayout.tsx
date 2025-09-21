'use client';

import React from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { MobileNavigation } from '../navigation/MobileNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}