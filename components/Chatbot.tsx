import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getChatbotResponse } from '../services/geminiService';
import { PaperAirplaneIcon, UserIcon, ChatBubbleLeftRightIcon, XMarkIcon } from './icons/Icons';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatbotProps {
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const { complaints } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! I'm the SudharSetu service chatbot. How can I help you today? You can ask me for the status of a complaint by providing its ID (e.g., 'What is the status of CMPT-001?')." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await getChatbotResponse(input, complaints);
    const botMessage: Message = { text: botResponseText, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden border dark:border-gray-700">
        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">Complaint Status Bot</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <ChatBubbleLeftRightIcon className="h-5 w-5"/>
                    </div>
                )}
                <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
                    msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
                 {msg.sender === 'user' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon className="h-5 w-5"/>
                    </div>
                )}
            </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <ChatBubbleLeftRightIcon className="h-5 w-5"/>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                        <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about a complaint..."
                className="flex-1 block w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <PaperAirplaneIcon className="h-5 w-5"/>
            </button>
            </div>
      </div>
    </div>
  );
};

export default Chatbot;