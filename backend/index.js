const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Ascentia API running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Ascentia API server running on port ${PORT}`);
});
