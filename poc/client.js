const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to MCP server');

    // Send a sample MCP request
    const request = {
        messageId: uuidv4(),
        conversationId: uuidv4(),
        messageType: 'request',
        sender: 'client',
        content: 'Hello from the client!'
    };

    ws.send(JSON.stringify(request));
    console.log('Sent MCP request:', request);
});

ws.on('message', message => {
    try {
        const mcpMessage = JSON.parse(message);
        console.log('Received MCP message:', mcpMessage);
    } catch (error) {
        console.error('Error processing message:', error);
    }
    ws.close();
});

ws.on('close', () => {
    console.log('Disconnected from MCP server');
});

ws.on('error', error => {
    console.error('WebSocket error:', error);
});
