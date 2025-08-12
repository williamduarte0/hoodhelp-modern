import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from './ui/button';
import { Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 py-3  h-[65px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="md:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="md:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-semibold text-gray-900">HoodHelp</span>
            </div>

            <div className="ml-auto flex items-center space-x-2 ">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
