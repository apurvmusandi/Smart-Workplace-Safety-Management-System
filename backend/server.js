const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const db = require('./services/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development. Should be restricted in production.
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

// In-memory volatile state for sensors
const globalState = {
  latestSensorData: {
    temperature: 0,
    humidity: 0,
    smoke: 0,
    flame: 1, // 1 is safe
    vibration: 0,
    current: 0,
    systemStatus: 'SAFE'
  },
  activeAlerts: new Set() // Tracks active alert types (e.g., 'FIRE', 'SMOKE')
};

// Make io, db, and state accessible in routes
app.set('io', io);
app.set('db', db);
app.set('globalState', globalState);

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

io.on('connection', (socket) => {
  console.log(`[INFO] Client connected: ${socket.id}`);
  
  // Send initial state upon connection
  socket.emit('initialState', {
    settings: db.getSettings(),
    sensorData: globalState.latestSensorData,
    history: db.getHistory().slice(0, 50), // Send latest 50 for quick load
    analytics: db.getAnalytics()
  });

  socket.on('disconnect', () => {
    console.log(`[INFO] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
