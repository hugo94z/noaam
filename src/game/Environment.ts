/**
 * Dynamic 3D Environment: Sky Dome, Drifting Clouds, Sun Glare & Zone Atmospheres
 */
import * as THREE from 'three';
import { GameZone, ZoneInfo } from '../types';
import { ZONES } from './WorldBuilder';

export class Environment {
  public scene: THREE.Scene;
  public skyMesh: THREE.Mesh;
  public cloudGroup: THREE.Group;
  public sunFlare: THREE.Sprite;
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;
  public horizonMountains: THREE.Group;

  private currentZone: GameZone = 'plaines';
  private targetSkyColor: THREE.Color = new THREE.Color(0x70c1f5);
  private currentSkyColor: THREE.Color = new THREE.Color(0x70c1f5);
  private targetFogColor: THREE.Color = new THREE.Color(0xd6efff);
  private currentFogColor: THREE.Color = new THREE.Color(0xd6efff);
  private targetSunColor: THREE.Color = new THREE.Color(0xfff7e6);
  private currentSunColor: THREE.Color = new THREE.Color(0xfff7e6);
  private targetSunIntensity: number = 1.6;
  private currentSunIntensity: number = 1.6;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Directional Sun Light with high-quality soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 1.6);
    this.sunLight.position.set(45, 75, 35);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 180;
    const shadowDist = 65;
    this.sunLight.shadow.camera.left = -shadowDist;
    this.sunLight.shadow.camera.right = shadowDist;
    this.sunLight.shadow.camera.top = shadowDist;
    this.sunLight.shadow.camera.bottom = -shadowDist;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // 2. Ambient & Hemisphere lighting
    this.ambientLight = new THREE.AmbientLight(0xfffaed, 0.75);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x90e0ef, 0x48cae4, 0.45);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 3. Fog
    this.scene.fog = new THREE.FogExp2(0xd6efff, 0.0065);

    // 4. Procedural Sky Dome
    const skyGeo = new THREE.SphereGeometry(300, 32, 24);
    // Invert geometry so it renders on inside
    skyGeo.scale(-1, 1, 1);

    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 256;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#3a86ff');    // Zenith azure
    grad.addColorStop(0.5, '#70c1f5');  // Mid sky
    grad.addColorStop(0.85, '#d6efff'); // Horizon haze
    grad.addColorStop(1.0, '#e8f4f8');  // Ground blend
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // 5. Stylized Sun Corona / Flare Billboard
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 256;
    flareCanvas.height = 256;
    const flareCtx = flareCanvas.getContext('2d')!;
    const radGrad = flareCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    radGrad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
    radGrad.addColorStop(0.2, 'rgba(255, 230, 120, 0.8)');
    radGrad.addColorStop(0.6, 'rgba(255, 180, 50, 0.25)');
    radGrad.addColorStop(1, 'rgba(255, 120, 20, 0)');
    flareCtx.fillStyle = radGrad;
    flareCtx.fillRect(0, 0, 256, 256);

    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareMat = new THREE.SpriteMaterial({
      map: flareTex,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sunFlare = new THREE.Sprite(flareMat);
    this.sunFlare.scale.set(38, 38, 1);
    this.sunFlare.position.set(120, 180, 90);
    this.scene.add(this.sunFlare);

    // 6. Drifting Volumetric Stylized Clouds
    this.cloudGroup = new THREE.Group();
    this.scene.add(this.cloudGroup);
    this.buildClouds();

    // 7. Scenic Horizon Mountain Silhouettes
    this.horizonMountains = new THREE.Group();
    this.scene.add(this.horizonMountains);
    this.buildHorizon();
  }

  private buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    // Create 18 distinct cloud clusters spread across the world
    for (let c = 0; c < 18; c++) {
      const cluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < numPuffs; p++) {
        const radius = 6 + Math.random() * 6;
        const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (p - numPuffs / 2) * 5 + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 5
        );
        puff.scale.set(1.2, 0.7 + Math.random() * 0.4, 1.0);
        puff.castShadow = false;
        cluster.add(puff);
      }

      // Scatter clouds in wide radius
      const angle = (c / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 60 + Math.random() * 110;
      cluster.position.set(
        Math.cos(angle) * dist,
        35 + Math.random() * 20,
        Math.sin(angle) * dist
      );
      cluster.userData = {
        driftSpeed: 0.8 + Math.random() * 0.7,
        initialY: cluster.position.y,
        floatSeed: Math.random() * 10,
      };

      this.cloudGroup.add(cluster);
    }
  }

  private buildHorizon() {
    // Distant mountain perimeter ring
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x4a5d6e,
      roughness: 0.95,
      flatShading: true,
    });

    const numPeaks = 24;
    for (let i = 0; i < numPeaks; i++) {
      const angle = (i / numPeaks) * Math.PI * 2;
      const dist = 180 + (Math.random() - 0.5) * 20;
      const height = 35 + Math.random() * 30;
      const radius = 25 + Math.random() * 18;

      const peakGeo = new THREE.ConeGeometry(radius, height, 5);
      const peak = new THREE.Mesh(peakGeo, mountainMat);
      peak.position.set(Math.cos(angle) * dist, height / 2 - 10, Math.sin(angle) * dist);
      peak.rotation.y = Math.random() * Math.PI;
      this.horizonMountains.add(peak);
    }
  }

  public setZone(zone: GameZone) {
    if (this.currentZone === zone) return;
    this.currentZone = zone;
    const info: ZoneInfo = ZONES[zone] || ZONES.plaines;

    this.targetSkyColor.setHex(info.skyColor);
    this.targetFogColor.setHex(info.fogColor);
    this.targetSunColor.setHex(info.sunColor);

    if (zone === 'lave') {
      this.targetSunIntensity = 1.1;
    } else if (zone === 'neiges') {
      this.targetSunIntensity = 1.8;
    } else if (zone === 'plages') {
      this.targetSunIntensity = 1.9;
    } else {
      this.targetSunIntensity = 1.6;
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // Smooth atmosphere transition between biomes
    const lerpSpeed = Math.min(1.0, delta * 2.0);
    this.currentSkyColor.lerp(this.targetSkyColor, lerpSpeed);
    this.currentFogColor.lerp(this.targetFogColor, lerpSpeed);
    this.currentSunColor.lerp(this.targetSunColor, lerpSpeed);
    this.currentSunIntensity += (this.targetSunIntensity - this.currentSunIntensity) * lerpSpeed;

    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(this.currentFogColor);
      // Extra volcanic haze in lava zone
      const targetDensity = this.currentZone === 'lave' ? 0.009 : 0.0065;
      this.scene.fog.density += (targetDensity - this.scene.fog.density) * lerpSpeed;
    }

    this.sunLight.color.copy(this.currentSunColor);
    this.sunLight.intensity = this.currentSunIntensity;

    // Follow player with sky & sun position
    this.skyMesh.position.set(playerPos.x, playerPos.y - 40, playerPos.z);
    this.sunLight.position.set(playerPos.x + 45, playerPos.y + 75, playerPos.z + 35);
    this.sunLight.target.position.copy(playerPos);
    this.sunFlare.position.set(playerPos.x + 120, playerPos.y + 180, playerPos.z + 90);

    // Slowly drift clouds across the sky
    const time = performance.now() * 0.001;
    this.cloudGroup.children.forEach(cloud => {
      const data = cloud.userData;
      cloud.position.x += data.driftSpeed * delta * 2.2;
      // Gentle bobbing
      cloud.position.y = data.initialY + Math.sin(time * 0.5 + data.floatSeed) * 1.5;

      // Wrap clouds around world boundary
      if (cloud.position.x > playerPos.x + 140) {
        cloud.position.x = playerPos.x - 140;
      }
    });
  }
}
