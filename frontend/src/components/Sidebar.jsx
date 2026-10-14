import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, History, Bell, BarChart2, Radio, Settings, ShieldAlert, LogOut, Menu, X, Users, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { connected } = useSocket();

  const navItems = [
    { name: 'Live Monitoring', path: '/app/monitoring', icon: Activity },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'Alerts', path: '/app/alerts', icon: Bell },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart2 },
    { name: 'Emergency Control', path: '/app/emergency', icon: Radio },
    { name: 'About Project', path: '/app/about', icon: Info },
    { name: 'Developers', path: '/app/developers', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('swms_auth');
    navigate('/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#0A0F14] border-slate-800/80 transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0 ${isOpen ? 'w-64 translate-x-0 border-r' : 'w-0 -translate-x-full lg:translate-x-0 border-r-0'}`}>
        
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50">
          <ShieldAlert className="text-cyan-500 w-8 h-8" />
          <div>
            <h2 className="text-white font-bold tracking-wider leading-tight">SWMS</h2>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
              {connected ? 'Connected' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink to="/app/monitoring" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Activity className="w-5 h-5" /> Live Monitoring
          </NavLink>
          <NavLink to="/app/history" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <History className="w-5 h-5" /> History & Logs
          </NavLink>
          <NavLink to="/app/alerts" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Bell className="w-5 h-5" /> Alerts
          </NavLink>
          <NavLink to="/app/analytics" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <BarChart2 className="w-5 h-5" /> Analytics
          </NavLink>
          <NavLink to="/app/diagnostics" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <ShieldAlert className="w-5 h-5" /> Diagnostics & Map
          </NavLink>
          <NavLink to="/app/emergency" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Settings className="w-5 h-5" /> System Config.
          </NavLink>
          <NavLink to="/app/about" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Info className="w-5 h-5" /> About Project
          </NavLink>
          <NavLink to="/app/developers" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Users className="w-5 h-5" /> Developers
          </NavLink>
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase">Admin</p>
              <p className="text-sm font-semibold text-white">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
