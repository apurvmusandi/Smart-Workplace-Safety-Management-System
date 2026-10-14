import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, User, ChevronRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('swms_auth', 'true');
      navigate('/boot');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090D] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/40 backdrop-blur-2xl shadow-2xl z-10">
        
        {/* Left Side: Branding */}
        <div className="p-12 hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-black relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div>
            <ShieldAlert className="text-cyan-400 w-12 h-12 mb-6" />
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              SMART<br/>WORKPLACE
            </h2>
            <h3 className="text-xl font-bold text-slate-400 mt-2">SAFETY MANAGEMENT</h3>
          </div>
          
          <div className="mt-12">
            <div className="flex items-center gap-3 text-cyan-500/50 text-sm font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              SYSTEM SECURE
            </div>
            <p className="text-slate-500 text-sm">Industrial Control Center v2.0</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-12 flex flex-col justify-center relative">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 justify-center md:justify-start">
              <Lock className="w-5 h-5 text-slate-400" />
              Admin Access
            </h2>
            <p className="text-slate-400 text-sm mt-2">Secure Administrator Console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center mt-2 font-medium">Invalid username or password</p>
              )}
            </motion.div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              ACCESS SYSTEM
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
