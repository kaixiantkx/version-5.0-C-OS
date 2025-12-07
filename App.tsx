import React, { useState, useEffect, useCallback } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { AppState, InsightResponse } from './types';
import { generateAwakeningInsight } from './services/geminiService';

const App: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [lastSmashPos, setLastSmashPos] = useState<{x: number, y: number} | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.FROZEN);
  const [insight, setInsight] = useState<InsightResponse | null>(null);

  const handleProgress = useCallback((newPercent: number, pos: {x: number, y: number} | null) => {
    setProgress(prev => {
      const next = Math.min(100, Math.max(prev, newPercent));
      return next;
    });
    if (pos) setLastSmashPos(pos);
  }, []);

  // Monitor State
  useEffect(() => {
    if (progress >= 99 && appState !== AppState.RESTORED) {
      setAppState(AppState.RESTORED);
      // Trigger Gemini
      generateAwakeningInsight().then(response => {
        setInsight(response);
      });
    } else if (progress > 0 && progress < 99 && appState === AppState.FROZEN) {
      setAppState(AppState.AWAKENING);
    }
  }, [progress, appState]);

  return (
    <div className="relative w-full h-screen bg-black">
      <Experience 
        onProgress={handleProgress} 
        isRestored={appState === AppState.RESTORED}
      />
      <Overlay 
        progress={progress} 
        appState={appState} 
        smashPos={lastSmashPos}
        insight={insight}
      />
    </div>
  );
};

export default App;