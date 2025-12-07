import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Planet } from './Planet';
import { PerspectiveCamera } from '@react-three/drei';

interface ExperienceProps {
  onProgress: (percent: number, lastSmashPos: {x: number, y: number} | null) => void;
  isRestored: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ onProgress, isRestored }) => {
  return (
    <Canvas 
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 18]} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00f2fe" distance={10} decay={2} />
      
      {/* The Game Object */}
      <Planet onProgress={onProgress} isRestored={isRestored} />
      
      {/* Post Processing for Aesthetics */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={isRestored ? 2.0 : 0.8} 
            radius={0.5}
        />
        <Noise opacity={0.1} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};