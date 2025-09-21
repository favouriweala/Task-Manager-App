
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface MobileNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'AI Agents',
    href: '/ai-agents',
    icon: Bot,
  },
];

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className={cn(
        "lg:hidden zyra-header border-0 safe-top",
        "px-4 py-4 flex items-center justify-between shadow-zyra-card",
        className
      )}>
        <h1 className="text-responsive-lg font-semibold text-white">✨ Zyra Task Manager</h1>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={toggleMenu}
            className="btn-mobile rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 touch-manipulation tap-highlight-none transition-all duration-200"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-zyra-card",
        "transform transition-transform duration-300 ease-in-out shadow-mobile-lg safe-left",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Logo */}
        <div className="flex items-center justify-between mobile-padding border-b border-zyra-border safe-top">
          <h1 className="text-responsive-xl font-bold text-blue-600 dark:text-blue-400">Zyra</h1>
          <button
            onClick={closeMenu}
            className="btn-mobile rounded-md text-zyra-text-secondary hover:text-zyra-text-primary hover:bg-zyra-background touch-manipulation tap-highlight-none"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 mobile-padding py-6 space-y-2 scroll-smooth-mobile overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "mobile-nav-item",
                  isActive
                    ? "bg-zyra-primary/10 text-zyra-primary border-r-2 border-zyra-primary"
                    : "text-zyra-text-secondary hover:bg-zyra-background hover:text-zyra-text-primary active:bg-zyra-background"
                )}
              >
                <Icon className="w-6 h-6 mr-4 flex-shrink-0" />
                <span className="text-responsive-base">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Bottom section */}
        <div className="mobile-padding py-4 border-t border-zyra-border space-y-2 safe-bottom">
          <Link
            href="/settings"
            onClick={closeMenu}
            className="mobile-nav-item text-zyra-text-secondary hover:bg-zyra-background hover:text-zyra-text-primary active:bg-zyra-background"
          >
            <Settings className="w-6 h-6 mr-4 flex-shrink-0" />
            <span className="text-responsive-base">Settings</span>
          </Link>
          
          <button
            className="mobile-nav-item w-full text-left text-zyra-text-secondary hover:bg-zyra-background hover:text-zyra-text-primary active:bg-zyra-background"
            onClick={() => {
              closeMenu();
              // Handle logout
              console.log('Logout clicked');
            }}
          >
            <LogOut className="w-6 h-6 mr-4 flex-shrink-0" />
            <span className="text-responsive-base">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}