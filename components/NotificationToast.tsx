import React, { useEffect } from 'react';
import { Notification, NotificationType } from '../context/NotificationContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon, EnvelopeIcon } from './icons/Icons';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: number) => void;
}

const icons: Record<NotificationType, React.ReactElement> = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
};

const emailSuccessIcon = <EnvelopeIcon className="h-6 w-6 text-green-500" />;

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const { id, message, type } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const isEmailNotification = message.includes('email');
  const icon = isEmailNotification && type === 'success' ? emailSuccessIcon : icons[type];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black dark:ring-gray-700 ring-opacity-5 overflow-hidden animate-fade-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {type === 'success' && isEmailNotification ? 'Notification Sent' : 'Update'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(id)}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
