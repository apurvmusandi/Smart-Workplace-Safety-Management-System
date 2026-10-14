import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { History as HistoryIcon, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const History = () => {
  const { history } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(event => 
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.sensor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="text-cyan-500 w-6 h-6" />
            Event History
          </h2>
          <p className="text-slate-400 text-sm mt-1">Complete log of all safety events and alerts.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#0A0F14] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Sensor</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No history events found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                      {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{event.sensor}</td>
                    <td className="px-6 py-4">{event.message}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400">{event.value}</td>
                    <td className="px-6 py-4 font-mono opacity-70">{event.threshold}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        event.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        event.severity === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          RESOLVED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default History;
