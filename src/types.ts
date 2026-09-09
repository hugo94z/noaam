/**
 * Noam Speeder - Type definitions and interfaces
 */

export type GameZone = 
  | 'plaines'
  | 'plages'
  | 'neiges'
  | 'montagnes'
  | 'lave'
  | 'aquatique';

export interface ZoneInfo {
  id: GameZone;
  name: string;
  description: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  accentColor: string;
  ambientLight: number;
  sunColor: number;
}

export type PlayerActionState =
  | 'idle'
  | 'running'
  | 'sprinting'
  | 'jumping1'
  | 'jumping2'
  | 'tripleJump'
  | 'fluttering'
  | 'crouching'
  | 'backflipping'
  | 'groundPounding'
  | 'groundPoundLanded'
  | 'punching'
  | 'airJumping'
  | 'hurt';

export interface PlayerStats {
  speed: number;          // Current forward speed (m/s)
  maxSpeed: number;       // Dynamic max speed limit (~32 m/s)
  health: number;         // 100 max
  maxHealth: number;
  energy: number;         // 100 max (for flutter/air dash)
  maxEnergy: number;
  gemsCollected: number;
  monstersDefeated: number;
  currentZone: GameZone;
  topSpeedReached: number;
  timeElapsed: number;
  isFinished: boolean;
  score: number;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  crouch: boolean;
  flutter: boolean;
  punch: boolean;
  punchJustPressed: boolean;
  groundPound: boolean;
  cameraRotateX: number;
  cameraRotateY: number;
}

export interface MonsterEntity {
  id: string;
  type: 'bloup' | 'goldonax' | 'cornog';
  position: { x: number; y: number; z: number };
  initialPosition: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  maxHealth: number;
  state: 'idle' | 'patrol' | 'alert' | 'attack' | 'dead';
  stateTimer: number;
  velocity: { x: number; y: number; z: number };
  attackCooldown: number;
  mesh?: any;
}

export interface Projectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  mesh?: any;
}

export interface ParticleEffect {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: number;
  size: number;
  life: number;
  maxLife: number;
}

export interface CollectibleGem {
  id: string;
  position: { x: number; y: number; z: number };
  collected: boolean;
  mesh?: any;
}

export interface FinishPlate {
  position: { x: number; y: number; z: number };
  isPressed: boolean;
  pressDepth: number;
  mesh?: any;
  buttonMesh?: any;
}
