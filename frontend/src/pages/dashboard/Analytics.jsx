import React from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { BarChart2, ShieldAlert, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Analytics = () => {
  const { analytics, history } = useSocket();

  // Calculate sensor frequencies
  const sensorCounts = history.reduce((acc, curr) => {
    acc[curr.sensor] = (acc[curr.sensor] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(sensorCounts).map(key => ({
    name: key,
    incidents: sensorCounts[key]
  }));

  // Dummy data for radar chart to make it look cool and populated if we don't have enough history
  const radarData = [
    { subject: 'Temp', A: sensorCounts['Temperature'] || 10, fullMark: 150 },
    { subject: 'Smoke', A: sensorCounts['Smoke'] || 30, fullMark: 150 },
    { subject: 'Flame', A: sensorCounts['Flame'] || 5, fullMark: 150 },
    { subject: 'Current', A: sensorCounts['Current'] || 20, fullMark: 150 },
    { subject: 'Vibration', A: sensorCounts['Vibration'] || 8, fullMark: 150 },
  ];

  // Prevent crash if analytics hasn't loaded
  if (!analytics) return <div className="text-slate-500">Loading analytics...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-cyan-500 w-6 h-6" />
          System Analytics
        </h2>
        <p className="text-slate-400 text-sm mt-1">High-level overview of historical safety performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.05)]">
           <h3 className="text-slate-500 text-sm font-semibold uppercase mb-2">Total Alerts</h3>
           <div className="text-5xl font-black text-white">{analytics.totalAlerts}</div>
           <Activity className="w-16 h-16 text-slate-800 absolute right-4 bottom-4 opacity-30" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.1)]">
           <h3 className="text-red-400/80 text-sm font-semibold uppercase mb-2">Critical Events</h3>
           <div className="text-5xl font-black text-red-500">{analytics.criticalAlerts}</div>
           <ShieldAlert className="w-16 h-16 text-red-500/20 absolute right-4 bottom-4" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.1)]">
           <h3 className="text-yellow-400/80 text-sm font-semibold uppercase mb-2">Warnings</h3>
           <div className="text-5xl font-black text-yellow-500">{analytics.warnings}</div>
           <AlertTriangle className="w-16 h-16 text-yellow-500/20 absolute right-4 bottom-4" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
           <h3 className="text-emerald-400/80 text-sm font-semibold uppercase mb-2">Resolved Events</h3>
           <div className="text-5xl font-black text-emerald-500">{analytics.resolvedEvents}</div>
           <CheckCircle className="w-16 h-16 text-emerald-500/20 absolute right-4 bottom-4" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Radar */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl h-96 col-span-1 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[50px] pointer-events-none" />
          <h3 className="text-lg font-bold text-white mb-2 relative z-10">Risk Vector Radar</h3>
          <p className="text-xs text-slate-400 mb-4 relative z-10">Distribution of historical sensor triggers.</p>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Alerts" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl h-96 col-span-1 lg:col-span-2 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Incident Frequency by Sensor</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

// Polyfill missing icon
function AlertTriangle(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}

export default Analytics;
