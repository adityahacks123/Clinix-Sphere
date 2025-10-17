const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Connect Database
connectDB();

const PORT = process.env.PORT || 3001;

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/auth')(io));
app.use('/api/appointments', require('./routes/appointments')(io));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/doctors', require('./routes/doctors'));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
