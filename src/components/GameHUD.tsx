/**
 * Real-time HUD displaying Speedometer, Triple Jump tracker, Flutter gauge, Health, Zone info & Minimap
 */
import React from 'react';
import { PlayerStats, ZoneInfo } from '../types';
import { ZONES } from '../game/WorldBuilder';
import { Gauge, Heart, Sparkles, Trophy, Compass, ShieldAlert, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  jumpCount: number;
  flutterTimer: number;
  maxFlutterDuration: number;
  isGrounded: boolean;
  playerPos: { x: number; y: number; z: number };
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenControls: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  jumpCount,
  flutterTimer,
  maxFlutterDuration,
  isGrounded,
  playerPos,
  isMuted,
  onToggleMute,
  onOpenControls,
}) => {
  const currentZoneInfo: ZoneInfo = ZONES[stats.currentZone] || ZONES.plaines;
  const speedKmh = Math.round(stats.speed * 3.6); // m/s to km/h
  const maxKmh = Math.round(stats.maxSpeed * 3.6);
  const speedPercent = Math.min(100, Math.round((stats.speed / stats.maxSpeed) * 100));

  // Flutter remaining percentage
  const flutterPercent = Math.max(0, Math.round((1 - flutterTimer / maxFlutterDuration) * 100));

  // Minimap normalized coords (-60 to +60 mapped to 0 to 100%)
  const mapX = Math.max(5, Math.min(95, ((playerPos.x + 65) / 130) * 100));
  const mapY = Math.max(5, Math.min(95, ((playerPos.z + 85) / 150) * 100));

  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-4 select-none">
      {/* High-Speed Aerodynamic Wind Tunnel Vignette */}
      {speedPercent > 45 && (
        <div
          className="pointer-events-none fixed inset-0 transition-opacity duration-150"
          style={{
            opacity: ((speedPercent - 45) / 55) * 0.75,
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(56, 189, 248, 0.25) 85%, rgba(251, 146, 60, 0.4) 100%)',
            boxShadow: 'inset 0 0 100px rgba(0, 245, 212, 0.4)',
          }}
        />
      )}

      {/* Top Bar: Zone, Health, Score, Mute */}
      <div className="flex items-start justify-between">
        {/* Current Zone Badge */}
        <div className="flex flex-col gap-1.5">
          <div
            id="hud-zone-badge"
            className="flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-md border border-white/20 shadow-lg text-white font-bold text-sm tracking-wide transition-all"
            style={{ backgroundColor: `${currentZoneInfo.accentColor}33` }}
          >
            <Compass className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>{currentZoneInfo.name}</span>
          </div>

          {/* Health Bar */}
          <div id="hud-health-bar" className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 w-48 shadow">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
                style={{ width: `${stats.health}%` }}
              />
            </div>
            <span className="text-xs font-mono text-white font-semibold">{stats.health}</span>
          </div>
        </div>

        {/* Top Right: Gems, Monsters, Audio & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow text-cyan-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{stats.gemsCollected}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow text-purple-300 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>{stats.monstersDefeated}</span>
          </div>

          <button
            id="hud-mute-btn"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-all shadow"
            title="Couper / Activer le son"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="hud-help-btn"
            onClick={onOpenControls}
            className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-all shadow"
            title="Aide et Contrôles"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Center Screen: Parkour Status alerts (Triple jump, flutter active) */}
      <div className="flex flex-col items-center justify-center pointer-events-none gap-2">
        {jumpCount === 3 && (
          <div className="animate-bounce text-amber-300 font-extrabold text-2xl tracking-wider drop-shadow-[0_2px_10px_rgba(255,183,3,0.8)]">
            TRIPLE SAUT SUPRÊME ! ⚡
          </div>
        )}
        {jumpCount === 2 && (
          <div className="text-cyan-300 font-bold text-lg tracking-wide drop-shadow-md">
            DOUBLE SAUT !
          </div>
        )}
      </div>

      {/* Bottom Row: Speedometer & Minimap */}
      <div className="flex items-end justify-between">
        {/* Speedometer (Vitesse de plus en plus rapide avec limite) */}
        <div id="hud-speedometer" className="flex flex-col bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/15 shadow-2xl w-64">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-semibold uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Vitesse Noam</span>
            </div>
            {speedPercent > 80 && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/50 animate-pulse">
                MAX ACCEL !
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono tracking-tight text-white">
              {speedKmh}
            </span>
            <span className="text-xs font-semibold text-neutral-400">km/h</span>
            <span className="text-xs font-mono text-neutral-500 ml-auto">
              Max: {maxKmh}
            </span>
          </div>

          {/* Dynamic Speed Bar */}
          <div className="w-full bg-neutral-800 rounded-full h-2.5 mt-2 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-100 ${
                speedPercent > 85
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              style={{ width: `${speedPercent}%` }}
            />
          </div>

          {/* Flutter Duration Indicator */}
          {!isGrounded && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-200">
              <span>Flottaison (Yoshi 1s):</span>
              <div className="w-20 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${flutterPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tactical Minimap of the 6 Zones from Image 1 */}
        <div id="hud-minimap" className="relative w-36 h-36 bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 p-2 shadow-2xl overflow-hidden">
          <div className="text-[9px] font-bold text-center text-neutral-400 tracking-wider uppercase mb-1">
            Carte du Monde
          </div>

          {/* Zone sectors sketched on Image 1 */}
          <div className="relative w-full h-24 rounded-lg bg-neutral-900/90 border border-white/10 overflow-hidden text-[7px] font-semibold">
            {/* Plaines (South) */}
            <div className="absolute bottom-1 left-7 text-emerald-400 opacity-70">Plaines</div>
            {/* Plages (South-East) */}
            <div className="absolute bottom-2 right-1 text-amber-300 opacity-70">Plage</div>
            {/* Neiges (North-East) */}
            <div className="absolute top-2 right-1 text-blue-300 opacity-70">Neige 8</div>
            {/* Montagnes (North) */}
            <div className="absolute top-1 left-8 text-neutral-300 opacity-70">Monts</div>
            {/* Lave (North-West) */}
            <div className="absolute top-2 left-1 text-orange-400 opacity-70">Lave</div>
            {/* Aquatique (West) */}
            <div className="absolute bottom-2 left-1 text-cyan-300 opacity-70">Eau</div>

            {/* Finish Plate Goal Marker */}
            <div className="absolute top-1 left-12 w-2 h-2 rounded-full bg-amber-400 border border-white animate-ping" />
            <div className="absolute top-1 left-12 w-2 h-2 rounded-full bg-amber-400 border border-white" title="Arrivée" />

            {/* Player Blip */}
            <div
              className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-rose-500 border-2 border-white shadow-md z-10 transition-all duration-75"
              style={{
                left: `${mapX}%`,
                top: `${mapY}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
