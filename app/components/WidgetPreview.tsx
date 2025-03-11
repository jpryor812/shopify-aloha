import React, { useState } from "react";
import { Button, BlockStack, Text, Banner } from "@shopify/polaris";
import { VoiceAssistant } from "./VoiceAssistant";

interface WidgetPreviewProps {
  config: {
    merchantName: string;
    storeName: string;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    welcomeMessage?: string;
  };
}

export function WidgetPreview({ config }: WidgetPreviewProps) {
  const [currentPage, setCurrentPage] = useState("/");
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  const navigateTo = (url: string) => {
    setNavigationHistory(prev => [...prev, currentPage]);
    setCurrentPage(url);
  };
  
  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prevPage = navigationHistory[navigationHistory.length - 1];
      setCurrentPage(prevPage);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };
  
  const renderMockPage = () => {
    if (currentPage === "/") {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Welcome to {config.storeName || "Our Store"}</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }
    
    if (currentPage.includes("/collections/")) {
      const collectionName = currentPage.split("/collections/")[1].split("?")[0];
      const params = new URLSearchParams(currentPage.split("?")[1] || "");
      const filter = params.get("filter") || "";
      
      let title = `${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} Collection`;
      if (filter) {
        title += ` - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      }
      
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }
    
    if (currentPage.includes("/products/")) {
      const productId = currentPage.split("/products/")[1];
      
      // Simulate different products based on ID
      let productName = "Product";
      let productPrice = "$99.99";
      
      if (productId === "1") {
        productName = "Floral Summer Dress";
        productPrice = "$49.99";
      } else if (productId === "6") {
        productName = "Running Shoes";
        productPrice = "$79.99";
      }
      
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">{productName}</h1>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg"></div>
            <div className="w-full md:w-1/2 p-4">
              <div className="text-2xl font-bold mb-4">{productPrice}</div>
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Unknown Page: {currentPage}</h1>
      </div>
    );
  };
  
  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">Preview Your Assistant</Text>
      
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={() => setCurrentPage("/")} disabled={currentPage === "/"}>
          Home Page
        </Button>
        <Button onClick={goBack} disabled={navigationHistory.length === 0}>
          Back
        </Button>
        <div className="ml-4 px-3 py-1 bg-gray-100 rounded text-sm">
          Current Page: {currentPage}
        </div>
      </div>
      
      <Banner tone="info">
        This is a preview environment. Use the voice assistant to test product searches and navigation.
      </Banner>
      
      <div className="relative border border-gray-300 h-[500px] bg-gray-50 overflow-hidden rounded">
        {/* Mock store content */}
        <div className="w-full h-full overflow-auto">
          {renderMockPage()}
        </div>
        
        {/* Voice assistant */}
        <div className="absolute">
          <VoiceAssistant
            merchantName={config.merchantName}
            storeName={config.storeName}
            position={config.position}
            welcomeMessage={config.welcomeMessage}
            onNavigate={navigateTo}
          />
        </div>
      </div>
    </BlockStack>
  );
}