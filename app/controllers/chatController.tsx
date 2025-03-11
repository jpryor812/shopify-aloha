// controllers/alohaChatController.tsx
import OpenAI from 'openai';
import OpenAIService from '../services/openaiService';
import ShopifyService from '../services/shopifyService';

import { Message, Product, ProductContext, CustomRecommendation } from '../../types';


interface AlohaConfig {
  openaiApiKey: string;
  shopDomain: string;
  storefrontAccessToken: string;
}

interface ChatResponse {
  response: string;
  success: boolean;
  conversation: Message[];
  relevantProducts?: Product[];
}

class ChatController {
  private openaiService: OpenAIService;
  private shopifyService: ShopifyService;
  private conversations: Record<string, Message[]>;
  private productCache: Product[] | null;
  private customRecommendations: Record<string, CustomRecommendation[]>;
  private openai: OpenAI;
  
  constructor(config: AlohaConfig) {
    this.openaiService = new OpenAIService(config.openaiApiKey);
    this.shopifyService = new ShopifyService(config.shopDomain, config.storefrontAccessToken);
    this.conversations = {};
    this.productCache = null;
    this.customRecommendations = {};
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    
    // Initialize
    this.init();
  }
  
  async init(): Promise<void> {
    try {
      // Only load custom recommendations on startup
      this.customRecommendations = await this.shopifyService.getCustomRecommendations();
      // Don't pre-load products - just set productCache to empty array
      this.productCache = [];
    } catch (error) {
      console.error('Error initializing Aloha Chat:', error);
    }
  }
  
  async startNewSession(sessionId: string): Promise<ChatResponse> {
    // Clear any existing conversation
    this.conversations[sessionId] = [];
    
    // Create the welcome message
    const welcomeMessage = {
      isUser: false,
      text: "Hi there! I'm name, your personal shopping assistant. I'm here to help you find exactly what you're looking for today! The more specific you are about what you're looking for, the better I can help you. That being said, what can I help you find today?",
      timestamp: new Date()     
    };      
    
    // Add to conversation
    this.conversations[sessionId].push(welcomeMessage);
    
    return {
      response: welcomeMessage.text,
      success: true,
      conversation: this.conversations[sessionId]
    };
  }
  
  async analyzeUserQuery(message: string): Promise<{
    query?: string;
    productType?: string;
    tag?: string;
    priceMin?: number;
    priceMax?: number;
  }> {
    // Use a simplified prompt to extract search parameters
    const analysisPrompt = {
      role: 'system',
      content: `Extract shopping search parameters from this user message. 
      Return ONLY a JSON object with these fields (include only if present in message):
      - query: Overall search term
      - productType: Category of product
      - tag: Any specific tags/attributes
      - priceMin: Minimum price if specified
      - priceMax: Maximum price if specified
      Example: "I'm looking for jeans under $100" would return:
      {"query":"jeans","productType":"jeans","priceMax":100}`
    };
    
    const userMessage = {
      role: 'user',
      content: message
    };
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [analysisPrompt, userMessage] as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 150,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Error analyzing user query:', error);
      // If analysis fails, return empty filter to fall back to regular search
      return {};
    }
  }
  
  async processMessage(
    sessionId: string, 
    message: string, 
    refreshContext: boolean = false
  ): Promise<ChatResponse> {
    // Create conversation for new sessions
    if (!this.conversations[sessionId]) {
      this.conversations[sessionId] = [];
    }
    
    // Add user message to conversation history
    this.conversations[sessionId].push({
      isUser: true,
      text: message,
      timestamp: new Date()
    });
    
    // Analyze the user query to extract search parameters
    const searchParams = await this.analyzeUserQuery(message);
    
    // Fetch relevant products based on the search parameters
    let relevantProducts: Product[] = [];
    if (Object.keys(searchParams).length > 0) {
      // If we extracted search parameters, use them for filtering
      relevantProducts = await this.shopifyService.fetchFilteredProducts(searchParams);
    } else if (refreshContext || !this.productCache) {
      // Fallback: refresh or fetch all products if no specific parameters
      this.productCache = await this.shopifyService.fetchFilteredProducts({});
      relevantProducts = this.productCache;
    } else {
      // Use cached products if available
      relevantProducts = this.productCache;
    }
    
    // Get custom recommendations
    if (refreshContext || Object.keys(this.customRecommendations).length === 0) {
      this.customRecommendations = await this.shopifyService.getCustomRecommendations();
    }
    
    // Prepare context for OpenAI
    const context = {
      storeInfo: 'Aloha Shopping - Your personal shopping assistant',
      products: relevantProducts,
      customRecommendations: this.customRecommendations
    };
    
    // Get response from OpenAI
    const aiResponse = await this.openaiService.generateResponse(
      message,
      this.conversations[sessionId],
      context
    );
    
    // Add AI response to conversation history
    if (aiResponse.success) {
      this.conversations[sessionId].push({
        isUser: false,
        text: aiResponse.text,
        timestamp: new Date()
      });
    }
    
    return {
      response: aiResponse.text,
      success: aiResponse.success,
      conversation: this.conversations[sessionId],
      relevantProducts: relevantProducts // Added to return the products that matched
    };
  }
  
  getConversation(sessionId: string): Message[] {
    return this.conversations[sessionId] || [];
  }
  
  clearConversation(sessionId: string): boolean {
    this.conversations[sessionId] = [];
    return true;
  }
}

export default ChatController;