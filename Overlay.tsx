import React, { useEffect, useState } from 'react';
import { AppState, InsightResponse } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Sparkles } from 'lucide-react';

interface OverlayProps {
  progress: number;
  appState: AppState;
  smashPos: {x: number, y: number} | null;
  insight: InsightResponse | null;
}

export const Overlay: React.FC<OverlayProps> = ({ progress, appState, smashPos, insight }) => {
  const [showSmash, setShowSmash] = useState(false);

  useEffect(() => {
    if (smashPos) {
      setShowSmash(true);
      const timer = setTimeout(() => setShowSmash(false), 200);
      return () => clearTimeout(timer);
    }
  }, [smashPos]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-widest text-slate-500 uppercase opacity-50">
            {appState === AppState.RESTORED ? 'SYSTEM ONLINE' : 'SYSTEM FROZEN'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${appState === AppState.RESTORED ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
            <p className="text-xs text-slate-400 tracking-wider">
              {appState === AppState.RESTORED 
                ? 'CORE SPINNING // LUMINOSITY RESTORED' 
                : 'THINA-MIDDHA DETECTED // FLICK MOUSE TO BREAK CRUST'}
            </p>
          </div>
        </div>
      </header>

      {/* Smash Effect Text */}
      <AnimatePresence>
        {showSmash && smashPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: smashPos.x, y: smashPos.y }}
            animate={{ opacity: 1, scale: 1.5, x: smashPos.x, y: smashPos.y - 50 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 text-cyan-400 font-black text-6xl italic drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]"
            style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}
          >
            SMASH!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Insight (Restored State) */}
      <AnimatePresence>
        {appState === AppState.RESTORED && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl text-center"
          >
            {insight ? (
              <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-8 rounded-lg shadow-[0_0_50px_rgba(0,242,254,0.1)]">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
                  "{insight.message}"
                </h2>
                <p className="text-cyan-400 tracking-widest text-sm uppercase">— {insight.source}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-cyan-400/50">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm tracking-widest">ANALYZING ENERGY SIGNATURE...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Progress */}
      <footer className="w-full max-w-xl mx-auto">
        <div className="flex justify-between text-xs text-cyan-500 mb-2 uppercase tracking-widest font-bold">
          <span>Core Integrity</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-400 shadow-[0_0_20px_#00f2fe]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        </div>
        
        {appState !== AppState.RESTORED && (
           <p className="text-center mt-4 text-slate-600 text-xs">
             <Zap className="inline w-3 h-3 mr-1" />
             MOVE CURSOR RAPIDLY TO GENERATE KINETIC ENERGY
           </p>
        )}
      </footer>

    </div>
  );
};