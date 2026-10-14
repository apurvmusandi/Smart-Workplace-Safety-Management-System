import React from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { ShieldAlert, Cpu, Activity, Zap, Flame, Wind, ThermometerSun, Radio } from 'lucide-react';

const Diagnostics = () => {
  const { sensorData, connected, settings } = useSocket();

  // Dynamic thresholds
  const thrTemp = settings.thresholdTemp || 40;
  const thrSmoke = settings.thresholdSmoke || 1800;
  const thrCurrent = settings.thresholdCurrent || 0.35;

  // Determine Zone Statuses
  const m1Danger = sensorData.current > thrCurrent;
  const m2Danger = sensorData.vibration;
  const storageDanger = sensorData.flame === 0 || sensorData.temperature > thrTemp;
  const workAreaDanger = sensorData.smoke > thrSmoke;

  const getZoneClass = (isDanger) => {
    return isDanger 
      ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' 
      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  };

  const getStatusIcon = (isDanger) => {
    return isDanger 
      ? <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping" />
      : <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />;
  };

  // Simulated Hardware Health
  const components = [
    { name: 'ESP32 Controller', icon: Cpu, status: connected ? 'ONLINE' : 'OFFLINE', ok: connected },
    { name: 'SIM800L Module', icon: Radio, status: settings.simModuleEnabled ? 'ONLINE' : 'DISABLED', ok: settings.simModuleEnabled },
    { name: 'DHT22 Sensor', icon: ThermometerSun, status: sensorData.temperature > 0 ? 'HEALTHY' : 'NO DATA', ok: sensorData.temperature > 0 },
    { name: 'MQ Gas Sensor', icon: Wind, status: sensorData.smoke > 0 ? 'HEALTHY' : 'NO DATA', ok: sensorData.smoke > 0 },
    { name: 'Flame Sensor', icon: Flame, status: 'HEALTHY', ok: true }, // Assumed always ok unless esp is offline
    { name: 'ACS712 Monitor', icon: Zap, status: 'HEALTHY', ok: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8 pb-10">
      
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-cyan-500 w-6 h-6" />
          Diagnostics & Map
        </h2>
        <p className="text-slate-400 text-sm mt-1">Live factory topology and hardware component health monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Factory Map */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Live Factory Map</h3>
          
          <div className="relative border-2 border-slate-700/50 rounded-2xl p-6 bg-[#06090D] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')] opacity-10 pointer-events-none" />
            
            <div className="text-center mb-6 opacity-50 font-mono tracking-widest text-sm border-b border-slate-700 pb-2">WORKPLACE TOPOLOGY</div>
            
            <div className="grid grid-cols-2 gap-6 relative z-10">
              {/* MACHINE 1 */}
              <div className={`p-6 rounded-xl border flex flex-col items-center justify-center h-40 transition-all duration-500 ${getZoneClass(m1Danger)}`}>
                <h4 className="font-bold tracking-widest mb-4">MACHINE 1</h4>
                {getStatusIcon(m1Danger)}
                <span className="text-[10px] uppercase font-mono mt-2 opacity-70">Current Sensor</span>
              </div>

              {/* MACHINE 2 */}
              <div className={`p-6 rounded-xl border flex flex-col items-center justify-center h-40 transition-all duration-500 ${getZoneClass(m2Danger)}`}>
                <h4 className="font-bold tracking-widest mb-4">MACHINE 2</h4>
                {getStatusIcon(m2Danger)}
                <span className="text-[10px] uppercase font-mono mt-2 opacity-70">Vibration Sensor</span>
              </div>

              {/* STORAGE */}
              <div className={`p-6 rounded-xl border flex flex-col items-center justify-center h-40 transition-all duration-500 ${getZoneClass(storageDanger)}`}>
                <h4 className="font-bold tracking-widest mb-4">STORAGE</h4>
                {getStatusIcon(storageDanger)}
                <span className="text-[10px] uppercase font-mono mt-2 opacity-70">Temp & Flame</span>
              </div>

              {/* WORK AREA */}
              <div className={`p-6 rounded-xl border flex flex-col items-center justify-center h-40 transition-all duration-500 ${getZoneClass(workAreaDanger)}`}>
                <h4 className="font-bold tracking-widest mb-4">WORK AREA</h4>
                {getStatusIcon(workAreaDanger)}
                <span className="text-[10px] uppercase font-mono mt-2 opacity-70">Smoke/Gas Sensor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Diagnostics */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Component Health</h3>
          <div className="space-y-4">
            {components.map((comp, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${comp.ok ? 'bg-slate-800/50 border-slate-700' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${comp.ok ? 'bg-slate-700/50 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                    <comp.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{comp.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">ID: HWC-00{i+1}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest border ${comp.ok ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {comp.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Diagnostics;
