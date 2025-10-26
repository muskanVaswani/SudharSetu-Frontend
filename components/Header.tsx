import React from 'react';
import { Page } from '../types';
import { SudharSetuIcon, UserGroupIcon, UserIcon } from './icons/Icons';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {

  const NavButton: React.FC<{ page: Page; label: string; icon: React.ReactElement }> = ({ page, label, icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <SudharSetuIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">SudharSetu</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
             <NavButton page={Page.User} label="My Complaints" icon={<UserIcon className="h-5 w-5" />} />
             <NavButton page={Page.Public} label="Public View" icon={<UserGroupIcon className="h-5 w-5" />} />
          </nav>

        </div>
        <div className="md:hidden flex justify-center space-x-2 pb-2">
            <NavButton page={Page.User} label="My Reports" icon={<UserIcon className="h-5 w-5" />} />
            <NavButton page={Page.Public} label="Public" icon={<UserGroupIcon className="h-5 w-5" />} />
        </div>
      </div>
    </header>
  );
};

export default Header;