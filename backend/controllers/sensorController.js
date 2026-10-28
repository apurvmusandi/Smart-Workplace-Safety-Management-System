exports.processSensorData = (req, res) => {
  const {
    deviceId,
    temperature,
    humidity,
    smoke,
    flame,
    vibration,
    current,
    systemStatus // e.g., 'SAFE', 'FIRE', 'SMOKE', 'HIGH_TEMP', 'OVER_CURRENT', 'VIBRATION'
  } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'Missing deviceId' });
  }

  // Fetch dynamic thresholds from DB
  const settings = req.db.getSettings();
  const thrTemp = settings.thresholdTemp || 40;
  const thrSmoke = settings.thresholdSmoke || 3500;
  const thrCurrent = settings.thresholdCurrent !== undefined ? settings.thresholdCurrent : 8.0;

  // Determine System Status based on dynamic thresholds (if not strictly provided by ESP32)
  let currentSystemStatus = systemStatus || 'SAFE';
  if (currentSystemStatus === 'SAFE') { // fallback check if ESP32 just sends SAFE
    if (settings.enableFlame === true && flame === 0) currentSystemStatus = 'FIRE';
    else if (settings.enableSmoke === true && smoke > thrSmoke) currentSystemStatus = 'SMOKE';
    else if (settings.enableTemp !== false && temperature > thrTemp) currentSystemStatus = 'HIGH_TEMP';
    else if (settings.enableCurrent !== false && current > thrCurrent) currentSystemStatus = 'OVER_CURRENT';
    else if (settings.enableVibration !== false && vibration) currentSystemStatus = 'VIBRATION';
  }

  // Determine Severity and sensor info based on type
  const getAlertDetails = (type) => {
    switch (type) {
      case 'FIRE': return { sensor: 'Flame', severity: 'CRITICAL', value: 'Flame Detected', threshold: 'N/A' };
      case 'SMOKE': return { sensor: 'Smoke', severity: 'WARNING', value: smoke, threshold: `${thrSmoke} ADC` };
      case 'HIGH_TEMP': return { sensor: 'Temperature', severity: 'CRITICAL', value: `${temperature} °C`, threshold: `${thrTemp} °C` };
      case 'OVER_CURRENT': return { sensor: 'Current', severity: 'WARNING', value: `${current} A`, threshold: `${thrCurrent} A` };
      case 'VIBRATION': return { sensor: 'Vibration', severity: 'WARNING', value: 'Vibration Detected', threshold: 'N/A' };
      default: return { sensor: 'System', severity: 'INFO', value: 'N/A', threshold: 'N/A' };
    }
  };

  // Update in-memory state
  req.globalState.latestSensorData = {
    temperature: temperature || 0,
    humidity: humidity || 0,
    smoke: smoke || 0,
    flame: flame !== undefined ? flame : 1,
    vibration: vibration || 0,
    current: current || 0,
    systemStatus: currentSystemStatus
  };

  // STATE MACHINE LOGIC FOR ALERTS
  if (currentSystemStatus !== 'SAFE') {
    // If this alert type is not currently active, trigger a new alert
    if (!req.globalState.activeAlerts.has(currentSystemStatus)) {
      req.globalState.activeAlerts.add(currentSystemStatus);
      
      const details = getAlertDetails(currentSystemStatus);
      const newEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: currentSystemStatus,
        message: `${currentSystemStatus} DETECTED`,
        sensor: details.sensor,
        severity: details.severity,
        value: details.value,
        threshold: details.threshold,
        status: 'ACTIVE'
      };

      req.db.addHistoryEvent(newEvent);
      req.io.emit('alert:new', newEvent);
      console.log(`[ALERT] New event created: ${currentSystemStatus}`);
    }
  } else {
    // If system is safe, resolve all currently active alerts
    if (req.globalState.activeAlerts.size > 0) {
      req.globalState.activeAlerts.forEach(type => {
        const resolvedEvent = req.db.resolveHistoryEvent(type);
        if (resolvedEvent) {
          req.io.emit('alert:resolved', resolvedEvent);
          console.log(`[ALERT] Event resolved: ${type}`);
        }
      });
      req.globalState.activeAlerts.clear();
    }
  }

  // Broadcast to all connected clients
  req.io.emit('sensorUpdate', req.globalState.latestSensorData);
  
  res.json({ status: 'OK' });
};
