/**
 * Touch Virtual Controls for mobile & touch screen support
 */
import React, { useRef } from 'react';
import { InputState } from '../types';

interface TouchControlsProps {
  inputState: InputState;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ inputState }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    originRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - originRef.current.x;
        const dy = touch.clientY - originRef.current.y;
        const threshold = 18;

        inputState.forward = dy < -threshold;
        inputState.backward = dy > threshold;
        inputState.left = dx < -threshold;
        inputState.right = dx > threshold;

        if (joystickRef.current) {
          const clampedX = Math.max(-30, Math.min(30, dx));
          const clampedY = Math.max(-30, Math.min(30, dy));
          joystickRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    touchIdRef.current = null;
    inputState.forward = false;
    inputState.backward = false;
    inputState.left = false;
    inputState.right = false;
    if (joystickRef.current) {
      joystickRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex justify-between items-end p-6 select-none md:hidden">
      {/* Virtual Joystick */}
      <div
        className="pointer-events-auto w-32 h-32 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/20 flex items-center justify-center touch-none"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div
          ref={joystickRef}
          className="w-14 h-14 rounded-full bg-white/40 border border-white/60 shadow-lg pointer-events-none transition-transform duration-75"
        />
      </div>

      {/* Action Buttons Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-3 touch-none">
        <div className="flex gap-2">
          {/* Flutter Button (Flotter 1 sec) */}
          <button
            onTouchStart={() => (inputState.flutter = true)}
            onTouchEnd={() => (inputState.flutter = false)}
            className="w-14 h-14 rounded-full bg-cyan-500/80 active:bg-cyan-400 text-white font-bold text-xs flex flex-col items-center justify-center border border-white/30 shadow-lg"
          >
            <span>FLOTTER</span>
            <span className="text-[9px] opacity-75">1s</span>
          </button>

          {/* Punch Button (Frapper) */}
          <button
            onTouchStart={() => {
              inputState.punch = true;
              inputState.punchJustPressed = true;
            }}
            onTouchEnd={() => {
              inputState.punch = false;
              inputState.punchJustPressed = false;
            }}
            className="w-14 h-14 rounded-full bg-amber-500/80 active:bg-amber-400 text-white font-bold text-xs flex items-center justify-center border border-white/30 shadow-lg"
          >
            FRAPPER
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {/* Crouch Button (Accroupi) */}
          <button
            onTouchStart={() => (inputState.crouch = true)}
            onTouchEnd={() => (inputState.crouch = false)}
            className="w-14 h-14 rounded-full bg-purple-600/80 active:bg-purple-500 text-white font-bold text-xs flex items-center justify-center border border-white/30 shadow-lg"
          >
            BAISSER
          </button>

          {/* Ground Pound (Pilonnage) */}
          <button
            onTouchStart={() => (inputState.groundPound = true)}
            onTouchEnd={() => (inputState.groundPound = false)}
            className="w-14 h-14 rounded-full bg-rose-600/80 active:bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border border-white/30 shadow-lg text-center leading-tight"
          >
            GROUND<br />POUND
          </button>

          {/* Jump Button (Saut / Triple Saut / Backflip) */}
          <button
            onTouchStart={() => {
              inputState.jump = true;
              inputState.jumpJustPressed = true;
            }}
            onTouchEnd={() => {
              inputState.jump = false;
              inputState.jumpJustPressed = false;
            }}
            className="w-18 h-18 rounded-full bg-emerald-500/90 active:bg-emerald-400 text-white font-black text-sm flex items-center justify-center border-2 border-white/40 shadow-2xl"
          >
            SAUT
          </button>
        </div>
      </div>
    </div>
  );
};
