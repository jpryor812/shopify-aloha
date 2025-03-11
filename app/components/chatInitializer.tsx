import React, { useEffect, useState } from 'react';
import AlohaChat from './chatPopup';
import ChatController from '../controllers/chatController';

interface ChatInitializerProps {
  shopDomain: string;
  storefrontAccessToken: string;
  initialOpen?: boolean;
}

const ChatInitializer: React.FC<ChatInitializerProps> = ({
  shopDomain,
  storefrontAccessToken,
  initialOpen = false
}) => {
  const [controller, setController] = useState<ChatController | null>(null);
  const [sessionId, setSessionId] = useState('');
  
  useEffect(() => {
    // Generate a session ID
    const generateSessionId = () => {
      return 'session_' + Math.random().toString(36).substring(2, 15);
    };
    
    // Initialize the controller
    const initController = async () => {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      const config = {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        shopDomain,
        storefrontAccessToken
      };
      
      const chatController = new ChatController(config);
      setController(chatController);
    };
    
    initController();
  }, [shopDomain, storefrontAccessToken]);
  
  if (!controller || !sessionId) {
    return null; // Or a loading indicator
  }
  
  return (
    <AlohaChat 
      controller={controller}
      sessionId={sessionId}
      initialOpen={initialOpen}
    />
  );
};

export default ChatInitializer;             