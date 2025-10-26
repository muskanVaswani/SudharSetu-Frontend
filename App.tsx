import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import PublicDashboard from './components/PublicDashboard';
import ComplaintForm from './components/ComplaintForm';
import Chatbot from './components/Chatbot';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';
import { Page } from './types';
import { ChatBubbleLeftRightIcon } from './components/icons/Icons';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';


const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3 w-full max-w-sm">
      {notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} onClose={removeNotification} />
      ))}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.User);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case Page.User:
        return <UserDashboard setCurrentPage={setCurrentPage} />;
      case Page.Public:
        return <PublicDashboard />;
      case Page.Report:
        return <ComplaintForm setCurrentPage={setCurrentPage} />;
      default:
        return <UserDashboard setCurrentPage={setCurrentPage} />;
    }
  };

  if (showAdmin) {
    if (isAdminLoggedIn) {
      return (
        <AppProvider>
           <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
              <NotificationContainer />
              <AdminDashboard onLogout={() => {
                setIsAdminLoggedIn(false);
                setShowAdmin(false);
              }} />
           </div>
        </AppProvider>
      );
    }
    return (
        <>
            <NotificationContainer />
            <AdminLogin 
                onLogin={() => setIsAdminLoggedIn(true)} 
                onBack={() => setShowAdmin(false)} 
            />
        </>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <NotificationContainer />
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="flex-grow p-4 md:p-8">
          {renderPage()}
        </main>
        <Footer onAdminClick={() => setShowAdmin(true)} />
        
        {/* Chatbot FAB and Modal */}
        <div className="fixed bottom-6 right-6 z-50">
            {!isChatbotOpen && (
              <button
                onClick={() => setIsChatbotOpen(true)}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Open Chatbot"
              >
                <ChatBubbleLeftRightIcon className="h-8 w-8" />
              </button>
            )}

            {isChatbotOpen && (
              <div className="w-full max-w-md h-[70vh] max-h-[600px]">
                <Chatbot onClose={() => setIsChatbotOpen(false)} />
              </div>
            )}
        </div>
      </div>
    </AppProvider>
  );
};


const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
