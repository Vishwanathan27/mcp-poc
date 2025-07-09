const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

console.log('Starting MCP client and server...');

// Spawn the server as a child process
const serverProcess = spawn('node', ['server.js']);

// Listen for responses from the server's standard output
serverProcess.stdout.on('data', (data) => {
    // The server might send multiple JSON objects, so we need to handle them.
    const responses = data.toString().split('\n').filter(line => line.trim() !== '');
    responses.forEach(response => {
        try {
            const mcpMessage = JSON.parse(response);
            console.log('Received MCP message:', mcpMessage);
        } catch (error) {
            console.error('Error parsing server response:', error);
            console.error('Raw response:', response);
        }
    });
});

// Log any errors from the server process for debugging
serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
});

// Log when the server process closes
serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

// When the client process is about to exit, make sure to kill the server process
process.on('exit', () => {
    console.log('Client exiting, terminating server...');
    serverProcess.kill();
});


// Function to send a request to the server
function sendRequest(method, params) {
    const request = {
        jsonrpc: '2.0',
        method,
        params,
        id: uuidv4()
    };
    const jsonRequest = JSON.stringify(request);
    serverProcess.stdin.write(jsonRequest + '\n');
    console.log('Sent MCP request:', request);
}

// Once the server is likely started (indicated by its stderr output), send requests.
serverProcess.stderr.on('data', (data) => {
    const message = data.toString();
    console.error(`Server stderr: ${message}`);
    // A bit of a hack: we send our request once we see the "Server connected" message.
    if (message.includes('Server connected')) {
        // Example 1: Call the 'calculate' tool
        sendRequest('tools/call', {
            name: 'calculate',
            arguments: { operation: 'add', a: 10, b: 5 }
        });

        // Example 2: Call the 'hello' tool
        sendRequest('tools/call', {
            name: 'hello',
            arguments: { name: 'World' }
        });

        // Close the server's input stream to signal that we're done sending requests.
        serverProcess.stdin.end();
    }
});
