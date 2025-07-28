// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
app.use(express.json());
app.use(cors());
// ----------- WORKING AREA -------------


// Example route to test the backend
app.get('/api/data', (req, res) => {
    res.json({ message: 'BoomBat hell yeah!' });
});


// -------------- END OF WORKING AREA -----------
//Launch the server with "npm run dev"
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});