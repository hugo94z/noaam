/**
 * Particle and visual FX manager for speed trails, ground pound shockwaves, and debris
 */
import * as THREE from 'three';
import { ParticleEffect } from '../types';

export class ParticleManager {
  private particles: ParticleEffect[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D;
  private readonly maxParticles = 600;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    const geo = new THREE.DodecahedronGeometry(0.18, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    this.instancedMesh = new THREE.InstancedMesh(geo, mat, this.maxParticles);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.dummy = new THREE.Object3D();
    this.scene.add(this.instancedMesh);
  }

  public emit(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: number,
    size: number = 1.0,
    life: number = 0.8
  ) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x,
      y,
      z,
      vx,
      vy,
      vz,
      color,
      size,
      life,
      maxLife: life,
    });
  }

  public burst(pos: THREE.Vector3, color: number, count: number = 16, spread: number = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.2) * Math.PI;
      const speed = Math.random() * spread + 2;
      const vx = Math.cos(angle) * Math.cos(elev) * speed;
      const vy = Math.abs(Math.sin(elev)) * speed + 2;
      const vz = Math.sin(angle) * Math.cos(elev) * speed;
      this.emit(pos.x, pos.y + 0.3, pos.z, vx, vy, vz, color, 1.2, 0.6 + Math.random() * 0.4);
    }
  }

  public emitGroundPoundRing(pos: THREE.Vector3) {
    const ringCount = 28;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 12.0;
      const vx = Math.cos(angle) * speed;
      const vy = 1.2 + Math.random() * 1.5;
      const vz = Math.sin(angle) * speed;
      this.emit(pos.x, pos.y + 0.1, pos.z, vx, vy, vz, 0xffea00, 1.4, 0.7);
    }
  }

  public emitSpeedRibbon(pos: THREE.Vector3, rotation: number, speedRatio: number) {
    if (speedRatio < 0.3) return;
    const count = Math.floor(speedRatio * 3);
    for (let i = 0; i < count; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.6;
      const offsetZ = -0.4;
      const px = pos.x + Math.cos(rotation) * offsetLat;
      const py = pos.y + 0.2 + Math.random() * 0.8;
      const pz = pos.z - Math.sin(rotation) * offsetLat;
      const color = speedRatio > 0.8 ? 0xffb703 : 0x00f5d4;
      this.emit(px, py, pz, (Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5, color, 0.9, 0.35);
    }
  }

  public update(delta: number) {
    let index = 0;
    const colorHelper = new THREE.Color();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.vy -= 9.8 * delta; // particle gravity
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;

      const progress = p.life / p.maxLife;
      const scale = p.size * progress;

      this.dummy.position.set(p.x, p.y, p.z);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(index, this.dummy.matrix);
      colorHelper.setHex(p.color);
      this.instancedMesh.setColorAt(index, colorHelper);

      index++;
    }

    // Hide remaining instances
    for (let i = index; i < this.maxParticles; i++) {
      this.dummy.position.set(0, -9999, 0);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.count = this.maxParticles;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }
}
