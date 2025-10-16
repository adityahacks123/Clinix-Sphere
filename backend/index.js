const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

const PORT = process.env.PORT || 3001;

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
