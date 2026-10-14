import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { Radio, MessageSquare, Phone, Send, Loader2, Power, Settings2, Save, SlidersHorizontal, Users, Edit2 } from 'lucide-react';
import axios from 'axios';

const EmergencyControl = () => {
  const { settings, API_URL } = useSocket();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Local state for forms
  const [formConfig, setFormConfig] = useState({
    adminPhone: settings.adminPhone || '',
    supervisorPhone: settings.supervisorPhone || '',
    thresholdTemp: settings.thresholdTemp || 40,
    thresholdSmoke: settings.thresholdSmoke || 1800,
    thresholdCurrent: settings.thresholdCurrent || 0.35,
  });

  // Sync state if settings change from backend
  React.useEffect(() => {
    setFormConfig({
      adminPhone: settings.adminPhone || '',
      supervisorPhone: settings.supervisorPhone || '',
      thresholdTemp: settings.thresholdTemp || 40,
      thresholdSmoke: settings.thresholdSmoke || 1800,
      thresholdCurrent: settings.thresholdCurrent || 0.35,
    });
  }, [settings]);

  const toggleSetting = async (key) => {
    try {
      await axios.put(`${API_URL}/api/settings`, { [key]: !settings[key] });
    } catch (err) {
      console.error('Failed to update setting', err);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({ ...prev, [name]: value }));
  };

  const saveConfig = async (keysToSave) => {
    if (keysToSave.includes('adminPhone') || keysToSave.includes('supervisorPhone')) {
      const phoneRegex = /^\+[1-9]\d{10,14}$/;
      
      if (formConfig.adminPhone && !phoneRegex.test(formConfig.adminPhone)) {
         alert('Invalid Admin Phone Format. Must start with + and country code (e.g. +918999259299)');
         return;
      }
      if (formConfig.supervisorPhone && !phoneRegex.test(formConfig.supervisorPhone)) {
         alert('Invalid Supervisor Phone Format. Must start with + and country code (e.g. +918999259299)');
         return;
      }
    }

    try {
      const payload = {};
      keysToSave.forEach(key => { payload[key] = formConfig[key]; });
      await axios.put(`${API_URL}/api/settings`, payload);
      if (keysToSave.includes('adminPhone')) {
        setIsEditingPhone(false);
      }
      alert('Configuration Saved Successfully');
    } catch (err) {
      alert('Failed to save configuration');
    }
  };

  const testEmergency = async (type) => {
    if (!settings.simModuleEnabled) {
      alert("SIM800L Module is currently DISABLED. Please power it on first.");
      return;
    }
    if (!settings.adminPhone) {
      alert("Please configure an Admin Phone Number first.");
      return;
    }
    if (!window.confirm(`Are you sure you want to trigger a test ${type} to configured numbers?`)) return;
    
    setLoading(true);
    setTestResult(null);
    try {
      const res = await axios.post(`${API_URL}/api/alerts/test`, { type, phone: settings.adminPhone });
      setTestResult({ success: true, message: res.data.status });
    } catch (err) {
      setTestResult({ success: false, message: 'Failed to send test command' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings2 className="text-cyan-500 w-6 h-6" />
            System Configuration
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage thresholds, contacts, and communication hardware.</p>
        </div>
        
        {/* SIM800L Master Power Toggle */}
        <div className={`flex items-center gap-4 p-3 pr-4 rounded-full border ${settings.simModuleEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <button 
            onClick={() => toggleSetting('simModuleEnabled')}
            className={`p-2 rounded-full transition-all shadow-lg ${settings.simModuleEnabled ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
          >
            <Power className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SIM800L STATUS</span>
            <span className={`font-bold text-sm ${settings.simModuleEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
              {settings.simModuleEnabled ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Sensor Thresholds */}
      <div className="bg-[#0A0F14] border border-slate-800/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
             Dynamic Sensor Thresholds
           </h3>
           <button 
             onClick={() => saveConfig(['thresholdTemp', 'thresholdSmoke', 'thresholdCurrent'])} 
             className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
           >
             <Save className="w-4 h-4" /> Save Thresholds
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-mono text-cyan-500">TEMP THRESHOLD (°C)</label>
              <span className="text-xs text-white font-bold">{formConfig.thresholdTemp}</span>
            </div>
            <input 
              type="range" min="20" max="80" step="1"
              name="thresholdTemp" 
              value={formConfig.thresholdTemp} 
              onChange={handleConfigChange} 
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-mono text-cyan-500">SMOKE THRESHOLD (ADC)</label>
              <span className="text-xs text-white font-bold">{formConfig.thresholdSmoke}</span>
            </div>
            <input 
              type="range" min="500" max="4000" step="100"
              name="thresholdSmoke" 
              value={formConfig.thresholdSmoke} 
              onChange={handleConfigChange} 
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-mono text-cyan-500">CURRENT THRESHOLD (A)</label>
              <span className="text-xs text-white font-bold">{formConfig.thresholdCurrent}</span>
            </div>
            <input 
              type="range" min="0.1" max="2.0" step="0.05"
              name="thresholdCurrent" 
              value={formConfig.thresholdCurrent} 
              onChange={handleConfigChange} 
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1.5: Sensor Enables */}
      <div className="bg-[#0A0F14] border border-slate-800/80 rounded-3xl p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <Power className="w-5 h-5 text-emerald-400" />
          Sensor Status Controls
        </h3>
        <p className="text-sm text-slate-400 mb-6">Disable individual sensors if they are malfunctioning or under maintenance to prevent false alarms.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'enableTemp', label: 'Temperature' },
            { key: 'enableSmoke', label: 'Smoke/Gas' },
            { key: 'enableCurrent', label: 'Current' },
            { key: 'enableFlame', label: 'Flame' },
            { key: 'enableVibration', label: 'Vibration' }
          ].map((sensor) => (
            <div key={sensor.key} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-colors ${settings[sensor.key] !== false ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className="text-xs font-mono font-bold text-center text-slate-300">{sensor.label}</span>
              <button 
                onClick={() => toggleSetting(sensor.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[sensor.key] !== false ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[sensor.key] !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Contact Numbers */}
      <div className="bg-[#0A0F14] border border-slate-800/80 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <Users className="w-5 h-5 text-blue-400" />
             Emergency Contacts
           </h3>
           {isEditingPhone ? (
             <button 
               onClick={() => saveConfig(['adminPhone', 'supervisorPhone'])} 
               className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
             >
               <Save className="w-4 h-4" /> Save Contacts
             </button>
           ) : (
             <button 
               onClick={() => setIsEditingPhone(true)} 
               className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
             >
               <Edit2 className="w-4 h-4" /> Edit Numbers
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-mono text-blue-400 mb-2">ADMIN NUMBER (CALL + SMS)</label>
            {isEditingPhone ? (
              <div>
                <input 
                  type="text" 
                  name="adminPhone" 
                  value={formConfig.adminPhone} 
                  onChange={handleConfigChange} 
                  placeholder="+918999259299" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <div className="mt-2 text-xs text-slate-500">Must include + and country code.</div>
              </div>
            ) : (
              <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className={settings.adminPhone ? "text-emerald-400 font-bold tracking-wider" : "text-slate-600"}>
                  {settings.adminPhone || 'Not Configured'}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">Primary contact. Receives automated calls and critical SMS alerts.</p>
          </div>
          <div>
            <label className="block text-xs font-mono text-blue-400 mb-2">SUPERVISOR NUMBER (SMS ONLY)</label>
            {isEditingPhone ? (
              <div>
                <input 
                  type="text" 
                  name="supervisorPhone" 
                  value={formConfig.supervisorPhone} 
                  onChange={handleConfigChange} 
                  placeholder="+918999259299" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <div className="mt-2 text-xs text-slate-500">Must include + and country code.</div>
              </div>
            ) : (
              <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span className={settings.supervisorPhone ? "text-emerald-400 font-bold tracking-wider" : "text-slate-600"}>
                  {settings.supervisorPhone || 'Not Configured'}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">Secondary contact. Receives informational and warning SMS alerts.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Communication Settings */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${!settings.simModuleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* SMS Toggle */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${settings.smsAlert ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-[#0A0F14] border-slate-800'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${settings.smsAlert ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
              <MessageSquare className="w-8 h-8" />
            </div>
            <button 
              onClick={() => toggleSetting('smsAlert')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${settings.smsAlert ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.smsAlert ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Enable SMS Alerts</h3>
          <p className="text-sm text-slate-400">Allow the system to dispatch automated text messages to configured contacts during emergencies.</p>
        </div>

        {/* CALL Toggle */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${settings.callAlert ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-[#0A0F14] border-slate-800'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${settings.callAlert ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
              <Phone className="w-8 h-8" />
            </div>
            <button 
              onClick={() => toggleSetting('callAlert')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${settings.callAlert ? 'bg-blue-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.callAlert ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Enable Call Alerts</h3>
          <p className="text-sm text-slate-400">Allow the system to automatically initiate an emergency phone call to the Admin on critical danger.</p>
        </div>

      </div>

      {/* SECTION 4: Test Controls */}
      <div className={`bg-slate-900 border border-slate-800/80 rounded-3xl p-8 transition-opacity duration-300 ${!settings.simModuleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-lg font-bold text-white mb-6">Hardware Diagnostics & Testing</h3>
        <p className="text-sm text-slate-400 mb-6">Verify SIM800L communication capabilities. Test messages will be sent to the configured Admin number.</p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => testEmergency('SMS')}
            disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> TEST SMS
          </button>
          <button 
            onClick={() => testEmergency('CALL')}
            disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> TEST CALL
          </button>
        </div>

        {loading && <div className="mt-6 flex items-center gap-2 text-cyan-500"><Loader2 className="animate-spin w-4 h-4"/> Executing command on hardware...</div>}
        
        {testResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`mt-6 p-4 rounded-xl border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
          >
            <span className="font-mono text-sm">{testResult.message}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmergencyControl;
