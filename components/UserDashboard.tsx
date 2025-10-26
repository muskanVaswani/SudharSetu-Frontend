import React from 'react';
import { useAppContext } from '../context/AppContext';
import ComplaintList from './ComplaintList';
import { Page } from '../types';
import { PlusIcon } from './icons/Icons';

interface UserDashboardProps {
  setCurrentPage: (page: Page) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ setCurrentPage }) => {
  const { complaints } = useAppContext();
  // In a real app, this would be filtered for the logged-in user.
  // For this demo, we show all complaints as "my" complaints.

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">My Complaints</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Track the status of issues you have reported.</p>
            </div>
            <button
            onClick={() => setCurrentPage(Page.Report)}
            className="mt-4 md:mt-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
            <PlusIcon className="h-5 w-5 mr-2" />
            Report a New Issue
            </button>
        </div>

      <ComplaintList complaints={complaints} role={'Citizen'} />
    </div>
  );
};

export default UserDashboard;