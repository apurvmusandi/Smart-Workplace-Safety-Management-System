import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import SensorCard from '../../components/SensorCard';
import { Thermometer, Droplets, Wind, Flame, Zap, Activity, AlertTriangle, CheckCircle, Cpu, Radio } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveMonitoring = () => {
  const { sensorData, chartData, lastUpdate, settings } = useSocket();
  const [esp32Online, setEsp32Online] = useState(false);

  useEffect(() => {
    const checkOnline = () => {
      if (!lastUpdate) return;
      const diff = Date.now() - new Date(lastUpdate).getTime();
      setEsp32Online(diff < 10000); // 10 seconds timeout
    };
    
    checkOnline();
    const interval = setInterval(checkOnline, 2000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getSystemStatusCard = () => {
    const isSafe = sensorData.systemStatus === 'SAFE';
    return (
      <div className={`p-8 rounded-[2rem] border backdrop-blur-xl transition-all duration-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden ${
        isSafe ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-br from-red-500/20 to-red-900/10 border-red-500/50 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
      }`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest text-white">System Status</h2>
          <div className="text-5xl md:text-6xl font-black tracking-tight flex items-center gap-4 drop-shadow-md">
            {isSafe ? <CheckCircle className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> : <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />}
            {sensorData.systemStatus}
          </div>
        </div>
          <div className="text-right relative z-10 flex flex-col items-end gap-3">
            <p className="text-sm font-medium opacity-90 max-w-sm leading-relaxed hidden md:block text-slate-300">
              {isSafe 
                ? 'All monitored workplace parameters are currently within configured safety limits. Facility is secure.'
                : 'CRITICAL WARNING: Immediate attention required. Sensor thresholds exceeded. Evacuation protocols may be active.'}
            </p>
            
            {/* Module Status Indicators */}
            <div className="flex gap-2 mt-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold shadow-inner ${esp32Online ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <Cpu className="w-3.5 h-3.5" />
                <span>ESP32 {esp32Online ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold shadow-inner ${settings.simModuleEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-800/80 border-slate-700 text-slate-500'}`}>
                <Radio className="w-3.5 h-3.5" />
                <span>SIM800L {settings.simModuleEnabled ? 'READY' : 'OFF'}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400 shadow-inner">
              <span className={`w-1.5 h-1.5 rounded-full ${esp32Online ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              Last Sync: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
          </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-4 rounded-xl shadow-2xl font-mono text-sm">
          <p className="text-slate-400 mb-3 border-b border-slate-700 pb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 mb-1">
              <span className="flex items-center gap-2" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-bold text-white text-base">{Number(entry.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-10"
    >
      {/* Top Status */}
      {getSystemStatusCard()}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SensorCard title="Temperature" value={sensorData.temperature} unit="°C" status={sensorData.temperature > (settings.thresholdTemp || 40) ? 'DANGER' : 'NORMAL'} icon={Thermometer} threshold={settings.thresholdTemp || "40"} dataKey="temperature" chartData={chartData} enabled={settings.enableTemp !== false} themeColor="cyan" />
        <SensorCard title="Smoke Level" value={sensorData.smoke} unit="ADC" status={sensorData.smoke > (settings.thresholdSmoke || 1800) ? 'DANGER' : 'NORMAL'} icon={Wind} threshold={settings.thresholdSmoke || "1800"} dataKey="smoke" chartData={chartData} enabled={settings.enableSmoke !== false} themeColor="indigo" />
        <SensorCard title="Current" value={sensorData.current} unit="A" status={sensorData.current > (settings.thresholdCurrent || 0.35) ? 'WARNING' : 'NORMAL'} icon={Zap} threshold={settings.thresholdCurrent || "0.35"} dataKey="current" chartData={chartData} enabled={settings.enableCurrent !== false} themeColor="blue" />
        <SensorCard title="Flame Detection" value={sensorData.flame === 0 ? 'YES' : 'NO'} unit="" status={sensorData.flame === 0 ? 'DETECTED' : 'SAFE'} icon={Flame} dataKey="flame" enabled={settings.enableFlame !== false} themeColor="purple" />
        <SensorCard title="Vibration" value={sensorData.vibration ? 'YES' : 'NO'} unit="" status={sensorData.vibration ? 'DETECTED' : 'SAFE'} icon={Activity} dataKey="vibration" enabled={settings.enableVibration !== false} themeColor="emerald" />
        <SensorCard title="Humidity" value={sensorData.humidity} unit="%" status="NORMAL" icon={Droplets} dataKey="humidity" chartData={chartData} themeColor="emerald" />
      </div>

      {/* Large Chart Section */}
      <div className="p-8 rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 mt-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Activity className="text-cyan-400 w-5 h-5" />
            </div>
            Live Telemetry Stream
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><span className="w-3 h-1 bg-[#22d3ee] rounded-full" /> Temp</div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><span className="w-3 h-1 bg-[#818cf8] rounded-full" /> Smoke</div>
          </div>
        </div>
        
        <div className="h-80 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSmoke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={10} />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#22d3ee" strokeWidth={3} fill="url(#colorTemp)" isAnimationActive={false} />
              <Area yAxisId="right" type="monotone" dataKey="smoke" name="Smoke (ADC)" stroke="#818cf8" strokeWidth={3} fill="url(#colorSmoke)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveMonitoring;
