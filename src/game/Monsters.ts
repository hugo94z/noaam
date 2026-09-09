/**
 * Monsters from the design sketch: Bloup, Goldonax, and Cornog
 */
import * as THREE from 'three';
import { MonsterEntity, Projectile } from '../types';
import { soundFX } from '../audio/SoundFX';

export class MonsterManager {
  public monsters: MonsterEntity[] = [];
  public projectiles: Projectile[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // 1. Bloup: Green slime creature (like a Goomba)
  public createBloup(x: number, y: number, z: number, id: string): MonsterEntity {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Translucent gelatinous green body
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x44bb44,
      transmission: 0.5,
      opacity: 0.95,
      transparent: true,
      roughness: 0.15,
      metalness: 0.1,
      ior: 1.33,
      thickness: 0.8,
    });

    // Jelly dome
    const domeGeo = new THREE.SphereGeometry(0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const dome = new THREE.Mesh(domeGeo, bodyMat);
    dome.position.y = 0.4;
    dome.castShadow = true;
    group.add(dome);

    // Wobbly base skirt
    const skirtGeo = new THREE.CylinderGeometry(0.75, 0.9, 0.4, 16);
    const skirt = new THREE.Mesh(skirtGeo, bodyMat);
    skirt.position.y = 0.2;
    skirt.castShadow = true;
    group.add(skirt);

    // Glowing yellow triangular eyes matching the sketch
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const eyeGeo = new THREE.ConeGeometry(0.16, 0.3, 3);
    eyeGeo.rotateZ(Math.PI);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.24, 0.55, 0.55);
    leftEye.rotation.y = 0.2;

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.24, 0.55, 0.55);
    rightEye.rotation.y = -0.2;

    group.add(leftEye, rightEye);

    // Yellow jagged mouth
    const mouthGeo = new THREE.TorusGeometry(0.25, 0.05, 6, 8, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, eyeMat);
    mouth.position.set(0, 0.35, 0.6);
    mouth.rotation.x = Math.PI / 2;
    group.add(mouth);

    this.scene.add(group);

    const entity: MonsterEntity = {
      id,
      type: 'bloup',
      position: { x, y, z },
      initialPosition: { x, y, z },
      rotation: 0,
      health: 1,
      maxHealth: 1,
      state: 'patrol',
      stateTimer: 0,
      velocity: { x: 0, y: 0, z: 0 },
      attackCooldown: 0,
      mesh: group,
    };

    this.monsters.push(entity);
    return entity;
  }

  // 2. Goldonax: Stationary stone turret that throws boulders
  public createGoldonax(x: number, y: number, z: number, id: string): MonsterEntity {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Rough ancient stone material
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x8d99ae,
      roughness: 0.9,
      metalness: 0.1,
    });

    const darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.85,
    });

    // Fiery glowing red visor/mouth matching the sketch
    const lavaEyeMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    // Feet
    const footGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
    const leftFoot = new THREE.Mesh(footGeo, darkStoneMat);
    leftFoot.position.set(0.6, 0.15, 0);
    const rightFoot = new THREE.Mesh(footGeo, darkStoneMat);
    rightFoot.position.set(-0.6, 0.15, 0);
    group.add(leftFoot, rightFoot);

    // Big round stone body
    const bodyGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const body = new THREE.Mesh(bodyGeo, stoneMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Square stone head with cracks
    const headGeo = new THREE.BoxGeometry(1.1, 0.9, 1.0);
    const head = new THREE.Mesh(headGeo, darkStoneMat);
    head.position.y = 2.4;
    head.castShadow = true;
    group.add(head);

    // Red visor / mouth grill from sketch
    const visorGeo = new THREE.BoxGeometry(0.85, 0.25, 0.2);
    const visor = new THREE.Mesh(visorGeo, lavaEyeMat);
    visor.position.set(0, 2.4, 0.45);
    group.add(visor);

    // Teeth grill bars
    for (let i = -2; i <= 2; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.22), darkStoneMat);
      bar.position.set(i * 0.16, 2.4, 0.46);
      group.add(bar);
    }

    // Horns / crown stones
    const hornGeo = new THREE.ConeGeometry(0.2, 0.5, 5);
    const leftHorn = new THREE.Mesh(hornGeo, darkStoneMat);
    leftHorn.position.set(0.4, 2.95, 0);
    const rightHorn = new THREE.Mesh(hornGeo, darkStoneMat);
    rightHorn.position.set(-0.4, 2.95, 0);
    group.add(leftHorn, rightHorn);

    // Segmented stone arms
    const shoulderGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const leftShoulder = new THREE.Mesh(shoulderGeo, darkStoneMat);
    leftShoulder.position.set(1.1, 1.6, 0);
    const rightShoulder = new THREE.Mesh(shoulderGeo, darkStoneMat);
    rightShoulder.position.set(-1.1, 1.6, 0);

    const fistGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const leftFist = new THREE.Mesh(fistGeo, stoneMat);
    leftFist.position.set(1.3, 1.2, 0.4);
    const rightFist = new THREE.Mesh(fistGeo, stoneMat);
    rightFist.position.set(-1.3, 1.2, 0.4);

    group.add(leftShoulder, rightShoulder, leftFist, rightFist);

    this.scene.add(group);

    const entity: MonsterEntity = {
      id,
      type: 'goldonax',
      position: { x, y, z },
      initialPosition: { x, y, z },
      rotation: 0,
      health: 3,
      maxHealth: 3,
      state: 'idle',
      stateTimer: 0,
      velocity: { x: 0, y: 0, z: 0 },
      attackCooldown: 2.5,
      mesh: group,
    };

    this.monsters.push(entity);
    return entity;
  }

  // 3. Cornog: Purple goblin with spear
  public createCornog(x: number, y: number, z: number, id: string): MonsterEntity {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Purple goblin skin
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x7b2cbf,
      roughness: 0.6,
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.4,
    });

    const spearWoodMat = new THREE.MeshStandardMaterial({
      color: 0x774936,
      roughness: 0.8,
    });

    const spearHeadMat = new THREE.MeshStandardMaterial({
      color: 0xadb5bd,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const body = new THREE.Mesh(bodyGeo, skinMat);
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.15;
    head.castShadow = true;
    group.add(head);

    // Big Pointy Goblin Ears
    const earGeo = new THREE.ConeGeometry(0.18, 0.4, 4);
    earGeo.rotateZ(Math.PI / 2);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(0.4, 1.25, 0);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(-0.4, 1.25, 0);
    rightEar.rotation.z = Math.PI;
    group.add(leftEar, rightEar);

    // Red Headband with bow knot
    const bandGeo = new THREE.TorusGeometry(0.42, 0.06, 6, 16);
    const band = new THREE.Mesh(bandGeo, ribbonMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 1.22;
    group.add(band);

    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.25, 5), ribbonMat);
    knot.position.set(-0.4, 1.35, -0.2);
    knot.rotation.z = -0.5;
    group.add(knot);

    // Yellow fuming eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    leftEye.position.set(0.16, 1.15, 0.34);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    rightEye.position.set(-0.16, 1.15, 0.34);
    group.add(leftEye, rightEye);

    // Large Spear (Attaque avec sa lance)
    const spearGroup = new THREE.Group();
    spearGroup.position.set(0.45, 0.7, 0.1);

    // Wooden shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), spearWoodMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.5;

    // Metal spearhead
    const spearhead = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 4), spearHeadMat);
    spearhead.rotation.x = Math.PI / 2;
    spearhead.position.z = 1.45;
    spearGroup.add(shaft, spearhead);

    group.add(spearGroup);

    // Feet
    const footGeo = new THREE.BoxGeometry(0.28, 0.15, 0.45);
    const leftFoot = new THREE.Mesh(footGeo, skinMat);
    leftFoot.position.set(0.25, 0.08, 0);
    const rightFoot = new THREE.Mesh(footGeo, skinMat);
    rightFoot.position.set(-0.25, 0.08, 0);
    group.add(leftFoot, rightFoot);

    this.scene.add(group);

    const entity: MonsterEntity = {
      id,
      type: 'cornog',
      position: { x, y, z },
      initialPosition: { x, y, z },
      rotation: 0,
      health: 2,
      maxHealth: 2,
      state: 'patrol',
      stateTimer: 0,
      velocity: { x: 0, y: 0, z: 0 },
      attackCooldown: 1.5,
      mesh: group,
    };

    this.monsters.push(entity);
    return entity;
  }

  // Update monster logic, animations, and attacks
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    onPlayerHit: () => void,
    createDebrisParticles: (pos: THREE.Vector3, color: number) => void
  ) {
    // 1. Update existing projectiles (Goldonax boulders)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;
      p.velocity.y -= 18 * delta; // Gravity
      p.position.x += p.velocity.x * delta;
      p.position.y += p.velocity.y * delta;
      p.position.z += p.velocity.z * delta;

      if (p.mesh) {
        p.mesh.position.set(p.position.x, p.position.y, p.position.z);
        p.mesh.rotation.x += delta * 6;
        p.mesh.rotation.y += delta * 4;
      }

      // Hit ground
      if (p.position.y <= 0.4 || p.life <= 0) {
        createDebrisParticles(new THREE.Vector3(p.position.x, p.position.y, p.position.z), 0xdd5500);
        soundFX.playEnemyHit();
        if (p.mesh) {
          this.scene.remove(p.mesh);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check hit player
      const distToPlayer = Math.hypot(
        p.position.x - playerPos.x,
        p.position.y - (playerPos.y + 0.8),
        p.position.z - playerPos.z
      );

      if (distToPlayer < 1.1) {
        onPlayerHit();
        createDebrisParticles(playerPos, 0xff0000);
        if (p.mesh) {
          this.scene.remove(p.mesh);
        }
        this.projectiles.splice(i, 1);
      }
    }

    // 2. Update each monster AI
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (m.state === 'dead') continue;

      m.stateTimer += delta;
      m.attackCooldown -= delta;

      const dx = playerPos.x - m.position.x;
      const dz = playerPos.z - m.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      if (m.type === 'bloup') {
        // Bloup patrol: bounces back and forth like a Goomba
        const patrolSpeed = 2.5;
        const patrolRange = 7.0;
        const offset = Math.sin(m.stateTimer * 1.5) * patrolRange;
        m.position.x = m.initialPosition.x + offset;

        // Wobble squash & stretch animation
        const wobble = Math.sin(m.stateTimer * 8) * 0.15;
        if (m.mesh) {
          m.mesh.position.set(m.position.x, m.position.y, m.position.z);
          m.mesh.scale.set(1 + wobble, 1 - wobble, 1 + wobble);
        }

        // Contact damage if player walks into it without jumping/attacking
        if (distToPlayer < 1.2 && Math.abs(playerPos.y - m.position.y) < 1.2) {
          onPlayerHit();
        }
      } else if (m.type === 'goldonax') {
        // Goldonax: Stationary stone turret, turns to face player and hurls boulders
        if (distToPlayer < 32) {
          const targetAngle = Math.atan2(dx, dz);
          m.rotation = targetAngle;
          if (m.mesh) {
            m.mesh.rotation.y = targetAngle;
          }

          if (m.attackCooldown <= 0) {
            // Throw flaming boulder
            m.attackCooldown = 3.2;
            soundFX.playGoldonaxThrow();

            // Create boulder
            const boulderGeo = new THREE.DodecahedronGeometry(0.5, 1);
            const boulderMat = new THREE.MeshStandardMaterial({
              color: 0x2b2b2b,
              emissive: 0xff3300,
              emissiveIntensity: 0.6,
              roughness: 0.9,
            });
            const boulderMesh = new THREE.Mesh(boulderGeo, boulderMat);
            boulderMesh.castShadow = true;

            const spawnX = m.position.x + Math.sin(targetAngle) * 1.2;
            const spawnY = m.position.y + 2.2;
            const spawnZ = m.position.z + Math.cos(targetAngle) * 1.2;
            boulderMesh.position.set(spawnX, spawnY, spawnZ);
            this.scene.add(boulderMesh);

            // Ballistic arc velocity towards player
            const flightTime = Math.max(0.8, distToPlayer / 16);
            const vx = dx / flightTime;
            const vz = dz / flightTime;
            const vy = (playerPos.y - spawnY) / flightTime + 0.5 * 18 * flightTime;

            this.projectiles.push({
              id: 'proj_' + Math.random(),
              position: { x: spawnX, y: spawnY, z: spawnZ },
              velocity: { x: vx, y: vy, z: vz },
              life: 5.0,
              mesh: boulderMesh,
            });
          }
        }
      } else if (m.type === 'cornog') {
        // Cornog: Charges with spear when player enters detection zone
        if (distToPlayer < 18) {
          const angle = Math.atan2(dx, dz);
          m.rotation = angle;
          if (m.mesh) {
            m.mesh.rotation.y = angle;
          }

          if (m.state === 'patrol') {
            m.state = 'alert';
            m.stateTimer = 0;
            soundFX.playCornogCharge();
          }

          if (m.state === 'alert') {
            // Charge fast with spear
            const chargeSpeed = 9.0;
            m.position.x += Math.sin(angle) * chargeSpeed * delta;
            m.position.z += Math.cos(angle) * chargeSpeed * delta;

            if (m.mesh) {
              m.mesh.position.set(m.position.x, m.position.y, m.position.z);
              // Spear thrust thrusting animation
              const thrust = Math.sin(m.stateTimer * 16) * 0.3;
              m.mesh.children[5].position.z = 0.1 + thrust;
            }

            if (distToPlayer < 1.4 && Math.abs(playerPos.y - m.position.y) < 1.3) {
              onPlayerHit();
            }

            if (m.stateTimer > 4.0) {
              m.state = 'patrol';
              m.stateTimer = 0;
            }
          }
        } else {
          m.state = 'patrol';
        }
      }
    }
  }

  // Damage or defeat monster
  public damageMonster(
    id: string,
    damage: number,
    createParticles: (pos: THREE.Vector3, color: number) => void
  ): boolean {
    const m = this.monsters.find(mon => mon.id === id);
    if (!m || m.state === 'dead') return false;

    m.health -= damage;
    const pos = new THREE.Vector3(m.position.x, m.position.y + 0.6, m.position.z);

    if (m.type === 'bloup') {
      soundFX.playBloupSquash();
      createParticles(pos, 0x44bb44);
    } else if (m.type === 'goldonax') {
      soundFX.playEnemyHit();
      createParticles(pos, 0x8d99ae);
    } else {
      soundFX.playEnemyHit();
      createParticles(pos, 0x7b2cbf);
    }

    if (m.health <= 0) {
      m.state = 'dead';
      if (m.mesh) {
        this.scene.remove(m.mesh);
      }
      return true; // Monster defeated
    }
    return false;
  }
}
