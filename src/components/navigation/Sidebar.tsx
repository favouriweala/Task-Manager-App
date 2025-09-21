'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-full", className)}>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Zyra</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-2">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Link>
        
        <button
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          onClick={() => {
            // Handle logout
            console.log('Logout clicked');
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}