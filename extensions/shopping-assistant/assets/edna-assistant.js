(function () {
    // Load CSS
    const loadCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '{{ "edna-styles.css" | asset_url }}';
      document.head.appendChild(link);
    };
    
    loadCSS();
  
    // Create the main container for the Edna widget
    const createEdnaContainer = () => {
      const container = document.createElement("div");
      container.id = "edna-shopping-assistant";
      document.body.appendChild(container);
      return container;
    };
  
    // Create the toggle button 
    const createToggleButton = (config) => {
      const button = document.createElement("button");
      button.id = "edna-toggle-button";
      button.setAttribute("aria-label", "Open shopping assistant");
      button.className = "edna-toggle-button";
      
      // Set background based on config
      button.style.background = `linear-gradient(to bottom right, ${config.primaryColor}, ${config.secondaryColor})`;
      
      // Add icon to button
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      
      return button;
    };

    const testApiConnection = () => {
        console.log("Testing API connection...");
        
        // Try different URL patterns
        const testUrls = [
          '/api/test',
          '/apps/proxy/api/test'
        ];
        
        testUrls.forEach(url => {
          console.log(`Testing URL: ${url}`);
          fetch(url)
            .then(response => {
              console.log(`Response for ${url}:`, response.status);
              if (response.ok) {
                return response.json();
              }
              throw new Error(`Failed with status ${response.status}`);
            })
            .then(data => {
              console.log(`Success for ${url}:`, data);
            })
            .catch(error => {
              console.error(`Error for ${url}:`, error);
            });
        });
      };
      
      // Call this test function when your script loads
      testApiConnection();
  
    // Create chat interface
    const createChatInterface = (config) => {
      const chatInterface = document.createElement("div");
      chatInterface.id = "edna-chat-interface";
      chatInterface.className = "edna-chat-interface";
      
      // Add chat content
      chatInterface.innerHTML = `
        <div class="edna-chat-header">
          <h3 class="edna-chat-title">Edna</h3>
          <button class="edna-chat-close" aria-label="Close chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="edna-chat-messages"></div>
        <div class="edna-product-display"></div>
        <div class="edna-chat-input">
          <form class="edna-chat-form">
            <input type="text" class="edna-chat-input-field" placeholder="Type your message..." aria-label="Type your message">
            <button type="button" class="edna-voice-input" aria-label="Voice input">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11C19 14.866 15.866 18 12 18M12 18C8.13401 18 5 14.866 5 11M12 18V22M12 22H8M12 22H16M12 14C10.3431 14 9 12.6569 9 11V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button type="submit" class="edna-chat-submit" aria-label="Send message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 5L21 12M21 12L14 19M21 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      `;
      
      return chatInterface;
    };
  
    // Create the overlay that will sit behind the chat when in popup mode
    const createOverlay = () => {
      const overlay = document.createElement("div");
      overlay.id = "edna-overlay";
      document.body.appendChild(overlay);
      return overlay;
    };
  
    // Main Edna assistant class
    class EdnaShoppingAssistant {
      constructor(config = {}) {
        this.config = {
          primaryColor: "#2ECC71",
          secondaryColor: "#FFFFFF",
          initialMessage: "Welcome to Aloha! I'm your personal shopping assistant. The more specific you are about what you're looking for, the better I can help you. Feel free to mention details like product type, color, size, style, or price range. What can I help you find today?",
          ...config
        };
        
        this.messages = [];
        this.isOpen = false;
        this.isListening = false;
        this.sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        this.container = createEdnaContainer();
        this.overlay = createOverlay();
        this.toggleButton = createToggleButton(this.config);
        this.chatInterface = createChatInterface(this.config);
        
        this.container.appendChild(this.toggleButton);
        this.container.appendChild(this.chatInterface);
        
        this.setupEventListeners();
        this.initSpeechRecognition();
        
        // Add initial message
        setTimeout(() => {
          this.addMessage(this.config.initialMessage, false);
        }, 500);
      }
      
      setupEventListeners() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => this.toggleChat());
        
        // Close button click
        const closeButton = this.chatInterface.querySelector('.edna-chat-close');
        closeButton.addEventListener('click', () => this.toggleChat());
        
        // Overlay click
        this.overlay.addEventListener('click', () => this.toggleChat());
        
        // Form submission
        const form = this.chatInterface.querySelector('.edna-chat-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Voice button click
        const voiceButton = this.chatInterface.querySelector('.edna-voice-input');
        voiceButton.addEventListener('click', () => this.toggleVoiceInput());
      }
      
      toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
          this.chatInterface.style.opacity = "1";
          this.chatInterface.style.pointerEvents = "auto";
          this.overlay.style.opacity = "1";
          this.overlay.style.pointerEvents = "auto";
          this.toggleButton.style.opacity = "0";
          this.toggleButton.style.pointerEvents = "none";
        } else {
          this.chatInterface.style.opacity = "0";
          this.chatInterface.style.pointerEvents = "none";
          this.overlay.style.opacity = "0";
          this.overlay.style.pointerEvents = "none";
          this.toggleButton.style.opacity = "1";
          this.toggleButton.style.pointerEvents = "auto";
        }
      }
      
      handleSubmit(e) {
        e.preventDefault();
        console.log("Form submitted");
        
        const inputField = this.chatInterface.querySelector('.edna-chat-input-field');
        const message = inputField.value.trim();
        
        console.log("Message:", message);
        
        if (!message) {
          console.log("Empty message, not proceeding");
          return;
        }
        
        // Add user message
        this.addMessage(message, true);
        
        // Clear input
        inputField.value = '';
        
        // Process message
        console.log("About to call processMessage");
        this.processMessage(message);
      }
      
      
      addMessage(text, isUser) {
        const messagesContainer = this.chatInterface.querySelector('.edna-chat-messages');
        
        const messageEl = document.createElement('div');
        messageEl.className = isUser ? 'edna-message edna-user-message' : 'edna-message edna-assistant-message';
        
        if (!isUser) {
          const avatar = document.createElement('div');
          avatar.className = 'edna-avatar';
          avatar.style.background = `linear-gradient(to bottom right, ${this.config.primaryColor}, ${this.config.secondaryColor})`;
          messageEl.appendChild(avatar);
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'edna-message-bubble';
        bubble.textContent = text;
        messageEl.appendChild(bubble);
        messagesContainer.appendChild(messageEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to messages array
        this.messages.push({
          text,
          isUser,
          timestamp: new Date()
        });
      }
      
      async processMessage(message) {
        console.log("processMessage called with:", message);
        try {
          // Show typing indicator
          this.showTypingIndicator();
          
          console.log("About to fetch from API");
          // Use one declaration for apiUrl
          const apiUrl = `/apps/proxy/api/chat`;
          console.log("API URL:", apiUrl);
          
          // Call Shopify app backend
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              sessionId: this.sessionId
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to get response');
          }
          
          const data = await response.json();
          
          // Remove typing indicator
          this.hideTypingIndicator();
          
          // Add assistant response
          this.addMessage(data.response, false);
          
          // Display products if available
          if (data.relevantProducts && data.relevantProducts.length > 0) {
            this.displayProducts(data.relevantProducts);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          
          // Remove typing indicator
          this.hideTypingIndicator();
          
          // Add error message
          this.addMessage("I'm sorry, I encountered a problem. Please try again.", false);
        }
      }
            
      showTypingIndicator() {
        const messagesContainer = this.chatInterface.querySelector('.edna-chat-messages');
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'edna-message edna-assistant-message edna-typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'edna-avatar';
        avatar.style.background = `linear-gradient(to bottom right, ${this.config.primaryColor}, ${this.config.secondaryColor})`;
        typingIndicator.appendChild(avatar);
        
        const bubble = document.createElement('div');
        bubble.className = 'edna-typing-bubble';
        
        bubble.innerHTML = `
          <div class="edna-typing-dots-container">
            <div class="edna-dot"></div>
            <div class="edna-dot"></div>
            <div class="edna-dot"></div>
          </div>
        `;
        
        typingIndicator.appendChild(bubble);
        typingIndicator.id = 'edna-typing-indicator';
        messagesContainer.appendChild(typingIndicator);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      hideTypingIndicator() {
        const typingIndicator = document.getElementById('edna-typing-indicator');
        if (typingIndicator) {
          typingIndicator.remove();
        }
      }
      
     displayProducts(products) {
        const productDisplay = this.chatInterface.querySelector('.edna-product-display');
        productDisplay.innerHTML = '';
        productDisplay.style.display = 'block';
        
        const carousel = document.createElement('div');
        carousel.className = 'edna-product-carousel';
        
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'edna-product-card';
          
          card.innerHTML = `
            <div class="edna-product-image">
              <img src="${product.imageUrl || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'}" 
                   alt="${product.title}">
            </div>
            <div class="edna-product-info">
              <h4 class="edna-product-title">${product.title}</h4>
              <p class="edna-product-price">$${parseFloat(product.price).toFixed(2)}</p>
              <button class="edna-add-to-cart" 
                      data-product-id="${product.id}" 
                      style="background: linear-gradient(to right, ${this.config.primaryColor}, ${this.config.secondaryColor});">
                Add to Cart
              </button>
            </div>
          `;
          
          // Add to cart functionality
          const addToCartButton = card.querySelector('.edna-add-to-cart');
          addToCartButton.addEventListener('click', () => {
            this.addToCart(product.id);
          });
          
          carousel.appendChild(card);
        });
        
        productDisplay.appendChild(carousel);
      }
      
      async addToCart(productId) {
        try {
          // Show message
          this.addMessage(`Adding product to your cart...`, false);
          
          // Call Shopify app backend to add to cart
          const apiUrl = `${window.Shopify.routes.root}/api/add-to-cart`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              sessionId: this.sessionId
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to add to cart');
          }
          
          // Success message
          this.addMessage(`Great choice! The item has been added to your cart.`, false);
          
        } catch (error) {
          console.error('Error adding to cart:', error);
          
          // Error message
          this.addMessage(`I'm sorry, I couldn't add that item to your cart. Please try again.`, false);
        }
      }
      
      initSpeechRecognition() {
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          
          this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const inputField = this.chatInterface.querySelector('.edna-chat-input-field');
            inputField.value = transcript;
            
            // Auto submit after voice input
            const form = this.chatInterface.querySelector('.edna-chat-form');
            form.dispatchEvent(new Event('submit'));
          };
          
          this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButtonState();
          };
          
          this.recognition.onerror = () => {
            this.isListening = false;
            this.updateVoiceButtonState();
          };
        }
      }
      
      toggleVoiceInput() {
        if (!this.recognition) return;
        
        this.isListening = !this.isListening;
        
        if (this.isListening) {
          this.recognition.start();
        } else {
          this.recognition.stop();
        }
        
        this.updateVoiceButtonState();
      }
      
      updateVoiceButtonState() {
        const voiceButton = this.chatInterface.querySelector('.edna-voice-input');
        
        if (this.isListening) {
          voiceButton.style.background = '#ff4d4f';
        } else {
          voiceButton.style.background = `linear-gradient(to right, ${this.config.primaryColor}, ${this.config.secondaryColor})`;
        }
      }
      
    } 
  
    // Initialize Edna when DOM is loaded
    window.ednaAssistant = new EdnaShoppingAssistant();
  })();