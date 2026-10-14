import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lightbulb, Target } from 'lucide-react';

const Developers = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-12 pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-cyan-500 w-6 h-6" />
          Project Developers
        </h2>
        <p className="text-slate-400 text-sm mt-1">Meet the team behind the Smart Workplace Safety Management System.</p>
      </div>

      {/* Team Section */}
      <div className="bg-[#0A0F14] border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Project Guide: <span className="text-cyan-400">Miss. Bijal Tayade</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[
            { name: 'Rohan M. Patil', role: 'Hardware/ Software Interfacing', img: '/rohan_pic.jpeg' },
            { name: 'Parshw R. Pomaje', role: 'Hardware Assembly', img: '/parshw_pic.jpeg' },
            { name: 'Vivek R. Patil', role: 'Backend Development', img: '/vivek_pic.png' },
            { name: 'Darshan R. Bandgar', role: 'Frontend Development', img: '/darshan_pic.jpeg' }
          ].map((member, i) => (
            <div key={i} className="group relative p-1 rounded-3xl bg-slate-800/50 hover:bg-gradient-to-b hover:from-cyan-500/30 hover:to-blue-600/30 transition-all duration-300">
              <div className="bg-[#0f151c] rounded-[1.4rem] p-8 text-center h-full flex flex-col items-center justify-center border border-slate-800/80">
                <div className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 mb-4 group-hover:border-cyan-400 transition-colors flex items-center justify-center overflow-hidden shadow-lg">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-xs font-mono">Add Photo</span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white tracking-wide">{member.name}</h4>
                <p className="text-xs text-cyan-500 font-mono mt-1 tracking-wider">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default Developers;
