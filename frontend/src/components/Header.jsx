import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Menu, X } from 'lucide-react';

const Header = ({ isOpen, setIsOpen }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 border-b border-slate-800/50 bg-[#06090D]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
          CONTROL CENTER
        </h1>
      </div>
      
      <div className="flex items-center gap-4 text-right">
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-slate-300 uppercase tracking-widest">
            {format(time, 'EEEE')}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {format(time, 'dd MMMM yyyy')}
          </div>
        </div>
        <div className="text-xl md:text-2xl font-mono text-cyan-400 tracking-tight font-light border-l border-slate-800 pl-4 ml-2">
          {format(time, 'hh:mm:ss a')}
        </div>
      </div>
    </header>
  );
};

export default Header;
