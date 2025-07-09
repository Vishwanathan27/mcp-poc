const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });

console.log('MCP Server started on port 8080');

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        try {
            const mcpMessage = JSON.parse(message);
            console.log('Received MCP message:', mcpMessage);

            // Handle MCP message
            if (mcpMessage.messageType === 'request') {
                const response = {
                    messageId: uuidv4(),
                    conversationId: mcpMessage.conversationId,
                    messageType: 'response',
                    sender: 'server',
                    content: `Echo: ${mcpMessage.content}`
                };
                ws.send(JSON.stringify(response));
                console.log('Sent MCP response:', response);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
