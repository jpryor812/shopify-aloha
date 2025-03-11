import { Product, CustomRecommendation } from '../../types';


interface ShopifyConfig {
    shopDomain: string;
    storefrontAccessToken: string;
  }
  
  interface ProductImage {
    originalSrc: string;
    altText?: string;
  }
  
  interface ShopifyVariant {
    id: string;
    title: string;
    availableForSale: boolean;
    price: string;
  }
  
  interface ShopifyProductNode {
    id: string;
    title: string;
    description: string;
    productType: string;
    tags: string[];
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      }
    };
    images: {
      edges: Array<{
        node: ProductImage;
      }>;
    };
    variants: {
      edges: Array<{
        node: ShopifyVariant;
      }>;
    };
  }
  
  interface FormattedProduct {
    id: string;
    title: string;
    description: string;
    productType: string;
    tags: string[];
    price: string;
    currency: string;
    imageUrl: string | null;
    imageAlt: string;
    variants: Array<{
      id: string;
      title: string;
      price: string;
      available: boolean;
    }>;
  }

  
  class ShopifyService {
    private shopDomain: string;
    private storefrontAccessToken: string;
    private endpoint: string;
    
    constructor(shopDomain: string, storefrontAccessToken: string) {
      this.shopDomain = shopDomain;
      this.storefrontAccessToken = storefrontAccessToken;
      this.endpoint = `https://${shopDomain}/api/2023-01/graphql.json`;
    }
    
    async fetchFilteredProducts(
        filters: {
          query?: string;       // Search term (e.g. "blue jeans")
          productType?: string; // Product category (e.g. "jeans")
          tag?: string;         // Product tag (e.g. "summer")
          priceMin?: number;    // Minimum price
          priceMax?: number;    // Maximum price
        } = {}, // Make filters parameter optional with default empty object
        limit: number = 75          
      ): Promise<FormattedProduct[]> {
        // Build filter conditions for GraphQL
        let filterConditions = '';
        
        if (filters.query) {
          filterConditions += `query: "${filters.query}", `;
        }
        
        // Build the GraphQL query with filters
        const query = `
          query {
            products(first: ${limit}, ${filterConditions}) {
              edges {
                node {
                  id
                  title
                  description
                  productType
                  tags
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        originalSrc
                        altText
                      }
                    }
                  }
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        
        try {
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken
            },
            body: JSON.stringify({ query })
          });
          
          const data = await response.json();
          
          // Format the response to a more usable structure
          return this.formatProductData(data.data.products.edges);
        } catch (error) {
          console.error('Error fetching filtered products from Shopify:', error);
          return [];
        }
      }
    
    formatProductData(productEdges: Array<{node: ShopifyProductNode}>): FormattedProduct[] {
      return productEdges.map(edge => {
        const product = edge.node;
        const firstImage = product.images.edges[0]?.node;
        
        return {
          id: product.id.split('/').pop() || product.id, // Extract just the ID from the Gid
          title: product.title,
          description: product.description,
          productType: product.productType,
          tags: product.tags,
          price: product.priceRange.minVariantPrice.amount,
          currency: product.priceRange.minVariantPrice.currencyCode,
          imageUrl: firstImage ? firstImage.originalSrc : null,
          imageAlt: firstImage ? (firstImage.altText || product.title) : product.title,
          variants: product.variants.edges.map(variantEdge => ({
            id: variantEdge.node.id,
            title: variantEdge.node.title,
            price: variantEdge.node.price,
            available: variantEdge.node.availableForSale
          }))
        };
      });
    }
    
    // Add method for custom recommendations
    async saveCustomRecommendations(
      productId: string, 
      recommendations: CustomRecommendation[]
    ): Promise<boolean> {
      // This would typically use Shopify's Admin API or metafields
      // For now, we'll assume using localStorage in development
      try {
        const existingRecs = JSON.parse(localStorage.getItem('customRecommendations') || '{}');
        existingRecs[productId] = recommendations;
        localStorage.setItem('customRecommendations', JSON.stringify(existingRecs));
        return true;
      } catch (error) {
        console.error('Error saving custom recommendations:', error);
        return false;
      }
    }
    
    async getCustomRecommendations(): Promise<Record<string, CustomRecommendation[]>> {
      // For development using localStorage
      try {
        return JSON.parse(localStorage.getItem('customRecommendations') || '{}');
      } catch (error) {
        console.error('Error getting custom recommendations:', error);
        return {};
      }
    }
  }
  
  export default ShopifyService;