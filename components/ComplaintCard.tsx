import React, { useState } from 'react';
import { Complaint, Status } from '../types';
import { useAppContext } from '../context/AppContext';
import { CalendarIcon, MapPinIcon, PencilIcon, CheckCircleIcon, TagIcon, ExclamationTriangleIcon, UserGroupIcon } from './icons/Icons';

interface ComplaintCardProps {
  complaint: Complaint;
  role: 'Admin' | 'Citizen';
}

const statusColors: { [key in Status]: string } = {
  [Status.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [Status.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [Status.Resolved]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, role }) => {
  const { updateComplaintStatus } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>(complaint.status);
  const [notes, setNotes] = useState(complaint.resolutionNotes || '');
  
  const handleUpdate = () => {
    updateComplaintStatus(complaint.id, newStatus, notes);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <img src={complaint.photo} alt={complaint.title} className="w-full h-48 object-cover"/>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{complaint.title}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[complaint.status]}`}>
                {complaint.status}
            </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{complaint.description}</p>
        
        <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-2" title="Issue Type">
                <TagIcon className="h-4 w-4 text-indigo-500"/>
                <span>{complaint.type}</span>
            </div>
             <div className="flex items-center space-x-2" title="Potential Impact">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500"/>
                <span>{complaint.impact}</span>
            </div>
            <div className="flex items-center space-x-2" title="Location">
                <MapPinIcon className="h-4 w-4 text-green-500"/>
                <span>{complaint.location.fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2" title="Date Submitted">
                <CalendarIcon className="h-4 w-4 text-blue-500"/>
                <span>{complaint.submittedAt.toLocaleDateString()}</span>
            </div>
             <div className="flex items-center space-x-2" title="Number of people affected">
                <UserGroupIcon className="h-4 w-4 text-yellow-500"/>
                <span>{complaint.affectedCount} people affected</span>
            </div>
        </div>
         <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-2">ID: {complaint.id}</p>

        {complaint.status === Status.Resolved && complaint.resolutionNotes && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">Resolution Notes:</h4>
                <p className="text-sm text-green-700 dark:text-green-300">{complaint.resolutionNotes}</p>
            </div>
        )}

        {role === 'Admin' && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <PencilIcon className="h-5 w-5"/>
                <span>Update Status</span>
            </button>
        )}

        {role === 'Admin' && isEditing && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Status)}
                        className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {newStatus === Status.Resolved && (
                     <div>
                        <label className="block text-sm font-medium">Resolution Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                            className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Add resolution details..."></textarea>
                    </div>
                )}
                <div className="flex space-x-2">
                    <button onClick={handleUpdate} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        <CheckCircleIcon className="h-5 w-5"/>
                        <span>Save</span>
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;