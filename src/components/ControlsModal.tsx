/**
 * Comprehensive controls and guide modal based on the handwritten design sheets
 */
import React from 'react';
import { X, Zap, ChevronRight, Shield, MapPin } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-neutral-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Noam Speeder - Guide & Commandes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves described in the drawing */}
        <div className="mt-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Mouvements & Parkour (Feuille 1)
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Déplacement de plus en plus rapide</span>
              <span className="font-mono font-bold text-amber-400 bg-neutral-900 px-2 py-1 rounded">Z Q S D / Flèches</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Triple Saut (1er, 2e, 3e plus HAUT)</span>
              <span className="font-mono font-bold text-cyan-400 bg-neutral-900 px-2 py-1 rounded">Espace (enchaîner en courant)</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Flotter pendant 1 sec (Yoshi / Pac-Man)</span>
              <span className="font-mono font-bold text-emerald-400 bg-neutral-900 px-2 py-1 rounded">Shift / F (maintenir en l'air)</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Accroupi + Saut = BACKFLIP</span>
              <span className="font-mono font-bold text-purple-400 bg-neutral-900 px-2 py-1 rounded">Ctrl / C + Espace</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Pouvoir Frapper (Coup de poing)</span>
              <span className="font-mono font-bold text-rose-400 bg-neutral-900 px-2 py-1 rounded">E / Clic Gauche</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Ground Pound (Pilonnage au sol)</span>
              <span className="font-mono font-bold text-orange-400 bg-neutral-900 px-2 py-1 rounded">Q (en l'air)</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-neutral-300 font-medium">Saut dans les airs (Double saut aérien)</span>
              <span className="font-mono font-bold text-yellow-400 bg-neutral-900 px-2 py-1 rounded">Espace en l'air</span>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mt-2">
            Monstres (Feuille 2)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-neutral-800/80 p-2.5 rounded-xl border border-white/5 flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <span className="font-bold text-emerald-400">Bloup :</span> Gelée verte hostile (comme un Goomba). Écrase-le d'un saut ou frappe-le !
              </div>
            </div>

            <div className="bg-neutral-800/80 p-2.5 rounded-xl border border-white/5 flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-neutral-400 mt-1 shrink-0" />
              <div>
                <span className="font-bold text-neutral-300">Goldonax :</span> Golem de pierre tourelle avec visière rouge. Reste sur place et projette des rochers incandescents !
              </div>
            </div>

            <div className="bg-neutral-800/80 p-2.5 rounded-xl border border-white/5 flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0" />
              <div>
                <span className="font-bold text-purple-400">Cornog :</span> Gobelin violet avec bandeau rouge. Charge violemment avec sa lance !
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mt-2">
            Objectif : Ligne d'Arrivée
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-800/80 p-2.5 rounded-xl border border-white/5">
            Atteins le sommet des montagnes et appuie sur le bouton circulaire estampillé d'une étoile (en marchant dessus ou avec un Ground Pound) pour valider ton chrono !
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-900 font-black text-sm tracking-wide transition-all shadow-md"
        >
          C'est parti !
        </button>
      </div>
    </div>
  );
};
