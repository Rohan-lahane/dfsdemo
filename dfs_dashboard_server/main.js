// Import the required modules
import { fetchNagiosStatus } from './utils.js';
import express from 'express';
import axios from 'axios'


// Initialize an Express application
const app = express();
app.use(express.json()); // Make sure this comes before your routes


// Define the Nagios API endpoint and the initial current_status object

// Initial call to fetch Nagios status

let count = 0; 
let testdata; 

app.get('/', (req, res) => {
  res.send('Hello world to my monitoring server');
});

app.get('/test', (req, res) => {
  res.send(testdata); 
});


app.get('/currentstatus', async (req, res) => {
  try {
    const current_status = await fetchNagiosStatus();
    res.json(current_status); // Return current_status as JSON
    count++;
    console.log('count ', count);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching Nagios status.' });
  }
});

app.post('/nagiosdata', async(req,res)=>{
  try{
    const jsonData = req.body;
    console.log('Received JSON data:', req.body);
    testdata = jsonData; 
    res.status(200).send('Data received successfully!');

  } catch (error){
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching Nagios status.' });
  }
})


const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


