import React, { useState, useEffect, useRef } from 'react';
import { Message, Product } from '../../types';
import ChatController from '../controllers/chatController';
import ProductCard from './ProductCard';
import VoiceInput from './VoiceInput';

interface AlohaChatProps {
  controller: ChatController;
  sessionId: string;
  initialOpen?: boolean;
}

const AlohaChat: React.FC<AlohaChatProps> = ({ 
  controller, 
  sessionId, 
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when component mounts
  useEffect(() => {
    const initChat = async () => {
      const initialResponse = await controller.startNewSession(sessionId);
      setMessages(initialResponse.conversation);
    };
    
    if (isOpen) {
      initChat();
    }
  }, [controller, sessionId, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const response = await controller.processMessage(sessionId, inputText);
      setMessages(response.conversation);
      
      if (response.relevantProducts) {
        setProducts(response.relevantProducts);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputText(transcript);
  };

  const toggleChat = () => {
    if (!isOpen) {
      // Initialize chat when opening
      const initChat = async () => {
        const initialResponse = await controller.startNewSession(sessionId);
        setMessages(initialResponse.conversation);
      };
      
      initChat();
    }
    
    setIsOpen(!isOpen);
  };

  // Chat toggle button (only shown when chat is closed)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-white shadow-lg flex items-center justify-center"
          aria-label="Open Aloha Shopping Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[80%] h-[80vh] max-h-[800px] flex flex-col overflow-hidden">
        {/* Chat header with close button */}
        <div className="bg-white py-3 px-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Aloha Shopping Assistant</h3>
          <button 
            onClick={toggleChat} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              {!message.isUser && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-white mr-3 flex-shrink-0"></div>
              )}
              <div 
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.isUser 
                    ? 'bg-blue-50 text-gray-800' 
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        
        {/* Product display area */}
        {products.length > 0 && (
          <div className="bg-white p-4 border-t border-gray-100">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        
        {/* Chat input */}
        <div className="bg-white border-t border-gray-100 p-3">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Reply to Aloha..."
              className="flex-1 py-3 px-4 bg-gray-100 rounded-l-full text-gray-800 focus:outline-none"
              disabled={isProcessing}
            />
            <VoiceInput onTranscript={handleVoiceInput} disabled={isProcessing} />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-3 rounded-r-full focus:outline-none disabled:opacity-50"
              disabled={isProcessing || !inputText.trim()}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AlohaChat;