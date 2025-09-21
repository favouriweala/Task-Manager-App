'use client';

import React from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { useNotificationTriggers } from '@/lib/hooks/useNotificationTriggers';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Initialize notification triggers
  useNotificationTriggers();

  return (
    <div className="flex h-screen bg-zyra-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        <main className="flex-1 overflow-y-auto scroll-smooth-mobile">
          <div className="container-mobile sm:container-tablet lg:container-desktop py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}