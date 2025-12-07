export interface RockData {
  id: number;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  isActive: boolean;
}

export interface ParticleData {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
}

export enum AppState {
  FROZEN = 'FROZEN',
  AWAKENING = 'AWAKENING',
  RESTORED = 'RESTORED'
}

export interface InsightResponse {
  message: string;
  source: string;
}