import React, { useState, useRef, useEffect } from 'react';

interface VideoWidgetProps {
  welcomeVideoUrl: string;
  merchantName: string;
  storeName: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  navigationOptions: {
    text: string;
    targetUrl: string;
    nextVideoUrl?: string;
  }[];
  showOptionsAtTime: number; // Seconds into the video when options should appear
}

export function VideoWidget({
  welcomeVideoUrl,
  merchantName,
  storeName,
  position = 'bottom-right',
  navigationOptions,
  showOptionsAtTime = 5
}: VideoWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Position classes based on the selected corner
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };
  
  // Handle video timeupdate to show options at the right time
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= showOptionsAtTime && !showOptions) {
      setShowOptions(true);
    }
  };
  
  // Handle option click
  const handleOptionClick = (option: { text: string; targetUrl: string; nextVideoUrl?: string }) => {
    // Navigate to the target URL
    window.location.href = option.targetUrl;
  };
  
  // Handle expand/collapse of the widget
  const toggleWidget = () => {
    setIsExpanded(!isExpanded);
    
    // Reset options visibility when collapsed
    if (isExpanded) {
      setShowOptions(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      // Play video when expanded
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };
  
  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {!isExpanded ? (
        // Minimized circular widget
        <div 
          className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 shadow-lg animate-pulse"
          onClick={toggleWidget}
        >
          <img 
            src={welcomeVideoUrl} // This would be a thumbnail or GIF
            alt={`${merchantName} from ${storeName}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        // Expanded video widget
        <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ width: '320px' }}>
          {/* Video header with close button */}
          <div className="flex justify-between items-center bg-gray-100 p-2">
            <h4 className="text-sm font-medium">{storeName}</h4>
            <button 
              onClick={toggleWidget}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          {/* Video container */}
          <div className="relative">
            <video
              ref={videoRef}
              src={welcomeVideoUrl}
              className="w-full"
              onTimeUpdate={handleTimeUpdate}
              autoPlay
              controls={false}
            ></video>
            
            {/* Option buttons that appear after video plays for a bit */}
            {showOptions && (
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center space-y-2 p-2">
                {navigationOptions.map((option, index) => (
                  <button
                    key={index}
                    className="bg-white text-blue-600 border border-blue-600 rounded-full py-2 px-4 text-sm hover:bg-blue-50 transition w-4/5"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}