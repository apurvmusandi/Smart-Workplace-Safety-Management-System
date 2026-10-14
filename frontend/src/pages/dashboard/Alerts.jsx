import React from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Alerts = () => {
  const { history } = useSocket();

  const activeAlerts = history.filter(h => h.status === 'ACTIVE');
  const recentAlerts = history.filter(h => h.status === 'RESOLVED').slice(0, 10);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="text-cyan-500 w-6 h-6" />
          Alert Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">Real-time view of active and recently resolved safety alerts.</p>
      </div>

      {/* Active Alerts */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Active Alerts ({activeAlerts.length})
        </h3>
        
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="bg-[#0A0F14] border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
              <p>No active alerts. System is secure.</p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-bold text-red-100">{alert.message}</h4>
                    <p className="text-red-400/80 text-sm mt-1">Sensor: <span className="font-semibold text-white">{alert.sensor}</span> | Current Value: <span className="font-mono">{alert.value}</span></p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-mono text-red-400/60 uppercase tracking-widest">Detected</p>
                  <p className="text-sm font-medium text-red-200">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Recent Alerts */}
      <section>
        <h3 className="text-lg font-semibold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recently Resolved
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentAlerts.length === 0 ? (
             <div className="col-span-full p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-500">
               No recent resolved alerts.
             </div>
          ) : (
            recentAlerts.map(alert => (
              <div key={alert.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-800/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-slate-200">{alert.message}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">RESOLVED</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="text-xs text-slate-500">
                    Sensor: {alert.sensor} <br/>
                    <span className="font-mono text-cyan-500/70">{alert.value}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono text-right">
                    Started: {new Date(alert.timestamp).toLocaleTimeString()}<br/>
                    Ended: {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleTimeString() : 'Unknown'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Alerts;
