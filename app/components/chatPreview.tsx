// components/AlohaPreview.tsx
import React, { useState } from "react";
import { Box, Text, Button } from "@shopify/polaris";

interface ChatPreviewProps {
  config: {
    position: string;
    mode: string;
    initialMessage: string;
    storeTheme: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getPositionClasses = () => {
    switch (config.position) {
      case "center":
        return { button: "inset-x-1/2 bottom-4 transform -translate-x-1/2", chat: "inset-0 flex items-center justify-center" };
      case "bottom-left":
        return { button: "left-4 bottom-4", chat: "left-4 bottom-20" };
      case "bottom-right":
      default:
        return { button: "right-4 bottom-4", chat: "right-4 bottom-20" };
    }
  };
  
  const positionClasses = getPositionClasses();
  
  return (
    <div className="relative h-[400px] w-full border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
      {/* Header to simulate store */}
      <div className="bg-gray-800 text-white p-3 text-sm font-medium">
        Sample Store
      </div>
      
      <div className="p-4">
        <Text variant="bodyMd" as="p" fontWeight="medium">Preview: Your customers will see the Aloha assistant on your store</Text>
      </div>
      
      {/* Chat button */}
      <div className={`fixed ${positionClasses.button} z-50`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(to bottom right, ${config.storeTheme.primaryColor}, ${config.storeTheme.secondaryColor})`
          }}
        >
          {!isOpen && (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          )}
          {isOpen && (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Chat interface */}
      {isOpen && (
        <div className={`${config.mode === "popup" ? "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40" : `fixed ${positionClasses.chat} z-40`}`}>
          <div 
            className={`bg-white rounded-xl shadow-2xl overflow-hidden ${config.mode === "popup" ? "w-[90%] h-[80%] max-w-md" : "w-96 h-[400px]"}`}
          >
            {/* Chat header */}
            <div className="py-3 px-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium text-gray-800">Aloha Shopping Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 h-[300px]">
              <div className="flex justify-start">
                <div 
                  className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                  style={{
                    background: `linear-gradient(to bottom right, ${config.storeTheme.primaryColor}, ${config.storeTheme.secondaryColor})`
                  }}
                ></div>
                <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-white text-gray-800 shadow-sm">
                  <p className="text-sm">{config.initialMessage}</p>
                </div>
              </div>
            </div>
            
            {/* Chat input */}
            <div className="bg-white border-t border-gray-100 p-3">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 py-3 px-4 bg-gray-100 rounded-l-full text-gray-800 focus:outline-none"
                />
                <button
                  className="p-3 rounded-r-full text-white focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${config.storeTheme.primaryColor}, ${config.storeTheme.secondaryColor})`
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};