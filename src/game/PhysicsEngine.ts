/**
 * Physics and movement engine implementing the exact mechanics from Image 1:
 * - Momentum acceleration (de plus en plus rapide avec limite)
 * - Triple Saut (Jump 1, Jump 2, Jump 3)
 * - Flutter / Hover 1 sec (Yoshi / Pac Man style)
 * - Crouch + Jump = BACKFLIP
 * - Ground Pound
 * - Melee Punch attack
 * - Air Jump
 */
import * as THREE from 'three';
import { InputState, PlayerActionState, PlayerStats, GameZone } from '../types';
import { soundFX } from '../audio/SoundFX';
import { WorldBuilder } from './WorldBuilder';
import { MonsterManager } from './Monsters';

export class PhysicsEngine {
  public position: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotation: number = 0; // facing angle
  public state: PlayerActionState = 'idle';

  // Momentum & Speed constants
  public currentSpeed: number = 0;
  public readonly baseSpeed: number = 11;
  public readonly maxSpeedLimit: number = 32; // Limit from design document
  public readonly accelRate: number = 9.5;    // Accelerates smoothly
  public readonly decelRate: number = 18;

  // Jump parameters
  public isGrounded: boolean = false;
  public jumpCount: number = 0; // 0, 1, 2, 3
  public landingTimer: number = 0; // Window to chain triple jump
  public readonly tripleJumpWindow: number = 0.38;

  // Flutter / Hover parameters
  public flutterTimer: number = 0;
  public readonly maxFlutterDuration: number = 1.0; // "Bouton pour flotter pendant 1 sec"
  public hasUsedFlutter: boolean = false;

  // Air jump
  public hasUsedAirJump: boolean = false;

  // Backflip
  public backflipRotation: number = 0;

  // Ground pound
  public groundPoundPhase: 'none' | 'windup' | 'fall' = 'none';
  public groundPoundTimer: number = 0;

  // Punch attack
  public punchTimer: number = 0;

  // Stats
  public stats: PlayerStats = {
    speed: 0,
    maxSpeed: 32,
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    gemsCollected: 0,
    monstersDefeated: 0,
    currentZone: 'plaines',
    topSpeedReached: 0,
    timeElapsed: 0,
    isFinished: false,
    score: 0,
  };

  private world: WorldBuilder;
  private monsters: MonsterManager;
  private downRaycaster: THREE.Raycaster;
  private forwardRaycaster: THREE.Raycaster;

  constructor(world: WorldBuilder, monsters: MonsterManager) {
    this.world = world;
    this.monsters = monsters;
    this.downRaycaster = new THREE.Raycaster();
    this.downRaycaster.far = 2.2;
    this.forwardRaycaster = new THREE.Raycaster();
    this.forwardRaycaster.far = 1.2;
  }

  public reset(spawnPos: THREE.Vector3 = new THREE.Vector3(0, 2, 0)) {
    this.position.copy(spawnPos);
    this.velocity.set(0, 0, 0);
    this.currentSpeed = 0;
    this.jumpCount = 0;
    this.landingTimer = 0;
    this.flutterTimer = 0;
    this.hasUsedFlutter = false;
    this.hasUsedAirJump = false;
    this.groundPoundPhase = 'none';
    this.state = 'idle';
    this.stats.health = 100;
    this.stats.energy = 100;
    this.stats.isFinished = false;
  }

  public update(
    delta: number,
    input: InputState,
    cameraAngleY: number,
    onScreenShake: (intensity: number) => void,
    onParticleBurst: (pos: THREE.Vector3, color: number, count: number) => void
  ) {
    if (this.stats.isFinished) {
      // Finished state
      this.currentSpeed *= 0.9;
      return;
    }

    this.stats.timeElapsed += delta;

    // 1. Determine Current Zone based on player coordinates
    this.updateCurrentZone();

    // 2. Ground collision check via raycast downwards
    this.downRaycaster.set(
      new THREE.Vector3(this.position.x, this.position.y + 0.8, this.position.z),
      new THREE.Vector3(0, -1, 0)
    );
    const groundHits = this.downRaycaster.intersectObjects(this.world.collisionObjects, true);

    let groundY = -999;
    let hitObject: THREE.Object3D | null = null;
    if (groundHits.length > 0) {
      groundY = groundHits[0].point.y;
      hitObject = groundHits[0].object;
    }

    const wasGrounded = this.isGrounded;
    this.isGrounded = this.position.y <= groundY + 0.1 && this.velocity.y <= 0.1;

    if (this.isGrounded) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.hasUsedFlutter = false;
      this.hasUsedAirJump = false;
      this.flutterTimer = 0;

      // Check spring pad hit
      if (hitObject && hitObject.userData?.isSpringPad) {
        this.velocity.y = 28;
        this.isGrounded = false;
        this.state = 'tripleJump';
        soundFX.playJump(3);
        onParticleBurst(this.position, 0xff0055, 20);
      }

      // Landing from Ground Pound!
      if (this.groundPoundPhase === 'fall') {
        this.groundPoundPhase = 'none';
        this.state = 'groundPoundLanded';
        soundFX.playGroundPoundImpact();
        onScreenShake(1.2);
        onParticleBurst(this.position, 0xffd166, 35);

        // Check if landed on finish plate!
        this.checkFinishPlate(true);

        // Damage nearby monsters with ground pound shockwave
        this.monsters.monsters.forEach(m => {
          const dist = Math.hypot(m.position.x - this.position.x, m.position.z - this.position.z);
          if (dist < 6.5) {
            const defeated = this.monsters.damageMonster(m.id, 3, (p, c) => onParticleBurst(p, c, 15));
            if (defeated) this.stats.monstersDefeated++;
          }
        });
      }

      // Check if stepped on finish plate
      this.checkFinishPlate(false);

      // Landing timer for Triple Jump chain
      if (!wasGrounded) {
        this.landingTimer = this.tripleJumpWindow;
      } else {
        this.landingTimer = Math.max(0, this.landingTimer - delta);
        if (this.landingTimer <= 0 && this.state !== 'crouching') {
          this.jumpCount = 0;
        }
      }
    } else {
      // Airborne gravity
      if (this.state === 'fluttering') {
        // Reduced floating gravity during Yoshi-style flutter
        this.velocity.y = -1.2;
      } else if (this.groundPoundPhase === 'windup') {
        // Hang in air momentarily before slam
        this.velocity.y = 0;
      } else if (this.groundPoundPhase === 'fall') {
        // Ultra fast vertical rocket descent
        this.velocity.y = -36;
      } else {
        this.velocity.y -= 32 * delta; // standard snappy platformer gravity
      }
    }

    // 3. Movement input & Momentum calculation (Déplacement de plus en plus rapide)
    let moveX = 0;
    let moveZ = 0;
    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    const hasInput = moveX !== 0 || moveZ !== 0;

    if (hasInput && this.groundPoundPhase === 'none') {
      // Camera relative direction
      const inputAngle = Math.atan2(moveX, moveZ);
      const targetAngle = cameraAngleY + inputAngle;

      // Smooth rotation toward movement direction
      let diff = targetAngle - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += diff * Math.min(1.0, 16 * delta);

      // Accelerate: "Déplacement de plus en plus rapide (Mais avec une limite)"
      if (this.currentSpeed < this.baseSpeed) {
        this.currentSpeed += this.accelRate * 2.5 * delta;
      } else if (this.currentSpeed < this.maxSpeedLimit) {
        this.currentSpeed += this.accelRate * delta;
      }
      this.currentSpeed = Math.min(this.currentSpeed, this.maxSpeedLimit);

      // Footsteps
      if (this.isGrounded) {
        soundFX.playFootstep(this.currentSpeed / this.maxSpeedLimit);
      }
    } else {
      // Decelerate with friction
      this.currentSpeed = Math.max(0, this.currentSpeed - this.decelRate * delta);
    }

    // 4. Punch Attack action (Single punch execution)
    if (input.punchJustPressed && this.punchTimer <= 0 && this.groundPoundPhase === 'none') {
      this.punchTimer = 0.3;
      this.state = 'punching';
      soundFX.playPunch();

      // Check hit monsters in front of Noam
      const forwardVec = new THREE.Vector3(Math.sin(this.rotation), 0, Math.cos(this.rotation));
      this.monsters.monsters.forEach(m => {
        const dx = m.position.x - this.position.x;
        const dz = m.position.z - this.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 3.2) {
          const dirToMon = new THREE.Vector3(dx, 0, dz).normalize();
          const dot = forwardVec.dot(dirToMon);
          if (dot > 0.3) {
            // Direct Hit!
            const defeated = this.monsters.damageMonster(m.id, 2, (p, c) => onParticleBurst(p, c, 20));
            if (defeated) this.stats.monstersDefeated++;
            soundFX.playEnemyHit();
            onScreenShake(0.45);
          }
        }
      });
    }

    if (this.punchTimer > 0) {
      this.punchTimer -= delta;
      if (this.punchTimer <= 0) {
        this.punchTimer = 0;
        if (this.state === 'punching') {
          this.state = this.isGrounded
            ? this.currentSpeed > 20
              ? 'sprinting'
              : this.currentSpeed > 0.5
              ? 'running'
              : 'idle'
            : 'airJumping';
        }
      }
    }

    // 5. Ground Pound Action
    if (!this.isGrounded && input.groundPound && this.groundPoundPhase === 'none') {
      this.groundPoundPhase = 'windup';
      this.groundPoundTimer = 0.2;
      this.state = 'groundPounding';
      soundFX.playGroundPoundLaunch();
    }

    if (this.groundPoundPhase === 'windup') {
      this.groundPoundTimer -= delta;
      if (this.groundPoundTimer <= 0) {
        this.groundPoundPhase = 'fall';
      }
    }

    // 6. Flutter / Hover 1 sec (Bouton pour flotter pendant 1 sec)
    if (!this.isGrounded && input.flutter && !this.hasUsedFlutter && this.groundPoundPhase === 'none') {
      if (this.flutterTimer < this.maxFlutterDuration) {
        if (this.flutterTimer === 0) {
          soundFX.playFlutter();
        }
        this.flutterTimer += delta;
        this.state = 'fluttering';
        // Spawn hover dust
        if (Math.random() > 0.4) {
          onParticleBurst(
            new THREE.Vector3(this.position.x, this.position.y + 0.1, this.position.z),
            0x00f5d4,
            2
          );
        }
      } else {
        this.hasUsedFlutter = true;
      }
    }

    // 7. Jump Mechanics
    if (input.jumpJustPressed) {
      if (this.isGrounded) {
        // ACCROUPI + SAUT = BACKFLIP
        if (input.crouch) {
          this.state = 'backflipping';
          this.velocity.y = 19.5; // High jump
          this.currentSpeed = 10;
          this.rotation += Math.PI; // Face opposite
          this.isGrounded = false;
          soundFX.playBackflip();
          onParticleBurst(this.position, 0x00bbf9, 15);
        } else {
          // TRIPLE SAUT (Triple Jump: 1 -> 2 -> 3)
          if (this.landingTimer > 0 && this.currentSpeed > 7) {
            this.jumpCount++;
            if (this.jumpCount > 3) this.jumpCount = 3;
          } else {
            this.jumpCount = 1;
          }

          if (this.jumpCount === 1) {
            this.velocity.y = 13.5;
            this.state = 'jumping1';
            soundFX.playJump(1);
          } else if (this.jumpCount === 2) {
            this.velocity.y = 17.0;
            this.state = 'jumping2';
            soundFX.playJump(2);
            onParticleBurst(this.position, 0x48cae4, 10);
          } else {
            // Triple Jump max height!
            this.velocity.y = 23.5;
            this.state = 'tripleJump';
            soundFX.playJump(3);
            onParticleBurst(this.position, 0xffb703, 25);
            this.jumpCount = 0; // Reset after peak
          }
          this.isGrounded = false;
        }
      } else {
        // AUSSI, LE POUVOIR DE FAIRE UN SAUT DANS LES AIRS (Air Jump)
        if (!this.hasUsedAirJump && this.groundPoundPhase === 'none') {
          this.hasUsedAirJump = true;
          this.velocity.y = 14.0;
          this.state = 'airJumping';
          soundFX.playJump(2);
          onParticleBurst(this.position, 0xffea00, 12);
        }
      }
    }

    // Crouching and ground locomotion state
    const isCurrentlyPunching = this.punchTimer > 0;
    if (this.isGrounded && input.crouch && !isCurrentlyPunching) {
      this.state = 'crouching';
      this.currentSpeed *= 0.5; // Slow crawl
    } else if (this.isGrounded && !isCurrentlyPunching) {
      if (this.currentSpeed > 20) {
        this.state = 'sprinting';
      } else if (this.currentSpeed > 0.5) {
        this.state = 'running';
      } else {
        this.state = 'idle';
      }
    }

    // Apply horizontal velocity
    const vx = Math.sin(this.rotation) * this.currentSpeed;
    const vz = Math.cos(this.rotation) * this.currentSpeed;

    this.velocity.x = vx;
    this.velocity.z = vz;

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Check Gem pickups
    this.world.gems.forEach(gem => {
      if (!gem.collected) {
        const d = Math.hypot(
          gem.position.x - this.position.x,
          gem.position.y - (this.position.y + 0.8),
          gem.position.z - this.position.z
        );
        if (d < 1.6) {
          gem.collected = true;
          if (gem.mesh) this.world.scene.remove(gem.mesh);
          this.stats.gemsCollected++;
          this.stats.score += 150;
          soundFX.playGemCollect();
          onParticleBurst(this.position, 0x00f5d4, 15);
        }
      }
    });

    // Void / Fall safety check
    if (this.position.y < -12) {
      // Respawn at central hub
      this.position.set(0, 4, 0);
      this.velocity.set(0, 0, 0);
      this.currentSpeed = 0;
      this.stats.health = Math.max(10, this.stats.health - 20);
      onParticleBurst(this.position, 0xff0000, 20);
    }

    // Stats updates
    this.stats.speed = this.currentSpeed;
    if (this.currentSpeed > this.stats.topSpeedReached) {
      this.stats.topSpeedReached = this.currentSpeed;
    }

    // Dynamic wind whoosh based on speed ratio
    soundFX.updateSpeedWhoosh(this.currentSpeed / this.maxSpeedLimit);
  }

  private checkFinishPlate(isGroundPound: boolean) {
    if (this.stats.isFinished) return;
    const fp = this.world.finishPlate;
    const dist = Math.hypot(this.position.x - fp.position.x, this.position.z - fp.position.z);

    if (dist < 3.8 && Math.abs(this.position.y - fp.position.y) < 1.6) {
      fp.isPressed = true;
      this.stats.isFinished = true;
      this.stats.score += isGroundPound ? 2500 : 1500;
      soundFX.playFinishVictory();
    }
  }

  private updateCurrentZone() {
    const x = this.position.x;
    const z = this.position.z;

    if (z > 20 && Math.abs(x) < 25) {
      this.stats.currentZone = 'plaines';
    } else if (x > 25 && z > 0) {
      this.stats.currentZone = 'plages';
    } else if (x > 25 && z < 0) {
      this.stats.currentZone = 'neiges';
    } else if (z < -30 && Math.abs(x) < 25) {
      this.stats.currentZone = 'montagnes';
    } else if (x < -25 && z < 0) {
      this.stats.currentZone = 'lave';
    } else if (x < -25 && z > 0) {
      this.stats.currentZone = 'aquatique';
    } else {
      this.stats.currentZone = 'plaines';
    }
  }

  public takeDamage(amount: number) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.state = 'hurt';
    soundFX.playEnemyHit();
    if (this.stats.health <= 0) {
      // Respawn
      this.reset();
    }
  }
}
