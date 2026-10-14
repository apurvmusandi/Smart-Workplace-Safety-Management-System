import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Cpu, Radio, Server, MonitorSmartphone, Zap, ShieldCheck } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-12 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center relative py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 relative z-10">
          ABOUT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PROJECT</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base relative z-10">
          Discover the mission, vision, and cutting-edge architecture powering the Smart Workplace Safety Management System.
        </p>
      </motion.div>

      {/* Goal & Intention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0A0F14] to-[#0d141c] border border-slate-800/80 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Target className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Project Goal</h3>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              Industrial environments are inherently dangerous, prone to catastrophic accidents like chemical leaks, sudden fires, and electrical faults. 
              Traditional systems rely heavily on manual intervention or localized alarms that are easily missed in noisy factories.
              <br /><br />
              Our core objective is to build an <span className="text-cyan-400 font-semibold">automated IoT ecosystem</span> that eliminates human delay. By fusing multi-sensor edge processing with a dynamic web dashboard and cellular redundancy, we ensure critical alerts reach stakeholders instantly—saving lives and mitigating massive property damage.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-bl from-[#0A0F14] to-[#0d141c] border border-slate-800/80 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Core Intention</h3>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              We intend to deliver an industrial-grade safety net that is robust, modular, and fail-safe. 
              The system is designed with redundancy in mind: if the factory Wi-Fi drops during an emergency, the system automatically falls back to the GSM network via SIM800L to guarantee alert delivery.
              <br /><br />
              Beyond simple alarms, we aim to provide <span className="text-blue-400 font-semibold">actionable intelligence</span>. The centralized dashboard provides historical data analytics and live telemetry, allowing administrators to predict failures before they happen and optimize workplace safety continuously.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Architecture Section */}
      <motion.div variants={itemVariants} className="mt-16 pt-16 border-t border-slate-800/50 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Lightbulb className="w-6 h-6 text-emerald-400" /> System Architecture
          </h2>
          <p className="text-slate-400 text-sm">How the hardware and software layers communicate in real-time.</p>
        </div>

        {/* Animated Architecture Diagram */}
        <div className="relative bg-[#0A0F14] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl overflow-hidden min-h-[400px] flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Animated Background Gradients */}
          <motion.div 
            animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ x: [100, -100, 100], y: [50, -50, 50] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[80px]"
          />

          {/* Block 1: Hardware Edge */}
          <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-1/3 bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Edge Layer</h4>
            <p className="text-xs text-slate-400 mb-4">ESP32 & Arduino UNO</p>
            <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono text-cyan-300">
              <span className="px-2 py-1 bg-cyan-500/10 rounded-full">MQ Sensor</span>
              <span className="px-2 py-1 bg-cyan-500/10 rounded-full">DHT22</span>
              <span className="px-2 py-1 bg-cyan-500/10 rounded-full">Flame</span>
              <span className="px-2 py-1 bg-cyan-500/10 rounded-full">SIM800L</span>
            </div>
          </motion.div>

          {/* Connection Arrows 1 */}
          <div className="hidden md:flex flex-col items-center justify-center w-32 relative z-10">
            <div className="h-[2px] w-full bg-slate-700 relative overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '300%'] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-1/3 h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 uppercase">HTTP / UART</span>
          </div>

          {/* Block 2: Backend */}
          <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-1/3 bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Server className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Core Server</h4>
            <p className="text-xs text-slate-400 mb-4">Node.js, Express & SQLite</p>
            <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono text-indigo-300">
              <span className="px-2 py-1 bg-indigo-500/10 rounded-full">REST APIs</span>
              <span className="px-2 py-1 bg-indigo-500/10 rounded-full">Socket.io</span>
              <span className="px-2 py-1 bg-indigo-500/10 rounded-full">DB Engine</span>
            </div>
          </motion.div>

          {/* Connection Arrows 2 */}
          <div className="hidden md:flex flex-col items-center justify-center w-32 relative z-10">
            <div className="h-[2px] w-full bg-slate-700 relative overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '300%'] }} 
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-1/3 h-full bg-indigo-400 shadow-[0_0_10px_#818cf8]"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 uppercase">WebSockets</span>
          </div>

          {/* Block 3: Frontend */}
          <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-1/3 bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <MonitorSmartphone className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Client Dashboard</h4>
            <p className="text-xs text-slate-400 mb-4">React & Tailwind CSS</p>
            <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono text-blue-300">
              <span className="px-2 py-1 bg-blue-500/10 rounded-full">Live UI</span>
              <span className="px-2 py-1 bg-blue-500/10 rounded-full">Charts</span>
              <span className="px-2 py-1 bg-blue-500/10 rounded-full">Admin Tools</span>
            </div>
          </motion.div>
          
        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;
