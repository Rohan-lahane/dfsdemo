const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define a route for the root path (GET request)
app.get('/', (req, res) => {
    res.send('Hello world to my demo dfs server');
});

app.post('/monitor', (req, res) => {
    // Generate a timestamp
    const timestamp = new Date().toISOString();

    // Return a JSON object with the specified properties, including the timestamp
    const responseObject = {
        message: 'Select service or host',
        status: 1,
        timestamp: timestamp
    };

    res.json(responseObject);
});

// Define routes for /monitor/host and /monitor/services (POST requests)
app.post('/monitor/host', (req, res) => {
    // Log the received JSON data
    console.log('Received data for /monitor/host:', req.body);

    // Send the received JSON data back as-is
    res.json(req.body);
});

app.post('/monitor/services', (req, res) => {
    // Log the received JSON data
    console.log('Received data for /monitor/services:', req.body);

    // Send the received JSON data back as-is
    res.json(req.body);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
