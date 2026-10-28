const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

class DbService {
  constructor() {
    this.ensureDbExists();
    this.db = new Database(DB_PATH, { verbose: null }); // Set to console.log for debugging SQL
    this.initTables();
  }

  ensureDbExists() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  initTables() {
    // History Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        type TEXT,
        message TEXT,
        sensor TEXT,
        severity TEXT,
        value TEXT,
        threshold TEXT,
        status TEXT,
        resolvedAt TEXT
      )
    `);

    // Settings Table (Key-Value pair)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Insert Default Settings if empty
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM settings');
    const { count } = stmt.get();
    if (count === 0) {
      const insert = this.db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value)');
      const insertMany = this.db.transaction((settings) => {
        for (const setting of settings) insert.run(setting);
      });
      insertMany([
        { key: 'smsAlert', value: '1' },
        { key: 'callAlert', value: '0' },
        { key: 'simModuleEnabled', value: '1' },
        { key: 'adminPhone', value: '' },
        { key: 'supervisorPhone', value: '' },
        { key: 'thresholdTemp', value: '40' },
        { key: 'thresholdSmoke', value: '3500' },
        { key: 'thresholdCurrent', value: '8.0' },
        { key: 'enableFlame', value: '0' },
        { key: 'enableSmoke', value: '0' }
      ]);
    }
  }

  getSettings() {
    const rows = this.db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(row => {
      if (['smsAlert', 'callAlert', 'simModuleEnabled', 'enableTemp', 'enableSmoke', 'enableCurrent', 'enableFlame', 'enableVibration'].includes(row.key)) {
        settings[row.key] = row.value === '1' || row.value === 'true';
      } else if (row.key.startsWith('threshold')) {
        settings[row.key] = parseFloat(row.value) || 0;
      } else {
        settings[row.key] = row.value;
      }
    });
    return settings;
  }

  updateSettings(newSettings) {
    const updateStmt = this.db.prepare('UPDATE settings SET value = @value WHERE key = @key');
    const insertStmt = this.db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
    
    this.db.transaction(() => {
      for (const [key, value] of Object.entries(newSettings)) {
        let dbValue = value;
        if (typeof value === 'boolean') {
          dbValue = value ? '1' : '0';
        } else {
          dbValue = value.toString();
        }
        insertStmt.run({ key, value: dbValue });
      }
    })();
    
    return this.getSettings();
  }

  getHistory(limit = 1000) {
    return this.db.prepare('SELECT * FROM history ORDER BY timestamp DESC LIMIT ?').all(limit);
  }

  addHistoryEvent(event) {
    const stmt = this.db.prepare(`
      INSERT INTO history (id, timestamp, type, message, sensor, severity, value, threshold, status, resolvedAt)
      VALUES (@id, @timestamp, @type, @message, @sensor, @severity, @value, @threshold, @status, @resolvedAt)
    `);
    
    stmt.run({
      id: event.id,
      timestamp: event.timestamp,
      type: event.type,
      message: event.message,
      sensor: event.sensor,
      severity: event.severity,
      value: event.value ? event.value.toString() : '',
      threshold: event.threshold ? event.threshold.toString() : '',
      status: event.status,
      resolvedAt: event.resolvedAt || null
    });
  }

  resolveHistoryEvent(type) {
    // Find the active event of this type
    const findStmt = this.db.prepare(`SELECT * FROM history WHERE type = ? AND status = 'ACTIVE' ORDER BY timestamp DESC LIMIT 1`);
    const event = findStmt.get(type);

    if (event) {
      const now = new Date().toISOString();
      const updateStmt = this.db.prepare(`UPDATE history SET status = 'RESOLVED', resolvedAt = ? WHERE id = ?`);
      updateStmt.run(now, event.id);
      event.status = 'RESOLVED';
      event.resolvedAt = now;
      return event;
    }
    return null;
  }

  getAnalytics() {
    // Calculate analytics dynamically via SQL
    const totalAlerts = this.db.prepare(`SELECT COUNT(*) as count FROM history`).get().count;
    const criticalAlerts = this.db.prepare(`SELECT COUNT(*) as count FROM history WHERE severity = 'CRITICAL'`).get().count;
    const warnings = this.db.prepare(`SELECT COUNT(*) as count FROM history WHERE severity = 'WARNING'`).get().count;
    const resolvedEvents = this.db.prepare(`SELECT COUNT(*) as count FROM history WHERE status = 'RESOLVED'`).get().count;

    return {
      totalAlerts,
      criticalAlerts,
      warnings,
      resolvedEvents
    };
  }
}

module.exports = new DbService();
