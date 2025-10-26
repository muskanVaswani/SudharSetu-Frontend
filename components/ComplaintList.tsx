import React from 'react';
import { Complaint } from '../types';
import ComplaintCard from './ComplaintCard';

interface ComplaintListProps {
  complaints: Complaint[];
  role: 'Admin' | 'Citizen';
}

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, role }) => {
  if (complaints.length === 0) {
    return <div className="text-center py-10">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No complaints found.</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Looks like everything is in order!</p>
    </div>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} role={role} />
      ))}
    </div>
  );
};

export default ComplaintList;