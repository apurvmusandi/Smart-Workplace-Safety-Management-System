import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldAlert, Loader2 } from 'lucide-react';

const BootScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    "Authentication verified",
    "Secure connection established",
    "ESP32 hardware detected",
    "Sensor network initialized",
    "Real-time monitoring enabled",
    "Emergency system ready"
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStep(currentStep + 1);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/app/monitoring');
        }, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-cyan-500 flex flex-col items-center justify-center font-mono p-6 relative overflow-hidden">
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50 opacity-20" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-center mb-10 gap-4">
          <ShieldAlert className="w-12 h-12 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-widest text-white">SYSTEM INITIALIZING</h1>
        </div>

        <div className="space-y-4">
          {steps.map((text, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: index < step ? 1 : 0, x: index < step ? 0 : -20 }}
              className="flex items-center gap-3 text-sm md:text-base"
            >
              {index < step ? (
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0" />
              )}
              <span className={index < step ? "text-cyan-100" : "text-transparent"}>
                {text}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: step > steps.length ? 1 : 0 }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-2 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest rounded shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            SYSTEM ONLINE
          </div>
        </motion.div>
        
        {step <= steps.length && (
          <div className="mt-12 flex justify-center">
             <Loader2 className="w-6 h-6 animate-spin text-cyan-500/50" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BootScreen;
