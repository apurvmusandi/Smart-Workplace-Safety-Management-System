import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Radio, Cpu, Bell, ShieldAlert, Cpu as Microchip, Zap, Wind, Droplets, ThermometerSun } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  // Smooth scroll handler
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#06090D] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-800/50 bg-[#06090D]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">SWMS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollTo('hero')} className="hover:text-cyan-400 transition-colors">Overview</button>
            <button onClick={() => scrollTo('hardware')} className="hover:text-cyan-400 transition-colors">Hardware</button>
            <button onClick={() => scrollTo('features')} className="hover:text-cyan-400 transition-colors">Features</button>
            <button onClick={() => scrollTo('team')} className="hover:text-cyan-400 transition-colors">Team</button>
          </div>

          {/* Empty div to keep flex space if we moved the button, or keep a small login here too */}
          <div className="w-24"></div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-10 px-6 min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 mt-2 bg-gradient-to-r from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent">
              SMART WORKPLACE <br /> SAFETY MANAGEMENT
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-6">
              Intelligent real-time monitoring and emergency response <br className="hidden md:block" />
              for safer, smarter industrial environments.
            </p>

            <div className="flex justify-center mb-2">
              <button
                onClick={() => navigate('/login')}
                className="group relative px-8 py-4 rounded-full overflow-hidden bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105"
              >
                ACCESS ADMIN CONSOLE
              </button>
            </div>
          </motion.div>

          {/* Animated Hero Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="relative mx-auto max-w-4xl py-12 flex items-center justify-center overflow-hidden mt-8"
          >
            {/* Background glowing rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 border border-cyan-500/30 rounded-full border-t-cyan-400" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-80 h-80 border border-blue-500/20 rounded-full border-b-blue-400" />
            </div>

            <div className="flex items-center gap-4 md:gap-16 relative z-10">
              {/* Sensors Node */}
              <div className="flex flex-col items-center gap-3">
                <motion.div 
                  animate={{ y: [-5, 5, -5] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  <Activity className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
                </motion.div>
                <span className="text-xs font-mono text-cyan-500/80 tracking-widest">SENSORS</span>
              </div>
              
              {/* Connection Line 1 */}
              <div className="w-12 md:w-32 h-[2px] bg-gradient-to-r from-cyan-500/10 via-cyan-500 to-cyan-500/10 relative">
                <motion.div 
                  animate={{ x: [0, 100, 0] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                  className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] top-1/2 -translate-y-1/2" 
                />
              </div>

              {/* Central Core */}
              <div className="flex flex-col items-center gap-3 relative">
                {/* Ping rings */}
                <span className="absolute w-full h-full rounded-full bg-cyan-500/20 animate-ping" />
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-2 border-slate-700 shadow-[0_0_40px_rgba(59,130,246,0.3)] relative z-10 cursor-pointer"
                >
                  <Cpu className="w-12 h-12 md:w-14 md:h-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </motion.div>
                <span className="text-sm font-bold font-mono text-white tracking-widest mt-2">ESP32 CORE</span>
              </div>

              {/* Connection Line 2 */}
              <div className="w-12 md:w-32 h-[2px] bg-gradient-to-r from-blue-500/10 via-blue-500 to-blue-500/10 relative">
                <motion.div 
                  animate={{ x: [0, 100, 0] }} 
                  transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                  className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] top-1/2 -translate-y-1/2" 
                />
              </div>

              {/* Response Node */}
              <div className="flex flex-col items-center gap-3">
                <motion.div 
                  animate={{ y: [5, -5, 5] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  <Radio className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                </motion.div>
                <span className="text-xs font-mono text-blue-500/80 tracking-widest">RESPONSE</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hardware Components Section */}
      <section id="hardware" className="py-24 bg-black px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-3">Hardware Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Powered By Reliable Components</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Microchip, name: 'ESP32', desc: 'Main Controller' },
              { icon: Radio, name: 'SIM800L', desc: 'GSM Network' },
              { icon: ThermometerSun, name: 'DHT22', desc: 'Temp & Humidity' },
              { icon: Wind, name: 'MQ Sensor', desc: 'Gas & Smoke' },
              { icon: ShieldAlert, name: 'Flame Sensor', desc: 'Fire Detection' },
              { icon: Zap, name: 'ACS712', desc: 'Current Monitor' },
            ].map((comp, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center hover:border-blue-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <comp.icon className="text-slate-300 w-6 h-6" />
                </div>
                <h4 className="font-bold text-white mb-1">{comp.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{comp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#0A0F14] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-cyan-500 uppercase mb-3">Engineered for Safety</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Advanced Industrial Monitoring</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: 'Real-Time Monitoring', desc: 'Continuously monitor environmental and operational conditions.' },
              { icon: Shield, title: 'Intelligent Alerts', desc: 'Detect dangerous conditions and instantly trigger local alarms.' },
              { icon: Bell, title: 'Emergency SMS', desc: 'Automated SMS dispatch through integrated SIM800L modules.' },
              { icon: Radio, title: 'Live Dashboard', desc: 'Monitor all sensor telemetry remotely via WebSocket connections.' },
              { icon: Cpu, title: 'Local Safety Logic', desc: 'ESP32 continues hardware safety monitoring even without network.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <f.icon className="text-cyan-400 w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{f.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 px-6 border-t border-slate-800/50 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Project Guide: <span className="text-cyan-400">Miss. Bijal Tayade</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Rohan M. Patil', role: 'Hardware/ Software Interfacing', img: '/rohan_pic.jpeg' },
              { name: 'Parshw R. Pomaje', role: 'Hardware Assembly', img: '/parshw_pic.jpeg' },
              { name: 'Vivek R. Patil', role: 'Backend Development', img: '/vivek_pic.png' },
              { name: 'Darshan R. Bandgar', role: 'Frontend Development', img: '/darshan_pic.jpeg' }
            ].map((member, i) => (
              <div key={i} className="group relative p-1 rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-900 hover:from-cyan-500/50 hover:to-blue-600/50 transition-all duration-300 shadow-xl">
                <div className="bg-[#0A0F14] rounded-[1.8rem] p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-slate-800 border-4 border-slate-700 mb-6 group-hover:border-cyan-400 transition-colors flex items-center justify-center overflow-hidden shadow-lg">
                    {member.img ? (
                      <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 text-sm font-mono">Add Photo</span>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-white tracking-wide">{member.name}</h4>
                  <p className="text-sm text-cyan-500 font-mono mt-2 tracking-wider">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#06090D] py-12 border-t border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <p className="text-slate-400 font-medium mb-4">
            Developed with <span className="text-red-500 animate-pulse">❤️</span> by <span className="text-cyan-400 font-bold">SITIANS (CSE Batch 2027)</span>
          </p>
          <p className="text-slate-500 text-sm">
            Smart Workplace Safety Management <br />
            <span className="text-xs opacity-70">IoT • Real-Time Monitoring • Emergency Response</span><br />
            <span className="text-xs opacity-50 mt-4 block font-mono">© 2026 SWMS. All rights reserved.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
