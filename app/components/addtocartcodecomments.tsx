      /*
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
      */