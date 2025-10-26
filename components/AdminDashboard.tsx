import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ComplaintList from './ComplaintList';
import { Status, Complaint } from '../types';
import { FunnelIcon, ArrowRightStartOnRectangleIcon, SudharSetuIcon } from './icons/Icons';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { complaints } = useAppContext();
  const [filter, setFilter] = useState<Status | 'All'>('All');

  const filteredComplaints = useMemo(() => {
    if (filter === 'All') {
      return complaints;
    }
    return complaints.filter(c => c.status === filter);
  }, [complaints, filter]);
  
  const counts = useMemo(() => {
    return complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {} as Record<Status, number>);
  }, [complaints]);

  const FilterButton: React.FC<{ status: Status | 'All', count: number }> = ({ status, count }) => {
    const isActive = filter === status;
    return (
       <button onClick={() => setFilter(status)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
            {status} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white text-blue-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>{count}</span>
        </button>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
            <SudharSetuIcon className="h-10 w-10 text-blue-500" />
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">Manage and resolve all citizen complaints.</p>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </header>

      <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-wrap items-center gap-2">
        <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"/>
        <span className="font-semibold mr-2">Filter by status:</span>
        <FilterButton status="All" count={complaints.length} />
        <FilterButton status={Status.Pending} count={counts[Status.Pending] || 0} />
        <FilterButton status={Status.InProgress} count={counts[Status.InProgress] || 0} />
        <FilterButton status={Status.Resolved} count={counts[Status.Resolved] || 0} />
      </div>

      <ComplaintList complaints={filteredComplaints} role={'Admin'} />
    </div>
  );
};

export default AdminDashboard;