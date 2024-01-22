const express = require('express');
const app = express();
const port = 3000;
const data = require('./data.json'); // Your JSON data file

// Serve static files from 'public' directory
app.use(express.static('public'));

// Root route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.htm');
});

// Endpoint to get random data
app.get('/random-data', (req, res) => {
  let shuffled = data.sort(() => 0.5 - Math.random());
  res.send(shuffled.slice(0, 3));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
