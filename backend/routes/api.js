const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Inject io, db, and state into controller
router.use((req, res, next) => {
  req.io = req.app.get('io');
  req.db = req.app.get('db');
  req.globalState = req.app.get('globalState');
  next();
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Settings API
router.get('/settings', (req, res) => {
  res.json(req.db.getSettings());
});

router.put('/settings', (req, res) => {
  const allowedKeys = ['smsAlert', 'callAlert', 'simModuleEnabled', 'adminPhone', 'supervisorPhone', 'thresholdTemp', 'thresholdSmoke', 'thresholdCurrent', 'enableTemp', 'enableSmoke', 'enableCurrent', 'enableFlame', 'enableVibration'];
  const newSettings = {};
  
  for (const key of allowedKeys) {
    if (req.body[key] !== undefined) {
      newSettings[key] = req.body[key];
    }
  }
  
  const updatedSettings = req.db.updateSettings(newSettings);
  
  // Broadcast settings change
  req.io.emit('settingsUpdated', updatedSettings);
  
  console.log(`[INFO] Settings updated`);
  res.json(updatedSettings);
});

// Sensor Data API (called by ESP32)
router.post('/sensors/data', sensorController.processSensorData);
router.get('/sensors/latest', (req, res) => {
  res.json(req.globalState.latestSensorData);
});

// Alerts & History API
router.get('/alerts', (req, res) => {
  const history = req.db.getHistory();
  const activeAlerts = history.filter(event => event.status === 'ACTIVE');
  res.json(activeAlerts);
});

router.get('/alerts/history', (req, res) => {
  res.json(req.db.getHistory());
});

// Analytics API
router.get('/analytics', (req, res) => {
  res.json(req.db.getAnalytics());
});

// Test Commands API (Sends command to ESP32 / Arduino indirectly if supported)
router.post('/alerts/test', (req, res) => {
  // Currently, the ESP32 code polls /settings but doesn't have a mechanism to receive ad-hoc push tests.
  // We log it and simulate. In a true bidirectional setup, we would send a websocket or MQTT message to ESP32.
  console.log(`[TEST] Emergency test requested: ${req.body.type}`);
  res.json({ status: 'Command logged (ESP32 push not implemented over HTTP)' });
});

module.exports = router;
