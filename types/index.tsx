// Create a new file: types/index.tsx
export interface Product {
    id: string;
    title: string;
    price: string;
    description?: string;
    productType: string;
    tags?: string[];
    imageUrl?: string | null; // Accept both undefined and null
    variants?: ProductVariant[];
  }
  
  export interface ProductVariant {
    id: string;
    title: string;
    price: string;
    available: boolean;
  }
  
  export interface CustomRecommendation {
    id: string;
    title: string;
    reason: string;
  }
  
  export interface Message {
    isUser: boolean;
    text: string;
    timestamp: Date;
  }
  
  export interface ProductContext {
    storeInfo?: string;
    products: Product[];
    customRecommendations: Record<string, CustomRecommendation[]>;
  }

  export interface OpenAIResponse {
    text: string;
    success: boolean;
  }