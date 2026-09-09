/**
 * Victory modal shown when stamping the finish switch (Image 2 design)
 */
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Gauge, Sparkles, ShieldAlert, RotateCcw, Compass } from 'lucide-react';
import { PlayerStats } from '../types';

interface VictoryModalProps {
  stats: PlayerStats;
  onRestart: () => void;
  onContinueFreeRoam: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onRestart,
  onContinueFreeRoam,
}) => {
  useEffect(() => {
    // Erupt victory fireworks
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const timeFormatted = `${Math.floor(stats.timeElapsed / 60)}m ${Math.floor(stats.timeElapsed % 60)}s`;
  const maxKmh = Math.round(stats.topSpeedReached * 3.6);

  // Compute rank grade
  let rank = 'B';
  let rankColor = 'text-blue-400 border-blue-400';
  if (stats.timeElapsed < 75 && stats.gemsCollected >= 10 && stats.monstersDefeated >= 3) {
    rank = 'S';
    rankColor = 'text-amber-400 border-amber-400 animate-pulse';
  } else if (stats.timeElapsed < 120 && stats.gemsCollected >= 6) {
    rank = 'A';
    rankColor = 'text-emerald-400 border-emerald-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Star Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          Ligne d'Arrivée Validée !
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">
          Tu as activé le bouton d'arrivée de Noam Speeder avec brio !
        </p>

        {/* Rank Grade Display */}
        <div className="my-4 flex items-center gap-3">
          <div className="text-sm font-semibold text-neutral-400">RANG ATTEINT :</div>
          <div className={`text-4xl font-black px-4 py-1 rounded-2xl border-2 ${rankColor}`}>
            {rank}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 my-2">
          <div className="flex items-center gap-2.5 bg-neutral-800/80 p-3 rounded-2xl border border-white/5">
            <Timer className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Temps Chrono</div>
              <div className="text-sm font-mono font-bold text-white">{timeFormatted}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-neutral-800/80 p-3 rounded-2xl border border-white/5">
            <Gauge className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Vitesse Max</div>
              <div className="text-sm font-mono font-bold text-white">{maxKmh} km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-neutral-800/80 p-3 rounded-2xl border border-white/5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Gemmes</div>
              <div className="text-sm font-mono font-bold text-white">{stats.gemsCollected}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-neutral-800/80 p-3 rounded-2xl border border-white/5">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Monstres Vaincus</div>
              <div className="text-sm font-mono font-bold text-white">{stats.monstersDefeated}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2 mt-4">
          <button
            id="victory-restart-btn"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recommencer le Parcours</span>
          </button>

          <button
            id="victory-freeroam-btn"
            onClick={onContinueFreeRoam}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Continuer en Exploration Libre</span>
          </button>
        </div>
      </div>
    </div>
  );
};
