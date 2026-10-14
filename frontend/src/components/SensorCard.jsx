import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const SensorCard = ({ title, value, unit, status, icon: Icon, threshold, dataKey, chartData, enabled = true, themeColor = 'emerald' }) => {
  
  // Status styling
  let statusStyle = 'text-slate-400 bg-slate-800 border-slate-700';
  let dotColor = 'bg-slate-500';
  let chartColor = '#64748b';
  let displayStatus = status;
  
  if (!enabled) {
    statusStyle = 'text-slate-500 bg-slate-900/50 border-slate-800/50 opacity-50';
    dotColor = 'bg-slate-700';
    displayStatus = 'DISABLED';
  } else {
    if (status === 'SAFE' || status === 'NORMAL') {
      // Base distinct color for normal state
      statusStyle = `text-${themeColor}-400 bg-${themeColor}-500/10 border-${themeColor}-500/20`;
      dotColor = 'bg-emerald-500 shadow-[0_0_8px_#10b981]'; // Always green dot when safe
      chartColor = themeColor === 'cyan' ? '#22d3ee' : themeColor === 'blue' ? '#3b82f6' : themeColor === 'indigo' ? '#6366f1' : themeColor === 'purple' ? '#a855f7' : '#10b981';
    } else if (status === 'WARNING') {
      statusStyle = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      dotColor = 'bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]';
      chartColor = '#eab308';
    } else if (status === 'DANGER' || status === 'DETECTED') {
      statusStyle = 'text-red-400 bg-red-500/10 border-red-500/20';
      dotColor = 'bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]';
      chartColor = '#ef4444';
    }
  }

  // Value formatting
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
  const isNumeric = typeof value === 'number';

  // Calculate percentage for progress bar (0 to threshold * 1.2)
  let percentage = 0;
  if (isNumeric && threshold) {
    const maxVal = parseFloat(threshold) * 1.2;
    percentage = Math.min((value / maxVal) * 100, 100);
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`relative flex flex-col p-6 rounded-2xl border ${statusStyle} shadow-lg backdrop-blur-md overflow-hidden group transition-colors`}
    >
      {/* Background Glow on Danger */}
      {(status === 'DANGER' || status === 'DETECTED') && (
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold tracking-widest uppercase opacity-80 flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          LIVE
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-4 relative z-10">
        <span className="text-4xl font-black tracking-tighter">
          {enabled ? displayValue : '--'}
        </span>
        {unit && enabled && <span className="text-lg font-medium opacity-70">{unit}</span>}
      </div>

      {/* Mini Sparkline Chart */}
      <div className="h-16 w-full mb-4 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        {chartData && chartData.length > 0 && isNumeric ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={chartColor} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center text-xs opacity-50 font-mono">
            {isNumeric ? 'Collecting data...' : 'Binary state sensor'}
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="mt-auto relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/30 border border-white/10">
            {displayStatus}
          </span>
          <span className="text-xs font-mono opacity-60">
            {threshold ? `Thr: ${threshold} ${unit || ''}` : ''}
          </span>
        </div>
        
        {/* Threshold visual indicator */}
        {isNumeric && threshold && (
          <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1 relative">
            <div 
              className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%`, backgroundColor: chartColor }}
            />
            {/* Threshold Marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10" 
              style={{ left: `${(parseFloat(threshold) / (parseFloat(threshold) * 1.2)) * 100}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SensorCard;
