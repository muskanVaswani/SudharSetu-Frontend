import React from 'react';

interface FooterProps {
    onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
    return (
        <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} SudharSetu. All rights reserved.
                </p>
                <button 
                    onClick={onAdminClick}
                    className="mt-2 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                    Admin Login
                </button>
            </div>
        </footer>
    );
}

export default Footer;