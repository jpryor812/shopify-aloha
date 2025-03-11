// services/openaiService.tsx
import OpenAI from 'openai';

import { Message, Product, ProductContext, CustomRecommendation, OpenAIResponse } from '../../types';


class OpenAIService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.model = 'gpt-4o-mini';
  }

    async generateResponse(
        userMessage: string, 
        conversationHistory: Message[], 
        productContext: ProductContext
    ): Promise<OpenAIResponse> {
        try {
        // Format conversation history for the API
        const messages = this.formatConversation(conversationHistory, userMessage, productContext);
        
      // Call the OpenAI API
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 300,
      });
      
      return {
        text: response.choices[0].message.content || '',
        success: true,
      };
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      return {
        text: "I'm having trouble connecting right now. Please try again soon.",
        success: false,
      };
    }
  }

  formatConversation(
    history: Message[], 
    currentMessage: string, 
    productContext: ProductContext
  ): Array<{role: string, content: string}> {
    // Create system prompt with instructions and product context
    const systemPrompt = {
      role: 'system',
      content: `You are name, a friendly voice shopping assistant for a Shopify store. 
      Your goal is to help customers find products they'll love through natural conversation.
      
      Store Information:
      ${productContext.storeInfo || ''}
      
      Available Products:
      ${this.formatProductContext(productContext.products)}
      
      Current Custom Recommendations:
      ${this.formatCustomRecommendations(productContext.customRecommendations)}
      
      Guidelines:
      - Be concise, friendly, and helpful
      - Recommend products based on user's needs
      - Suggest complementary items when appropriate
      - Understand fashion trends and styles when making recommendations
      - Ask clarifying questions if needed
      - Keep responses under 100 words`
    };
    
    // Format conversation history
    const formattedHistory = history.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // Add current user message
    const userMessage = {
      role: 'user',
      content: currentMessage
    };
    
    return [systemPrompt, ...formattedHistory, userMessage];
  }
  
  formatProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'No product information available.';
    }
    
    // Format product data in a way that's easy for the model to process
    return products.map(product => {
      return `Product ID: ${product.id}
      Name: ${product.title}
      Price: ${product.price}
      Categories: ${product.productType}${product.tags ? ', ' + product.tags.join(', ') : ''}
      Description: ${product.description?.substring(0, 200) || 'No description available'}
      -----`;
    }).join('\n');
  }
  
  formatCustomRecommendations(recommendations: Record<string, CustomRecommendation[]>): string {
    if (!recommendations || Object.keys(recommendations).length === 0) {
      return 'No custom recommendations available.';
    }
    
    // Format merchant-created recommendations
    let formattedRecs = '';
    for (const [productId, relatedItems] of Object.entries(recommendations)) {
      formattedRecs += `For Product ${productId}:\n`;
      relatedItems.forEach(item => {
        formattedRecs += `- Recommend: ${item.title} (${item.id})\n`;
        formattedRecs += `  Reason: "${item.reason}"\n`;
      });
      formattedRecs += `-----\n`;
    }
    
    return formattedRecs;
  }
}

export default OpenAIService;