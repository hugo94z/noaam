/**
 * Procedural 3D World Builder containing the 6 zones from Image 1:
 * Plaines, Plages, Neiges, Montagnes, Roches Noir & Lave, Zone Aquatique
 * Plus the interactive Finish Line Switch from Image 2.
 */
import * as THREE from 'three';
import {
  createGrassTexture,
  createSandTexture,
  createSnowTexture,
  createRockTexture,
  createVolcanicLavaTexture,
  createFinishPlateEmblemTexture,
} from '../graphics/textures';
import { CollectibleGem, FinishPlate, GameZone, ZoneInfo } from '../types';

export const ZONES: Record<GameZone, ZoneInfo> = {
  plaines: {
    id: 'plaines',
    name: 'Les Plaines Verdoyantes',
    description: 'De vastes plaines d\'herbe parsemées d\'arbres et de fleurs idéales pour prendre de la vitesse !',
    skyColor: 0x87ceeb,
    fogColor: 0xc8e6c9,
    groundColor: 0x4caf50,
    accentColor: '#4ade80',
    ambientLight: 0xffffff,
    sunColor: 0xfffaed,
  },
  plages: {
    id: 'plages',
    name: 'Plage Turquoise & Palmiers',
    description: 'Sable doré fin et lagons éclatants avec des pontons de vitesse.',
    skyColor: 0x70d6ff,
    fogColor: 0xbbf2f6,
    groundColor: 0xe9c46a,
    accentColor: '#38bdf8',
    ambientLight: 0xffffff,
    sunColor: 0xfff3b0,
  },
  neiges: {
    id: 'neiges',
    name: 'Pics Enneigés & Bonhomme 8',
    description: 'Glisse sur la neige poudreuse et admire le Bonhomme de neige !',
    skyColor: 0x90e0ef,
    fogColor: 0xe2eafc,
    groundColor: 0xedf2f4,
    accentColor: '#60a5fa',
    ambientLight: 0xffffff,
    sunColor: 0xe0f2fe,
  },
  montagnes: {
    id: 'montagnes',
    name: 'Crêtes Montagneuses & Parkour',
    description: 'Passages rocheux abrupts et ponts suspendus pour tester le triple saut.',
    skyColor: 0x6c757d,
    fogColor: 0xced4da,
    groundColor: 0x495057,
    accentColor: '#a8a29e',
    ambientLight: 0xffeedd,
    sunColor: 0xffffff,
  },
  lave: {
    id: 'lave',
    name: 'Roches Noires & Lave Ardente',
    description: 'Basalte volcanique sombre et rivières de magma en fusion incandescentes.',
    skyColor: 0x2b0908,
    fogColor: 0x3d0c02,
    groundColor: 0x1f1a17,
    accentColor: '#f97316',
    ambientLight: 0xffaa77,
    sunColor: 0xff4500,
  },
  aquatique: {
    id: 'aquatique',
    name: 'Zone Aquatique & Cascades',
    description: 'Lacs limpides, nénuphars géants et plateformes flottantes où faire flotter Noam.',
    skyColor: 0x0077b6,
    fogColor: 0x90e0ef,
    groundColor: 0x0096c7,
    accentColor: '#06b6d4',
    ambientLight: 0xdff8ff,
    sunColor: 0xffffff,
  },
};

export class WorldBuilder {
  public scene: THREE.Scene;
  public collisionObjects: THREE.Object3D[] = [];
  public gems: CollectibleGem[] = [];
  public finishPlate!: FinishPlate;
  public springPads: THREE.Mesh[] = [];
  public waterMesh?: THREE.Mesh;
  public lavaMesh?: THREE.Mesh;
  private animTime: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildWorld() {
    // 1. Textures
    const grassTex = createGrassTexture();
    const sandTex = createSandTexture();
    const snowTex = createSnowTexture();
    const rockTex = createRockTexture();
    const lavaTex = createVolcanicLavaTexture();

    // 2. Base Central Hub & Terrain Biomes (arranged according to Image 1 sketch)
    // Hub (Center: 0, 0, 0)
    this.createBiomeSector(0, 0, 0, 36, grassTex, 0x5a9e32);
    this.createGrassTufts(0, 0, 0, 25, 26);

    // Plaines (South: Z > 20)
    this.createBiomeSector(0, 0, 45, 50, grassTex, 0x497e29, 'plaines');
    this.populatePlains(0, 0, 45);

    // Plages (South-East: X > 25, Z > 10)
    this.createBiomeSector(50, -0.4, 25, 45, sandTex, 0xd9b46f, 'plages');
    this.populateBeach(50, -0.4, 25);

    // Neiges (North-East: X > 25, Z < -15)
    this.createBiomeSector(50, 2.5, -35, 45, snowTex, 0xe8f0fa, 'neiges');
    this.populateSnow(50, 2.5, -35);

    // Montagnes (North: Z < -30)
    this.createBiomeSector(0, 5.0, -55, 45, rockTex, 0x4a4d52, 'montagnes');
    this.populateMountains(0, 5.0, -55);

    // Roches Noir & Lave (North-West: X < -25, Z < -15)
    this.createBiomeSector(-50, 1.2, -35, 45, lavaTex, 0x1c1514, 'lave');
    this.populateLava(-50, 1.2, -35);

    // Zone Aquatique (West: X < -30, Z > 15)
    this.createBiomeSector(-50, -0.6, 25, 45, grassTex, 0x3d7b42, 'aquatique');
    this.populateWaterZone(-50, -0.6, 25);

    // 3. Connective bridges & pathways between biomes
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 45), rockTex);
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(50, -0.4, 25), sandTex);
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(50, 2.5, -35), snowTex);
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5.0, -55), rockTex);
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-50, 1.2, -35), rockTex);
    this.createPath(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-50, -0.6, 25), rockTex);

    // 4. Spring Pads for high flying parkour
    this.createSpringPad(12, 0.2, 18);
    this.createSpringPad(-18, 0.2, 12);
    this.createSpringPad(24, 0.2, -20);
    this.createSpringPad(-24, 1.4, -26);

    // 5. Speed Gems scattered along the zones
    this.spawnGems();

    // 6. Finish Line Platform (Ligne d'Arrivée) located at the mountain summit / central goal
    this.buildFinishPlatform(0, 9.5, -78);
  }

  private createBiomeSector(
    x: number,
    y: number,
    z: number,
    radius: number,
    texture: THREE.Texture,
    tintColor: number,
    _zoneId?: GameZone
  ) {
    const geo = new THREE.CylinderGeometry(radius, radius + 2, 4, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      color: tintColor,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y - 2, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.collisionObjects.push(mesh);
  }

  private createPath(start: THREE.Vector3, end: THREE.Vector3, texture: THREE.Texture) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const geo = new THREE.BoxGeometry(6, 0.6, length);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
    });
    const pathMesh = new THREE.Mesh(geo, mat);
    pathMesh.position.set(mid.x, mid.y - 0.2, mid.z);
    pathMesh.lookAt(end.x, mid.y - 0.2, end.z);
    pathMesh.receiveShadow = true;
    this.scene.add(pathMesh);
    this.collisionObjects.push(pathMesh);
  }

  private populatePlains(cx: number, cy: number, cz: number) {
    // Trees
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 12 + Math.random() * 20;
      const tx = cx + Math.cos(angle) * dist;
      const tz = cz + Math.sin(angle) * dist;
      this.createTree(tx, cy, tz);
    }

    // Wooden Speed Ramps
    this.createSpeedRamp(cx + 8, cy, cz + 10, 0);
    this.createSpeedRamp(cx - 8, cy, cz + 20, Math.PI / 4);

    // 3D Grass Tufts across the field
    this.createGrassTufts(cx, cy, cz, 45, 42);

    // Detailed Wildflower patches
    for (let i = 0; i < 22; i++) {
      const fx = cx + (Math.random() - 0.5) * 38;
      const fz = cz + (Math.random() - 0.5) * 38;
      this.createFlowerPatch(fx, cy, fz);
    }
  }

  private populateBeach(cx: number, cy: number, cz: number) {
    // Palm trees
    for (let i = 0; i < 8; i++) {
      const px = cx + (Math.random() - 0.5) * 28;
      const pz = cz + (Math.random() - 0.5) * 28;
      this.createPalmTree(px, cy, pz);
    }

    // Wooden pier / jetty
    const pierGeo = new THREE.BoxGeometry(5, 0.5, 24);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(cx + 10, cy + 0.3, cz);
    pier.receiveShadow = true;
    pier.castShadow = true;
    this.scene.add(pier);
    this.collisionObjects.push(pier);

    // Turquoise animated water plane
    const waterGeo = new THREE.PlaneGeometry(80, 80, 24, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00b4d8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(cx + 25, cy - 0.2, cz);
    this.scene.add(this.waterMesh);
  }

  private populateSnow(cx: number, cy: number, cz: number) {
    // Snowman with 8-shape body from Image 1 sketch!
    this.createSnowman(cx + 6, cy, cz + 6);
    this.createSnowman(cx - 10, cy, cz - 10);

    // Pine trees with snow caps
    for (let i = 0; i < 10; i++) {
      const px = cx + (Math.random() - 0.5) * 30;
      const pz = cz + (Math.random() - 0.5) * 30;
      this.createPineTree(px, cy, pz);
    }

    // Ice crystal platforms (floating parkour jumps)
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.CylinderGeometry(2.5, 3.0, 0.8, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xbbdefb,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const plat = new THREE.Mesh(geo, mat);
      plat.position.set(cx - 12 + i * 7, cy + 2 + i * 1.5, cz - 5 + (i % 2) * 5);
      plat.castShadow = true;
      plat.receiveShadow = true;
      this.scene.add(plat);
      this.collisionObjects.push(plat);
    }
  }

  private populateMountains(cx: number, cy: number, cz: number) {
    // Craggy mountain peaks
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.ConeGeometry(8 + i * 2, 16 + i * 4, 5);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.9 });
      const peak = new THREE.Mesh(geo, mat);
      peak.position.set(cx + (i - 2.5) * 12, cy + 6 + i, cz - 15 - i * 3);
      peak.castShadow = true;
      this.scene.add(peak);
    }

    // Suspension bridge / cliff platforms for triple jumps
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(4.5, 0.6, 6.0);
      const mat = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.8 });
      const platform = new THREE.Mesh(geo, mat);
      platform.position.set(cx + (i % 2 === 0 ? 6 : -6), cy + 1 + i * 2.2, cz + 10 - i * 7);
      platform.castShadow = true;
      platform.receiveShadow = true;
      this.scene.add(platform);
      this.collisionObjects.push(platform);
    }
  }

  private populateLava(cx: number, cy: number, cz: number) {
    // Obsidian basalt columns
    for (let i = 0; i < 12; i++) {
      const height = 4 + Math.random() * 8;
      const geo = new THREE.CylinderGeometry(1.4, 1.8, height, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x181313,
        roughness: 0.6,
        metalness: 0.4,
      });
      const column = new THREE.Mesh(geo, mat);
      const lx = cx + (Math.random() - 0.5) * 32;
      const lz = cz + (Math.random() - 0.5) * 32;
      column.position.set(lx, cy + height / 2 - 1, lz);
      column.castShadow = true;
      column.receiveShadow = true;
      this.scene.add(column);
      this.collisionObjects.push(column);
    }

    // Bubbling molten lava river plane
    const lavaGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff4400,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    });
    this.lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    this.lavaMesh.rotation.x = -Math.PI / 2;
    this.lavaMesh.position.set(cx, cy - 0.3, cz);
    this.scene.add(this.lavaMesh);

    // Floating volcanic stepping stones across lava
    for (let i = 0; i < 4; i++) {
      const stoneGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.8, 8);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x221c1a, roughness: 0.9 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(cx - 6 + i * 5, cy + 0.3, cz - 4 + (i % 2) * 5);
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.scene.add(stone);
      this.collisionObjects.push(stone);
    }
  }

  private populateWaterZone(cx: number, cy: number, cz: number) {
    // Water basin
    const lakeGeo = new THREE.CylinderGeometry(18, 18, 0.4, 32);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0096c7,
      transmission: 0.6,
      opacity: 0.9,
      transparent: true,
      roughness: 0.05,
      metalness: 0.2,
      ior: 1.33,
    });
    const lake = new THREE.Mesh(lakeGeo, waterMat);
    lake.position.set(cx, cy + 0.1, cz);
    this.scene.add(lake);

    // Giant floating lily pads for water parkour
    for (let i = 0; i < 6; i++) {
      const lilyGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.25, 16);
      const lilyMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.7 });
      const lily = new THREE.Mesh(lilyGeo, lilyMat);
      const angle = (i / 6) * Math.PI * 2;
      lily.position.set(cx + Math.cos(angle) * 10, cy + 0.25, cz + Math.sin(angle) * 10);
      lily.receiveShadow = true;
      this.scene.add(lily);
      this.collisionObjects.push(lily);

      // Lotus flower
      const flowerGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const flowerMat = new THREE.MeshStandardMaterial({ color: 0xff758f });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(0, 0.3, 0);
      lily.add(flower);
    }
  }

  // Snowman matching the "8" shape sketch in Image 1
  private createSnowman(x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const coalMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff7b00 });
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xe63946 });

    // Bottom sphere
    const bottom = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), snowMat);
    bottom.position.y = 1.0;
    bottom.castShadow = true;

    // Top sphere (forms the '8')
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), snowMat);
    head.position.y = 2.4;
    head.castShadow = true;

    // Carrot nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 8), carrotMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 2.4, 0.85);

    // Coal eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), coalMat);
    leftEye.position.set(0.25, 2.55, 0.72);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), coalMat);
    rightEye.position.set(-0.25, 2.55, 0.72);

    // Scarf
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.12, 8, 16), scarfMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.8;

    group.add(bottom, head, nose, leftEye, rightEye, scarf);
    this.scene.add(group);
    this.collisionObjects.push(bottom);
  }

  private createTree(x: number, y: number, z: number) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.9 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.7 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8), trunkMat);
    trunk.position.set(x, y + 1.75, z);
    trunk.castShadow = true;

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), leavesMat);
    foliage.position.set(x, y + 4.2, z);
    foliage.castShadow = true;

    this.scene.add(trunk, foliage);
    this.collisionObjects.push(trunk);
  }

  private createPalmTree(x: number, y: number, z: number) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.6 });

    // Curved trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5, 8), trunkMat);
    trunk.position.set(x, y + 2.5, z);
    trunk.rotation.z = 0.15;
    trunk.castShadow = true;

    // Palm fronds
    const crown = new THREE.Group();
    crown.position.set(x + 0.6, y + 5.0, z);

    for (let i = 0; i < 6; i++) {
      const frondGeo = new THREE.ConeGeometry(0.8, 3.5, 4);
      frondGeo.rotateX(Math.PI / 2.8);
      const frond = new THREE.Mesh(frondGeo, leafMat);
      frond.rotation.y = (i / 6) * Math.PI * 2;
      crown.add(frond);
    }

    this.scene.add(trunk, crown);
    this.collisionObjects.push(trunk);
  }

  private createPineTree(x: number, y: number, z: number) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.7 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.5, 8), trunkMat);
    trunk.position.set(x, y + 1.25, z);

    const layer1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.5, 7), pineMat);
    layer1.position.set(x, y + 3.0, z);
    const layer2 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 7), pineMat);
    layer2.position.set(x, y + 4.5, z);

    this.scene.add(trunk, layer1, layer2);
    this.collisionObjects.push(trunk);
  }

  public createGrassTufts(cx: number, cy: number, cz: number, count: number = 35, spread: number = 35) {
    const bladeGeo = new THREE.ConeGeometry(0.06, 0.42, 3);
    bladeGeo.translate(0, 0.21, 0);
    const grassMat1 = new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.8, flatShading: true });
    const grassMat2 = new THREE.MeshStandardMaterial({ color: 0x74c69d, roughness: 0.8, flatShading: true });

    for (let i = 0; i < count; i++) {
      const tuft = new THREE.Group();
      const tx = cx + (Math.random() - 0.5) * spread;
      const tz = cz + (Math.random() - 0.5) * spread;
      tuft.position.set(tx, cy, tz);

      const bladesInTuft = 4 + Math.floor(Math.random() * 4);
      for (let b = 0; b < bladesInTuft; b++) {
        const blade = new THREE.Mesh(bladeGeo, b % 2 === 0 ? grassMat1 : grassMat2);
        blade.rotation.y = (b / bladesInTuft) * Math.PI * 2;
        blade.rotation.z = (Math.random() - 0.5) * 0.45;
        blade.rotation.x = (Math.random() - 0.5) * 0.45;
        const s = 0.75 + Math.random() * 0.5;
        blade.scale.set(s, s, s);
        tuft.add(blade);
      }
      this.scene.add(tuft);
    }
  }

  private createFlowerPatch(x: number, y: number, z: number) {
    const colors = [0xff4d6d, 0xffd166, 0x06d6a0, 0x8338ec, 0xf72585];
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 4);
    stemGeo.translate(0, 0.14, 0);

    for (let i = 0; i < 6; i++) {
      const flower = new THREE.Group();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const petMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      flower.add(stem);

      const petal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), petMat);
      petal.position.set(0, 0.28, 0);
      flower.add(petal);

      // Center yellow core
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), coreMat);
      core.position.set(0, 0.32, 0);
      flower.add(core);

      flower.position.set(x + (Math.random() - 0.5) * 2.0, y, z + (Math.random() - 0.5) * 2.0);
      flower.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(flower);
    }
  }

  private createSpeedRamp(x: number, y: number, z: number, rotationY: number) {
    const rampGeo = new THREE.BoxGeometry(4, 1.2, 6);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.5 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(x, y + 0.3, z);
    ramp.rotation.x = -0.25;
    ramp.rotation.y = rotationY;
    ramp.receiveShadow = true;
    ramp.castShadow = true;
    this.scene.add(ramp);
    this.collisionObjects.push(ramp);
  }

  public createSpringPad(x: number, y: number, z: number) {
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, y, z);

    const padGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.25, 16);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0033,
      emissiveIntensity: 0.4,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(x, y + 0.3, z);
    pad.userData = { isSpringPad: true };

    this.scene.add(base, pad);
    this.springPads.push(pad);
    this.collisionObjects.push(pad);
  }

  // 5. Finish Line Platform matching Image 2 sketch:
  // "Ligne d'arrivée : Vue de côté -> Appuyé"
  private buildFinishPlatform(x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Outer stone/metal pedestal
    const pedestalGeo = new THREE.CylinderGeometry(4.5, 5.0, 1.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x495057,
      metalness: 0.5,
      roughness: 0.4,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.6;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Inner bevel collar (outer ring in sketch)
    const collarGeo = new THREE.TorusGeometry(3.6, 0.35, 16, 32);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xced4da,
      metalness: 0.9,
      roughness: 0.2,
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.25;
    group.add(collar);

    // Center circular button / stamp with star emblem ("Appuyé")
    const emblemTex = createFinishPlateEmblemTexture();
    const buttonGeo = new THREE.CylinderGeometry(3.4, 3.4, 0.8, 32);
    const buttonMat = new THREE.MeshStandardMaterial({
      map: emblemTex,
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    });
    const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
    buttonMesh.position.y = 1.2;
    buttonMesh.receiveShadow = true;
    group.add(buttonMesh);

    // Golden goal beacon light
    const beaconLight = new THREE.PointLight(0xffd166, 2.5, 30);
    beaconLight.position.set(0, 3, 0);
    group.add(beaconLight);

    this.scene.add(group);
    this.collisionObjects.push(pedestal);

    this.finishPlate = {
      position: { x, y: y + 1.2, z },
      isPressed: false,
      pressDepth: 0,
      mesh: group,
      buttonMesh,
    };
  }

  private spawnGems() {
    // Array of parkour points across the map
    const points = [
      { x: 0, y: 1.5, z: 12 },
      { x: 0, y: 2.2, z: 24 },
      { x: 0, y: 1.5, z: 36 },
      { x: 12, y: 4.5, z: 18 }, // above spring
      { x: 25, y: 1.5, z: 15 },
      { x: 45, y: 1.2, z: 25 },
      { x: 55, y: 2.5, z: 15 },
      { x: 35, y: 4.0, z: -10 },
      { x: 50, y: 5.5, z: -30 },
      { x: -18, y: 5.0, z: 12 }, // above spring
      { x: -35, y: 1.5, z: 25 },
      { x: -50, y: 2.0, z: 30 },
      { x: -24, y: 5.5, z: -26 },
      { x: -45, y: 3.5, z: -35 },
      { x: 0, y: 7.5, z: -40 },
      { x: 6, y: 9.0, z: -55 },
      { x: -6, y: 11.0, z: -65 },
      { x: 0, y: 13.0, z: -75 },
    ];

    const gemGeo = new THREE.OctahedronGeometry(0.55, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00bbf9,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
    });

    points.forEach((pt, idx) => {
      const mesh = new THREE.Mesh(gemGeo, gemMat);
      mesh.position.set(pt.x, pt.y, pt.z);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.gems.push({
        id: 'gem_' + idx,
        position: pt,
        collected: false,
        mesh,
      });
    });
  }

  public update(delta: number) {
    this.animTime += delta;

    // Rotate and bob gems
    this.gems.forEach((gem, i) => {
      if (!gem.collected && gem.mesh) {
        gem.mesh.rotation.y += delta * 2.5;
        gem.mesh.position.y = gem.position.y + Math.sin(this.animTime * 3 + i) * 0.25;
      }
    });

    // Lava glow pulse
    if (this.lavaMesh) {
      const pulse = 0.7 + Math.sin(this.animTime * 2.5) * 0.3;
      (this.lavaMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }

    // Animated water gentle wave swell
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.2 + Math.sin(this.animTime * 1.8) * 0.06;
      this.waterMesh.rotation.z = Math.sin(this.animTime * 0.7) * 0.01;
    }

    // Finish plate press animation
    if (this.finishPlate.isPressed && this.finishPlate.buttonMesh) {
      if (this.finishPlate.pressDepth < 0.6) {
        this.finishPlate.pressDepth += delta * 3.0;
        this.finishPlate.buttonMesh.position.y = 1.2 - this.finishPlate.pressDepth;
      }
    }
  }
}
