import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Complaint, Status, ComplaintType, Impact, Location } from '../types';
import { useNotification } from './NotificationContext';

interface AppContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'submittedAt' | 'affectedCount'>) => void;
  updateComplaintStatus: (id: string, status: Status, notes?: string) => void;
  incrementAffectedCount: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialComplaints: Complaint[] = [
    {
        id: 'CMPT-001',
        title: 'Large Pothole on Main St',
        description: 'A very deep pothole near the intersection of Main St and 1st Ave. It has damaged my tire.',
        photo: 'https://picsum.photos/seed/pothole/400/300',
        location: { lat: 40.7128, lng: -74.0060, street: 'Main St', city: 'New York', pincode: '10001', fullAddress: '123 Main St, New York, NY, 10001', houseNo: '123', landmark: 'Near Times Square' },
        status: Status.Pending,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: ComplaintType.Pothole,
        impact: Impact.AccidentRisk,
        affectedCount: 12,
    },
    {
        id: 'CMPT-002',
        title: 'Garbage overflowing at City Park',
        description: 'The trash cans at the main entrance of City Park have not been emptied for days.',
        photo: 'https://picsum.photos/seed/garbage/400/300',
        location: { lat: 40.7150, lng: -74.0082, street: 'City Park Ave', city: 'New York', pincode: '10002', fullAddress: '25 City Park Ave, New York, NY, 10002', houseNo: '25' },
        status: Status.InProgress,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: ComplaintType.Garbage,
        impact: Impact.HealthHazard,
        affectedCount: 5
    },
    {
        id: 'CMPT-003',
        title: 'Streetlight out on Oak Avenue',
        description: 'The streetlight at the corner of Oak and Maple is completely out. It is very dark at night.',
        photo: 'https://picsum.photos/seed/streetlight/400/300',
        location: { lat: 40.7100, lng: -74.0050, street: 'Oak Avenue', city: 'New York', pincode: '10003', fullAddress: '45 Oak Avenue, New York, NY, 10003', houseNo: '45' },
        status: Status.Resolved,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Replaced bulb and repaired faulty wiring on 2024-07-19.',
        type: ComplaintType.Streetlight,
        impact: Impact.SafetyConcern,
        affectedCount: 8,
    }
];


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const { addNotification } = useNotification();

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'status' | 'submittedAt' | 'affectedCount'>) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: `CMPT-${String(complaints.length + 1).padStart(3, '0')}`,
      status: Status.Pending,
      submittedAt: new Date(),
      affectedCount: 1, // Starts with the original reporter
    };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const updateComplaintStatus = (id: string, status: Status, notes?: string) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status, resolutionNotes: notes || c.resolutionNotes } : c
      )
    );
    addNotification(`Status for complaint ${id} updated to ${status}.`, 'info');
  };

  const incrementAffectedCount = (id: string) => {
     setComplaints(prev =>
      prev.map(c =>
        c.id === id ? { ...c, affectedCount: c.affectedCount + 1 } : c
      )
    );
  };

  return (
    <AppContext.Provider value={{ complaints, addComplaint, updateComplaintStatus, incrementAffectedCount }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};