/**
 * Noam Speeder - 3D Action & Speed Platformer
 * Faithful implementation of the handwritten design specifications
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { VictoryModal } from './components/VictoryModal';
import { ControlsModal } from './components/ControlsModal';
import { NoamCharacter } from './game/CharacterModel';
import { WorldBuilder } from './game/WorldBuilder';
import { MonsterManager } from './game/Monsters';
import { PhysicsEngine } from './game/PhysicsEngine';
import { CameraFollow } from './game/CameraFollow';
import { ParticleManager } from './game/Particles';
import { Environment } from './game/Environment';
import { soundFX } from './audio/SoundFX';
import { InputState, PlayerStats } from './types';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // React state for HUD
  const [stats, setStats] = useState<PlayerStats>({
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
  });

  const [jumpCount, setJumpCount] = useState<number>(0);
  const [flutterTimer, setFlutterTimer] = useState<number>(0);
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Refs to bridge Game Loop with React UI
  const engineRef = useRef<PhysicsEngine | null>(null);
  const isDraggingCamRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    crouch: false,
    flutter: false,
    punch: false,
    punchJustPressed: false,
    groundPound: false,
    cameraRotateX: 0,
    cameraRotateY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.007);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Dynamic Environment (Atmospheric Sky Dome, Moving Clouds, Sun Flare & Biome Lighting)
    const env = new Environment(scene);

    // Realistic ground contact shadow below Noam
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    sGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    scene.add(contactShadow);

    // 3. World Builder (6 biomes & Finish platform)
    const world = new WorldBuilder(scene);
    world.buildWorld();

    // 4. Monster Manager (Bloup, Goldonax, Cornog)
    const monsters = new MonsterManager(scene);

    // Spawn Bloups (Goomba-like slimes) in Plaines & Plages
    monsters.createBloup(0, 0, 30, 'bloup_1');
    monsters.createBloup(6, 0, 48, 'bloup_2');
    monsters.createBloup(38, -0.4, 20, 'bloup_3');

    // Spawn Goldonax (stationary stone turrets that throw boulders)
    monsters.createGoldonax(-40, 1.2, -30, 'goldonax_1');
    monsters.createGoldonax(0, 5.0, -48, 'goldonax_2');

    // Spawn Cornog (spear charging goblins)
    monsters.createCornog(-8, 0, 25, 'cornog_1');
    monsters.createCornog(-38, -0.6, 20, 'cornog_2');
    monsters.createCornog(35, 2.5, -25, 'cornog_3');

    // 5. Particles, Player Character & Camera
    const particles = new ParticleManager(scene);
    const noam = new NoamCharacter();
    scene.add(noam.group);

    const cameraFollow = new CameraFollow(60, container.clientWidth / container.clientHeight);
    const engine = new PhysicsEngine(world, monsters);
    engineRef.current = engine;

    // 6. Keyboard and Mouse Event Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();
      const input = inputRef.current;

      if (code === 'KeyW' || code === 'ArrowUp') input.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') input.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') input.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') input.right = true;

      // Jump
      if (code === 'Space') {
        if (!input.jump) input.jumpJustPressed = true;
        input.jump = true;
        e.preventDefault();
      }

      // Crouch (Accroupi)
      if (code === 'ControlLeft' || code === 'KeyC') {
        input.crouch = true;
      }

      // Flutter (Bouton pour flotter pendant 1 sec)
      if (code === 'ShiftLeft' || code === 'KeyF') {
        input.flutter = true;
      }

      // Melee Punch (Pouvoir frapper - EXACTEMENT 1 FOIS, no auto-repeat)
      if (code === 'KeyE' || code === 'KeyJ') {
        if (!e.repeat && !input.punch) {
          input.punchJustPressed = true;
          input.punch = true;
        }
      }

      // Ground Pound (Faire des Ground Pounds)
      if (code === 'KeyQ' || code === 'KeyK') {
        input.groundPound = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const input = inputRef.current;

      if (code === 'KeyW' || code === 'ArrowUp') input.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') input.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') input.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') input.right = false;

      if (code === 'Space') {
        input.jump = false;
        input.jumpJustPressed = false;
      }

      if (code === 'ControlLeft' || code === 'KeyC') input.crouch = false;
      if (code === 'ShiftLeft' || code === 'KeyF') input.flutter = false;
      if (code === 'KeyE' || code === 'KeyJ') {
        input.punch = false;
      }
      if (code === 'KeyQ' || code === 'KeyK') input.groundPound = false;
    };

    // Camera Orbit Mouse Drag & Single Click Detection
    let mouseStartPos = { x: 0, y: 0 };
    let hasMovedMouse = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target !== renderer.domElement) return;
      mouseStartPos = { x: e.clientX, y: e.clientY };
      hasMovedMouse = false;
      if (e.button === 0 || e.button === 2) {
        isDraggingCamRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCamRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        if (Math.hypot(e.clientX - mouseStartPos.x, e.clientY - mouseStartPos.y) > 5) {
          hasMovedMouse = true;
        }
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        cameraFollow.handleOrbit(dx, dy);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingCamRef.current) {
        // Trigger single punch tap only if the user didn't drag the camera
        if (e.button === 0 && !hasMovedMouse && e.target === renderer.domElement) {
          inputRef.current.punchJustPressed = true;
          inputRef.current.punch = true;
        }
      }
      isDraggingCamRef.current = false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // allow right mouse look
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraFollow.camera.aspect = width / height;
      cameraFollow.camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 7. Main Game Loop
    let lastTime = performance.now();
    let animationFrameId: number;
    let hudUpdateTimer = 0;

    const gameLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const delta = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      // Update Physics
      engine.update(
        delta,
        inputRef.current,
        cameraFollow.angleY,
        intensity => cameraFollow.addShake(intensity),
        (pos, color, count) => {
          if (count > 25) {
            particles.emitGroundPoundRing(pos);
          } else {
            particles.burst(pos, color, count);
          }
        }
      );

      // Speed ribbons and dust trails
      const speedRatio = engine.currentSpeed / engine.maxSpeedLimit;
      if (engine.isGrounded && engine.currentSpeed > 6) {
        particles.emitSpeedRibbon(engine.position, engine.rotation, speedRatio);
      }

      // Update Character 3D Model position & animation
      noam.group.position.copy(engine.position);
      noam.group.rotation.y = engine.rotation;
      noam.updateAnimation(
        delta,
        engine.state,
        engine.currentSpeed,
        engine.maxSpeedLimit,
        engine.isGrounded
      );

      // Update dynamic atmosphere (sky dome, drifting clouds, sun flare & biome lighting)
      env.setZone(engine.stats.currentZone);
      env.update(delta, engine.position);

      // Update ground contact shadow below Noam
      contactShadow.position.set(engine.position.x, Math.max(0.02, engine.position.y - 0.95), engine.position.z);
      const heightAboveFloor = Math.max(0, engine.position.y - 1.0);
      const shadowScale = Math.min(2.4, 1.0 + heightAboveFloor * 0.25);
      contactShadow.scale.set(shadowScale, shadowScale, 1);
      (contactShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, 0.65 - heightAboveFloor * 0.12);

      // Update World animations & dynamic objects
      world.update(delta);

      // Update Monsters AI & combat
      monsters.update(
        delta,
        engine.position,
        () => engine.takeDamage(15),
        (pos, color) => particles.burst(pos, color, 12)
      );

      // Update Particles
      particles.update(delta);

      // Update Follow Camera
      cameraFollow.update(
        delta,
        engine.position,
        engine.currentSpeed,
        engine.maxSpeedLimit,
        engine.rotation
      );

      // Render 3D Frame
      renderer.render(scene, cameraFollow.camera);

      // Reset single-frame input flags
      inputRef.current.jumpJustPressed = false;
      inputRef.current.punchJustPressed = false;

      // Throttle HUD state synchronization for high performance 60fps
      hudUpdateTimer += delta;
      if (hudUpdateTimer > 0.04) {
        hudUpdateTimer = 0;
        setStats({ ...engine.stats });
        setJumpCount(engine.jumpCount);
        setFlutterTimer(engine.flutterTimer);
        setIsGrounded(engine.isGrounded);
        setPlayerPos({ x: engine.position.x, y: engine.position.y, z: engine.position.z });

        if (engine.stats.isFinished && !showVictory) {
          setShowVictory(true);
        }
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setShowVictory(false);
    }
  };

  const handleContinueFreeRoam = () => {
    setShowVictory(false);
  };

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* Three.js 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Game HUD (Speedometer, Health, Zones, Minimap) */}
      <GameHUD
        stats={stats}
        jumpCount={jumpCount}
        flutterTimer={flutterTimer}
        maxFlutterDuration={1.0}
        isGrounded={isGrounded}
        playerPos={playerPos}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenControls={() => setShowControls(true)}
      />

      {/* Touch Screen Virtual Joystick & Buttons */}
      <TouchControls inputState={inputRef.current} />

      {/* Victory Celebration Modal */}
      {showVictory && (
        <VictoryModal
          stats={stats}
          onRestart={handleRestart}
          onContinueFreeRoam={handleContinueFreeRoam}
        />
      )}

      {/* Controls & Monster Guide Modal */}
      <ControlsModal isOpen={showControls} onClose={() => setShowControls(false)} />
    </div>
  );
}
