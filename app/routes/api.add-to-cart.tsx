// app/routes/api.add-to-cart.tsx
import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Authenticate the request - use optional chaining to handle potential undefined
    const { admin } = await authenticate.admin(request);
    
    if (!admin) {
      return json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const data = await request.json();
    const { productId, sessionId } = data;
    
    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Create a GraphQL client - updated to use the correct syntax
    const client = admin.graphql;
    
    // Create a new checkout or add to existing one
    const CREATE_CHECKOUT = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;
    
    const response = await client.query({
        data: {
          query: CREATE_CHECKOUT,
          variables: {
            input: {
              lineItems: [{ variantId: `gid://shopify/ProductVariant/${productId}`, quantity: 1 }]
            }
          }
        }
      });
    
    return json({
      success: true,
      checkout: response.body.data.checkoutCreate.checkout
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return json(
      { error: 'An error occurred while adding the product to cart' },
      { status: 500 }
    );
  }
}