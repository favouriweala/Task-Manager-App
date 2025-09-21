
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
];

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className={cn("lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between", className)}>
        <h1 className="text-lg font-bold text-blue-600">Zyra</h1>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Zyra</h1>
          <button
            onClick={closeMenu}
            className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                )}
              >
                <Icon className="w-6 h-6 mr-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Bottom section */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2">
          <Link
            href="/settings"
            onClick={closeMenu}
            className="flex items-center px-4 py-3 text-base font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <Settings className="w-6 h-6 mr-4" />
            Settings
          </Link>
          
          <button
            className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors touch-manipulation"
            onClick={() => {
              closeMenu();
              // Handle logout
              console.log('Logout clicked');
            }}
          >
            <LogOut className="w-6 h-6 mr-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}