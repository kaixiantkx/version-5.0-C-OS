import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Color, Mesh, Group, Vector2 } from 'three';
import { RockData, ParticleData } from '../types';
import { Sparkles, Html } from '@react-three/drei';

interface PlanetProps {
  onProgress: (percent: number, lastSmashPos: {x: number, y: number} | null) => void;
  isRestored: boolean;
}

// Helper to distribute points on a sphere
const getFibonacciSpherePoints = (samples: number, radius: number) => {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push(new Vector3(x * radius, y * radius, z * radius));
  }
  return points;
};

export const Planet: React.FC<PlanetProps> = ({ onProgress, isRestored }) => {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  
  // State
  const [rocks, setRocks] = useState<RockData[]>([]);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  
  // Physics tracking
  const mouseVelocity = useRef(0);
  const lastMousePos = useRef(new Vector2(0, 0));
  const lastTime = useRef(0);
  const rotationSpeed = useRef(0);
  const { viewport } = useThree();

  // Initialization
  useEffect(() => {
    const rockCount = 150;
    const radius = 3.5;
    const points = getFibonacciSpherePoints(rockCount, radius);
    
    const initialRocks: RockData[] = points.map((pos, i) => ({
      id: i,
      position: [pos.x, pos.y, pos.z],
      scale: 0.8 + Math.random() * 0.5,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      isActive: true,
    }));
    
    setRocks(initialRocks);
  }, []);

  // Main Loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const delta = state.clock.getDelta(); // Frame time

    // 1. Calculate Mouse Velocity
    const currentMouse = new Vector2(state.pointer.x, state.pointer.y);
    const dist = currentMouse.distanceTo(lastMousePos.current);
    // Speed = distance / time (simplified scaling)
    const instantSpeed = dist * 50; 
    
    // Smooth velocity
    mouseVelocity.current = mouseVelocity.current * 0.8 + instantSpeed * 0.2;
    lastMousePos.current.copy(currentMouse);

    // 2. Rotate Planet
    // Base rotation + added momentum from breaking rocks
    if (groupRef.current) {
      // Natural decay of momentum
      rotationSpeed.current = Math.max(0.001, rotationSpeed.current * 0.98);
      
      // If restored, keep a healthy spin
      const minSpeed = isRestored ? 0.01 : 0.0005;
      const actualSpeed = Math.max(minSpeed, rotationSpeed.current);

      groupRef.current.rotation.y += actualSpeed;
      groupRef.current.rotation.x += actualSpeed * 0.3;
    }

    // 3. Pulse Core
    if (coreRef.current) {
        // Pulse intensity based on rotation speed (energy)
        const energy = Math.min(rotationSpeed.current * 20, 1.5);
        const baseScale = isRestored ? 3.2 : 3.0;
        const pulse = Math.sin(time * (2 + energy * 5)) * 0.05;
        coreRef.current.scale.setScalar(baseScale + pulse);
        
        // Color shift logic handled in material prop
    }

    // 4. Update Particles
    if (particles.length > 0) {
      setParticles(prev => prev.map(p => ({
        ...p,
        position: [
          p.position[0] + p.velocity[0] * delta,
          p.position[1] + p.velocity[1] * delta, // Anti-gravity up
          p.position[2] + p.velocity[2] * delta
        ],
        life: p.life - 0.02
      })).filter(p => p.life > 0));
    }
  });

  const handleRockHover = (id: number, position: [number, number, number], normal: Vector3, e: any) => {
    // Only break if moving fast enough (Viriya threshold)
    if (mouseVelocity.current > 0.8) {
      e.stopPropagation(); // Only hit the top rock
      breakRock(id, position, normal);
      
      // Screen space position for UI text
      const screenX = (e.point.x * viewport.factor) / 2 + window.innerWidth / 2;
      const screenY = -(e.point.y * viewport.factor) / 2 + window.innerHeight / 2; // inverted Y
      onProgress(calculateProgress() + (100/150), { x: e.clientX, y: e.clientY }); 
    }
  };

  const calculateProgress = () => {
    const active = rocks.filter(r => r.isActive).length;
    return 100 - (active / rocks.length * 100);
  };

  const breakRock = (id: number, pos: [number, number, number], normal: Vector3) => {
    setRocks(prev => prev.map(r => r.id === id ? { ...r, isActive: false } : r));
    
    // Add rotational momentum
    rotationSpeed.current += 0.02;

    // Spawn Particles
    const newParticles: ParticleData[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random().toString(),
        position: pos,
        velocity: [
          (Math.random() - 0.5) * 2 + normal.x, 
          Math.random() * 3 + normal.y, // Strong Upward bias (Anti-gravity)
          (Math.random() - 0.5) * 2 + normal.z
        ],
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  return (
    <group ref={groupRef}>
      {/* INNER CORE - The Mind */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial 
          color={isRestored ? "#00ffff" : "#0088aa"} 
          emissive={isRestored ? "#00ffff" : "#004455"}
          emissiveIntensity={isRestored ? 2 : 0.5 + rotationSpeed.current * 5}
          wireframe={!isRestored}
          transparent
          opacity={isRestored ? 0.9 : 0.4}
        />
      </mesh>

      {/* ROCKS - The Crust (Thina-middha) */}
      {rocks.map((rock) => (
        rock.isActive && (
          <mesh 
            key={rock.id}
            position={rock.position}
            rotation={rock.rotation}
            scale={rock.scale}
            onPointerOver={(e) => {
                // Calculate normal roughly from center
                const normal = new Vector3(...rock.position).normalize();
                handleRockHover(rock.id, rock.position, normal, e);
            }}
          >
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial 
              color="#333333" 
              roughness={0.9} 
              metalness={0.1}
            />
          </mesh>
        )
      ))}

      {/* PARTICLES - Passaddhi (Tranquility/Lightness) */}
      {particles.map(p => (
         <mesh key={p.id} position={new Vector3(...p.position)}>
           <boxGeometry args={[0.1, 0.1, 0.1]} />
           <meshBasicMaterial 
             color="#00f2fe" 
             transparent 
             opacity={p.life} 
           />
         </mesh>
      ))}
      
      {/* Ambient particles when restored */}
      {isRestored && (
        <Sparkles count={50} scale={12} size={4} speed={0.4} opacity={0.5} color="#00f2fe" />
      )}
    </group>
  );
};