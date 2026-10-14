import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    smoke: 0,
    flame: 1,
    vibration: 0,
    current: 0,
    systemStatus: 'SAFE'
  });
  
  const [settings, setSettings] = useState({ smsAlert: true, callAlert: false });
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Historical data for charts (last 20 points)
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('initialState', (data) => {
      setSettings(data.settings);
      setSensorData(data.sensorData);
      setHistory(data.history);
      setAnalytics(data.analytics);
      setLastUpdate(Date.now());
    });

    newSocket.on('sensorUpdate', (data) => {
      setSensorData(data);
      const now = new Date().toLocaleTimeString();
      setChartData(prev => {
        const newData = [...prev, { time: now, ...data }];
        if (newData.length > 20) newData.shift(); // Keep last 20 points
        return newData;
      });
      setLastUpdate(Date.now());
    });

    newSocket.on('settingsUpdated', (newSettings) => {
      setSettings(newSettings);
    });

    newSocket.on('alert:new', (alert) => {
      setHistory(prev => [alert, ...prev]);
    });

    newSocket.on('alert:resolved', (resolvedAlert) => {
      setHistory(prev => prev.map(a => a.id === resolvedAlert.id ? resolvedAlert : a));
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, connected, sensorData, settings, history, analytics, lastUpdate, chartData, API_URL 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
