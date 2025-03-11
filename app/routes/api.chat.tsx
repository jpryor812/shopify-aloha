// app/routes/api.chat.tsx
import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

// Create a simple endpoint that doesn't require authentication
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Parse the request body
    const data = await request.json();
    const { message, sessionId } = data;
    
    if (!message || !sessionId) {
      return json({ error: 'Message and sessionId are required' }, { status: 400 });
    }
    
    // Instead of using the controller, just echo the message back
    // This helps us verify that the API endpoint is actually reachable
    return json({
      response: `You said: ${message}`,
      success: true,
      conversation: [
        { isUser: true, text: message, timestamp: new Date() },
        { isUser: false, text: `You said: ${message}`, timestamp: new Date() }
      ]
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return json(
      { error: 'An error occurred while processing your message', details: String(error) },
      { status: 500 }
    );
  }
}