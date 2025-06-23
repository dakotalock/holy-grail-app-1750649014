// netlify/functions/api.js

/**
 * EchoBot 9000 Backend Function
 *
 * This file implements the serverless backend logic for the EchoBot 9000 application
 * using Node.js and a minimal Express.js setup. It's designed to run as a Netlify Function.
 *
 * Core Purpose: To demonstrate a fundamental full-stack architecture by providing
 * a very basic web-based chatbot. It receives user input, processes it, and
 * returns a response, emphasizing clear client-server communication and Netlify Functions deployment.
 *
 * Backend Architecture:
 * - Language: JavaScript (Node.js)
 * - Framework: Express.js (minimal usage for request/response handling)
 * - Deployment Strategy: Netlify Functions (single function for /api/chat)
 * - Database: Not required (stateless interactions only)
 */

// Import necessary modules
const express = require('express');
const serverless = require('serverless-http');

// Initialize the Express application
const app = express();

/**
 * Middleware to parse JSON request bodies.
 * This is essential for handling the incoming POST requests with a JSON payload
 * containing the user's message (e.g., `{ "message": "Hello" }`).
 */
app.use(express.json());

/**
 * API Endpoint: POST /chat
 *
 * Purpose: Receives a user message and returns a processed response from the bot.
 *
 * This Express route will handle requests to the '/chat' path. When deployed on Netlify,
 * and assuming a `netlify.toml` redirect like `from = "/api/*" to = "/.netlify/functions/api/:splat"`,
 * the frontend will make requests to `/api/chat`, which Netlify will then proxy to this
 * function, with the path seen by Express as `/chat`.
 */
app.post('/chat', async (req, res) => {
    // --- Logging for Debugging ---
    // These logs are crucial for debugging deployed Netlify Functions.
    // They can be viewed in the Netlify dashboard under the 'Functions' tab.
    console.log(`[${new Date().toISOString()}] Received POST request for /chat`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

    try {
        // 1. Parse the 'message' from the request body.
        const { message } = req.body;

        // Input Validation: Ensure the 'message' field is present and is a non-empty string.
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.error('[Error] Validation Failed: Message is missing, not a string, or empty.');
            // Return a 400 Bad Request error if validation fails.
            return res.status(400).json({
                error: 'Message is required and must be a non-empty string.',
                backendSignature: `Error processed by EchoBot 9000 @ ${new Date().toISOString()}`
            });
        }

        let botResponse = '';
        const lowerCaseMessage = message.toLowerCase();

        // 2. Apply simple, clear transformation logic to the message.
        // This demonstrates the backend's processing capability.
        if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
            // Rule 1: Specific greeting response for "hello" or "hi"
            botResponse = 'Greetings, human! How can I assist you?';
        } else {
            // Rule 2: General response - convert the user's message to uppercase
            botResponse = `BOT SAYS: ${message.toUpperCase()}`;
        }

        // 3. Generate a 'backendSignature' using a simple timestamp.
        // This signature serves as tangible proof that the request was processed
        // by the backend and provides a unique identifier for each response.
        const backendSignature = `Processed by EchoBot 9000 @ ${new Date().toISOString()}`;

        // 4. Return the processed 'response' and the 'backendSignature' in the JSON payload.
        console.log('[Success] Sending response:', {
            response: botResponse,
            backendSignature: backendSignature
        });
        res.status(200).json({
            response: botResponse,
            backendSignature: backendSignature
        });

    } catch (error) {
        // --- Error Handling ---
        // Catch any unexpected errors that occur during the processing.
        console.error('[Error] Internal Server Error during chat processing:', error);

        // Return a 500 Internal Server Error with a descriptive message.
        // Including `error.message` can be helpful for debugging but should be
        // carefully considered in production environments to avoid exposing sensitive details.
        res.status(500).json({
            error: 'An unexpected error occurred while processing your request.',
            details: error.message, // Providing error details for debugging purposes.
            backendSignature: `Error processed by EchoBot 9000 @ ${new Date().toISOString()}`
        });
    }
});

/**
 * Export the Express app wrapped by `serverless-http`.
 *
 * This is the crucial step for deploying an Express application as a Netlify Function.
 * `serverless-http` adapts the Express app's request/response cycle to the
 * `(event, context)` signature expected by Netlify Functions (and AWS Lambda).
 *
 * When this file is deployed as `api.js` in `netlify/functions/`, Netlify will
 * automatically detect and use `module.exports.handler` as the entry point.
 */
module.exports.handler = serverless(app);

// Note: For local development using `netlify dev`, this function will be
// automatically served. You typically don't need a separate `app.listen()` call here.
// If you were testing Express directly without `netlify dev`, you might add:
/*
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT) {
    const PORT = process.env.PORT || 9000; // Use a different port to avoid conflicts
    app.listen(PORT, () => {
        console.log(`EchoBot 9000 Backend (Express standalone) listening on port ${PORT}`);
        console.log(`Access at http://localhost:${PORT}/chat (via POST)`);
    });
}
*/